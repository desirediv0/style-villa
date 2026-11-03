/**
 * Shiprocket Admin Controller
 * Handles admin operations for Shiprocket integration
 */

import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import { prisma } from "../config/db.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import {
    authenticate,
    getShiprocketSettings,
    checkServiceability,
    processOrderForShipping,
    trackShipment,
    trackByOrderId,
    cancelShiprocketOrder,
    generateLabel,
    printInvoice,
    getPickupLocations,
    addPickupLocation,
    mapShiprocketStatus,
} from "../utils/shiprocket.js";
import { createPartnerEarningsForDeliveredOrder } from "../utils/partnerEarnings.js";
import { notifyOrderStatus } from "../utils/orderNotifications.js";

// Get Shiprocket settings
export const getSettings = asyncHandler(async (req, res) => {
    const settings = await getShiprocketSettings();

    // Mask password for security
    const maskedSettings = {
        ...settings,
        password: settings.password ? "********" : null,
        token: settings.token ? "********" : null,
    };

    res.status(200).json(
        new ApiResponsive(200, { settings: maskedSettings }, "Settings fetched successfully")
    );
});

// Update Shiprocket settings
export const updateSettings = asyncHandler(async (req, res) => {
    const {
        isEnabled,
        email,
        password,
        defaultLength,
        defaultBreadth,
        defaultHeight,
        defaultWeight,
        shippingCharge,
        freeShippingThreshold,
    } = req.body;

    const settings = await getShiprocketSettings();

    const updateData = {};

    if (typeof isEnabled === "boolean") {
        updateData.isEnabled = isEnabled;
    }

    if (email !== undefined) {
        updateData.email = email.trim();
    }

    if (password && password !== "********") {
        // Encrypt password before storing
        updateData.password = "enc:" + encrypt(password.trim());
        // Clear token to force re-authentication
        updateData.token = null;
        updateData.tokenExpiry = null;
    }

    if (defaultLength !== undefined) {
        updateData.defaultLength = parseFloat(defaultLength);
    }
    if (defaultBreadth !== undefined) {
        updateData.defaultBreadth = parseFloat(defaultBreadth);
    }
    if (defaultHeight !== undefined) {
        updateData.defaultHeight = parseFloat(defaultHeight);
    }
    if (defaultWeight !== undefined) {
        updateData.defaultWeight = parseFloat(defaultWeight);
    }

    if (shippingCharge !== undefined) {
        updateData.shippingCharge = parseFloat(shippingCharge);
    }

    if (freeShippingThreshold !== undefined) {
        updateData.freeShippingThreshold = parseFloat(freeShippingThreshold);
    }

    updateData.updatedBy = req.admin?.id;

    const updatedSettings = await prisma.shiprocketSettings.update({
        where: { id: settings.id },
        data: updateData,
    });

    // Mask sensitive data
    const maskedSettings = {
        ...updatedSettings,
        password: updatedSettings.password ? "********" : null,
        token: updatedSettings.token ? "********" : null,
    };

    res.status(200).json(
        new ApiResponsive(200, { settings: maskedSettings }, "Settings updated successfully")
    );
});

// Test Shiprocket connection
export const testConnection = asyncHandler(async (req, res) => {
    try {
        const token = await authenticate();

        if (token) {
            res.status(200).json(
                new ApiResponsive(200, { connected: true }, "Connection successful")
            );
        } else {
            throw new Error("Failed to get authentication token");
        }
    } catch (error) {
        throw new ApiError(400, `Connection failed: ${error.message}`);
    }
});

// Get all pickup addresses
export const getPickupAddresses = asyncHandler(async (req, res) => {
    const addresses = await prisma.shiprocketPickupAddress.findMany({
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json(
        new ApiResponsive(200, { addresses }, "Pickup addresses fetched successfully")
    );
});

// Create pickup address
export const createPickupAddress = asyncHandler(async (req, res) => {
    const {
        nickname,
        name,
        email,
        phone,
        address,
        address2,
        city,
        state,
        country,
        pincode,
        isDefault,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // If setting as default, unset other defaults
    if (isDefault) {
        await prisma.shiprocketPickupAddress.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
        });
    }

    const pickupAddress = await prisma.shiprocketPickupAddress.create({
        data: {
            nickname: nickname || "Warehouse",
            name,
            email,
            phone,
            address,
            address2: address2 || null,
            city,
            state,
            country: country || "India",
            pincode,
            isDefault: isDefault ?? true,
        },
    });

    res.status(201).json(
        new ApiResponsive(201, { address: pickupAddress }, "Pickup address created successfully")
    );
});

// Update pickup address
export const updatePickupAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await prisma.shiprocketPickupAddress.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new ApiError(404, "Pickup address not found");
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
        await prisma.shiprocketPickupAddress.updateMany({
            where: { isDefault: true, id: { not: id } },
            data: { isDefault: false },
        });
    }

    const updated = await prisma.shiprocketPickupAddress.update({
        where: { id },
        data: updateData,
    });

    res.status(200).json(
        new ApiResponsive(200, { address: updated }, "Pickup address updated successfully")
    );
});

// Delete pickup address
export const deletePickupAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.shiprocketPickupAddress.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new ApiError(404, "Pickup address not found");
    }

    await prisma.shiprocketPickupAddress.delete({
        where: { id },
    });

    res.status(200).json(
        new ApiResponsive(200, null, "Pickup address deleted successfully")
    );
});

// Check serviceability for an order
export const checkOrderServiceability = asyncHandler(async (req, res) => {
    const { pickupPincode, deliveryPincode, weight, cod } = req.body;

    if (!pickupPincode || !deliveryPincode || !weight) {
        throw new ApiError(400, "Pickup pincode, delivery pincode, and weight are required");
    }

    const result = await checkServiceability({
        pickupPincode,
        deliveryPincode,
        weight: parseFloat(weight),
        cod: cod || false,
    });

    res.status(200).json(
        new ApiResponsive(200, { serviceability: result }, "Serviceability checked successfully")
    );
});

// Sync order to Shiprocket
export const syncOrderToShiprocket = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.shiprocketOrderId) {
        throw new ApiError(400, "Order already synced to Shiprocket");
    }

    const result = await processOrderForShipping(orderId);

    if (!result) {
        throw new ApiError(400, "Shiprocket is disabled or configuration is missing");
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketOrderId: true,
            shiprocketShipmentId: true,
            awbCode: true,
            courierName: true,
            shiprocketStatus: true,
        },
    });

    res.status(200).json(
        new ApiResponsive(200, { order: updatedOrder, shiprocketResponse: result }, "Order synced to Shiprocket successfully")
    );
});

// Get tracking info for an order
export const getOrderTracking = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            awbCode: true,
            shiprocketOrderId: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let trackingData = null;

    if (order.awbCode) {
        trackingData = await trackShipment(order.awbCode);
    } else if (order.shiprocketOrderId) {
        trackingData = await trackByOrderId(order.shiprocketOrderId);
    } else {
        throw new ApiError(400, "Order not yet synced to Shiprocket");
    }

    res.status(200).json(
        new ApiResponsive(200, { tracking: trackingData }, "Tracking info fetched successfully")
    );
});

// Cancel Shiprocket shipment
export const cancelShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketOrderId: true,
            shiprocketStatus: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.shiprocketOrderId) {
        throw new ApiError(400, "Order not synced to Shiprocket");
    }

    const result = await cancelShiprocketOrder(order.shiprocketOrderId);

    await prisma.order.update({
        where: { id: orderId },
        data: {
            shiprocketStatus: "CANCELLED",
        },
    });

    res.status(200).json(
        new ApiResponsive(200, { result }, "Shipment cancelled successfully")
    );
});

// Get shipping label for order
export const getShippingLabel = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketShipmentId: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.shiprocketShipmentId) {
        throw new ApiError(400, "Order not synced to Shiprocket");
    }

    const result = await generateLabel(order.shiprocketShipmentId);

    res.status(200).json(
        new ApiResponsive(200, { label: result }, "Shipping label generated successfully")
    );
});

// Get invoice for order
export const getOrderInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            shiprocketOrderId: true,
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.shiprocketOrderId) {
        throw new ApiError(400, "Order not synced to Shiprocket");
    }

    const result = await printInvoice(order.shiprocketOrderId);

    res.status(200).json(
        new ApiResponsive(200, { invoice: result }, "Invoice generated successfully")
    );
});

// Webhook handler for Shiprocket tracking updates
// Shiprocket sends the token configured in its dashboard in the `x-api-key` header.
const STATUS_RANK = { PENDING: 0, PROCESSING: 1, PAID: 2, SHIPPED: 3, DELIVERED: 4 };

export const handleWebhook = asyncHandler(async (req, res) => {
    const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    if (expected) {
        const got = String(req.headers["x-api-key"] || "");
        const a = Buffer.from(got);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            throw new ApiError(401, "Invalid webhook token");
        }
    } else {
        console.warn("SHIPROCKET_WEBHOOK_TOKEN is not set - accepting Shiprocket webhook without authentication");
    }

    const {
        awb,
        current_status,
        current_status_id,
        order_id,
        sr_order_id,
        courier_name,
        etd,
        scans,
    } = req.body || {};

    // Find order by AWB code, Shiprocket order ID or our order number
    let order = null;
    const include = { tracking: true };

    if (awb) {
        order = await prisma.order.findFirst({ where: { awbCode: String(awb) }, include });
    }
    if (!order && sr_order_id) {
        order = await prisma.order.findFirst({ where: { shiprocketOrderId: String(sr_order_id) }, include });
    }
    if (!order && order_id) {
        // order_id from the webhook is "orderNumber" (or "orderNumber_suffix")
        const orderNumber = String(order_id).split("_")[0];
        order = await prisma.order.findUnique({ where: { orderNumber }, include });
    }

    if (!order) {
        console.log("Order not found for webhook:", { awb, order_id, sr_order_id });
        // Return success anyway to prevent retries
        return res.status(200).json({ status: "ok" });
    }

    const mapped = mapShiprocketStatus(current_status, current_status_id);
    const updateData = {};
    if (current_status) updateData.shiprocketStatus = String(current_status);
    if (courier_name) updateData.courierName = courier_name;
    if (awb && !order.awbCode) updateData.awbCode = String(awb);

    // Never move an order backwards (late webhooks) and never touch a finished order
    const terminal = ["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status);
    let newOrderStatus = null;
    if (mapped && !terminal) {
        const target = mapped.orderStatus;
        const forward =
            target === "CANCELLED" || (STATUS_RANK[target] ?? -1) > (STATUS_RANK[order.status] ?? -1);
        if (forward) newOrderStatus = target;
    }
    if (newOrderStatus) updateData.status = newOrderStatus;

    const shipmentStatus = mapped?.shipmentStatus || null;
    const etdDate = etd ? new Date(etd) : null;
    const validEtd = etdDate && !isNaN(etdDate.getTime()) ? etdDate : null;

    await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: order.id }, data: updateData });

        const trackingNumber = String(awb || order.awbCode || "");
        const carrier = courier_name || order.courierName || "";
        let tracking = order.tracking;

        if (!tracking && trackingNumber) {
            tracking = await tx.tracking.create({
                data: {
                    orderId: order.id,
                    trackingNumber,
                    carrier,
                    status: shipmentStatus || "PROCESSING",
                    estimatedDelivery: validEtd,
                    shippedAt: shipmentStatus && shipmentStatus !== "PROCESSING" ? new Date() : null,
                    deliveredAt: shipmentStatus === "DELIVERED" ? new Date() : null,
                },
            });
        } else if (tracking && shipmentStatus && tracking.status !== "DELIVERED") {
            tracking = await tx.tracking.update({
                where: { orderId: order.id },
                data: {
                    status: shipmentStatus,
                    ...(trackingNumber && { trackingNumber }),
                    ...(carrier && { carrier }),
                    ...(validEtd && { estimatedDelivery: validEtd }),
                    ...(!tracking.shippedAt && shipmentStatus !== "PROCESSING" && { shippedAt: new Date() }),
                    ...(shipmentStatus === "DELIVERED" && { deliveredAt: new Date() }),
                },
            });
        }

        // Store scan history without duplicates
        if (tracking && Array.isArray(scans) && scans.length) {
            const existing = await tx.trackingUpdate.findMany({
                where: { trackingId: tracking.id },
                select: { description: true, location: true, timestamp: true },
            });
            const seen = new Set(
                existing.map((u) => `${u.description || ""}|${u.location || ""}|${u.timestamp.getTime()}`)
            );
            for (const scan of scans) {
                const when = new Date(scan.date || scan.timestamp || Date.now());
                const ts = isNaN(when.getTime()) ? new Date() : when;
                const description = scan.activity || scan["sr-status-label"] || scan.status || current_status || "";
                const location = scan.location || "";
                const key = `${description}|${location}|${ts.getTime()}`;
                if (seen.has(key)) continue;
                seen.add(key);
                const scanMapped = mapShiprocketStatus(scan["sr-status-label"] || scan.status || scan.activity, scan["sr-status"]);
                await tx.trackingUpdate.create({
                    data: {
                        trackingId: tracking.id,
                        status: scanMapped?.shipmentStatus || shipmentStatus || tracking.status,
                        location,
                        description,
                        timestamp: ts,
                    },
                });
            }
        }

        if (newOrderStatus === "DELIVERED") {
            await createPartnerEarningsForDeliveredOrder(tx, order.id);
        }
    });

    // Emails only when the status really changed
    if (newOrderStatus && ["SHIPPED", "DELIVERED", "CANCELLED"].includes(newOrderStatus)) {
        notifyOrderStatus(order.id, newOrderStatus, {
            awbCode: awb || order.awbCode,
            courierName: courier_name || order.courierName,
        }).catch(() => {});
    }

    res.status(200).json({ status: "ok" });
});
