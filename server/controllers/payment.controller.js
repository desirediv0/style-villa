import crypto from "crypto";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getFileUrl } from "../utils/deleteFromS3.js";
import { processReferralReward } from "./referral.controller.js";
import { processOrderForShipping } from "../utils/shiprocket.js";
import { getPaymentGatewayConfig, toPaise, razorpayErrorMessage } from "../utils/razorpayClient.js";
import { buildCheckoutSummary } from "../utils/pricing.js";
import { notifyNewOrder, notifyAdminAttention } from "../utils/orderNotifications.js";
import { cancelOrderForCustomer } from "../utils/orderCancel.js";

// Get payment settings (public endpoint for checkout page)
export const getPaymentSettings = asyncHandler(async (req, res) => {
  // Get or create payment settings (singleton)
  let paymentSettings = await prisma.paymentSettings.findFirst();

  // If no settings exist, create default ones
  if (!paymentSettings) {
    paymentSettings = await prisma.paymentSettings.create({
      data: {
        cashEnabled: true,
        razorpayEnabled: false,
        codCharge: 0,
      },
    });
  }

  // Check if payment gateway keys are configured
  // For now, we'll check for any active payment gateway settings
  // In a multi-merchant system, we might need to check for the order owner's keys
  // For now, checking if any admin has configured keys

  // Check Razorpay keys
  const razorpaySettings = await prisma.paymentGatewaySetting.findFirst({
    where: {
      gateway: "RAZORPAY",
      isActive: true,
      razorpayKeyId: { not: null },
      razorpayKeySecret: { not: null },
    },
  });

  // Check PhonePe keys
  const phonepeSettings = await prisma.paymentGatewaySetting.findFirst({
    where: {
      gateway: "PHONEPE",
      isActive: true,
      phonepeMerchantId: { not: null },
      phonepeSaltKey: { not: null },
      phonepeSaltIndex: { not: null },
    },
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        cashEnabled: paymentSettings.cashEnabled,
        razorpayEnabled: paymentSettings.razorpayEnabled && !!razorpaySettings,
        phonepeEnabled: !!phonepeSettings,
        codCharge: parseFloat(paymentSettings.codCharge) || 0,
      },
      "Payment settings fetched successfully"
    )
  );
});

// Get Razorpay Key (from DB for the user)
export const getRazorpayKey = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const paymentConfig = await getPaymentGatewayConfig(userId, "RAZORPAY");

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { key: paymentConfig.paymentSettings.razorpayKeyId || null },
        "Razorpay key fetched successfully"
      )
    );
});

// ---------------------------------------------------------------------------
// Placing an order (shared by online payment and Cash on Delivery)
// ---------------------------------------------------------------------------

const newOrderNumber = () => `ORD-${Date.now()}-${crypto.randomInt(0, 10000)}`;

/**
 * Turns a checked-out cart into an order inside the given transaction.
 *
 * The cart rows are removed FIRST and the count is checked: if another request (a double click, a second
 * tab, a repeated callback) already took this cart, nothing is created here and the transaction is undone.
 * Stock is taken with a guarded update, so the last unit can only be sold once, and a coupon's usage count
 * is increased atomically so its usage limit really holds.
 */
async function createOrderInTransaction(tx, { userId, summary, orderFields, shippingAddressId, billingAddressSameAsShipping, billingAddress, notes, payment }) {
  const claimed = await tx.cartItem.deleteMany({
    where: { id: { in: summary.cartItems.map((c) => c.id) } },
  });
  if (claimed.count !== summary.cartItems.length) {
    throw new ApiError(409, "Your cart changed or was already ordered");
  }

  if (summary.coupon) {
    const used = await tx.coupon.updateMany({
      where: {
        id: summary.coupon.id,
        isActive: true,
        ...(summary.coupon.maxUses ? { usedCount: { lt: summary.coupon.maxUses } } : {}),
      },
      data: { usedCount: { increment: 1 } },
    });
    if (used.count === 0) throw new ApiError(400, "Coupon usage limit exceeded");
  }

  const order = await tx.order.create({
    data: {
      orderNumber: newOrderNumber(),
      userId,
      subTotal: summary.subTotal.toFixed(2),
      tax: summary.tax.toFixed(2),
      shippingCost: summary.shippingCost.toFixed(2),
      discount: summary.discount.toFixed(2),
      codCharge: summary.codCharge.toFixed(2),
      total: summary.total.toFixed(2),
      shippingAddressId,
      billingAddressSameAsShipping,
      billingAddress: !billingAddressSameAsShipping ? billingAddress : undefined,
      notes,
      couponCode: summary.coupon?.code ?? null,
      couponId: summary.coupon?.id ?? null,
      ...orderFields,
    },
  });

  let paymentRow = null;
  if (payment) {
    paymentRow = await tx.razorpayPayment.create({
      data: {
        orderId: order.id,
        amount: summary.total.toFixed(2),
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        razorpaySignature: payment.razorpaySignature,
        status: "CAPTURED",
        paymentMethod: payment.paymentMethod,
        notes: payment.details,
      },
    });
  }

  for (const line of summary.items) {
    const taken = await tx.productVariant.updateMany({
      where: { id: line.variantId, quantity: { gte: line.quantity } },
      data: { quantity: { decrement: line.quantity } },
    });
    if (taken.count === 0) throw new ApiError(400, `Not enough stock for ${line.name}`);

    const after = await tx.productVariant.findUnique({ where: { id: line.variantId }, select: { quantity: true } });

    await tx.orderItem.create({
      data: {
        orderId: order.id,
        productId: line.productId,
        variantId: line.variantId,
        price: line.price,
        quantity: line.quantity,
        subtotal: line.lineTotal,
        ...(line.flashSale
          ? {
            flashSaleId: line.flashSale.flashSaleId,
            flashSaleName: line.flashSale.name,
            flashSaleDiscount: line.flashSale.discountPercentage,
            originalPrice: line.flashSale.originalPrice,
          }
          : {}),
      },
    });

    if (line.flashSale) {
      await tx.flashSale.update({
        where: { id: line.flashSale.flashSaleId },
        data: { soldCount: { increment: line.quantity } },
      });
    }

    await tx.inventoryLog.create({
      data: {
        variantId: line.variantId,
        quantityChange: -line.quantity,
        reason: "sale",
        referenceId: order.id,
        previousQuantity: after.quantity + line.quantity,
        newQuantity: after.quantity,
        createdBy: userId,
      },
    });
  }

  return { order, payment: paymentRow };
}

// Everything that happens after the order is safely saved. None of it can undo the order.
function afterOrderPlaced(orderId, userId) {
  processReferralReward(orderId, userId).catch((err) => console.error("Referral reward processing error:", err));
  // Creates the shipment in Shiprocket; if it fails the admin can sync the order manually
  processOrderForShipping(orderId).catch((err) => console.error("Shiprocket order processing error:", err));
  notifyNewOrder(orderId); // customer confirmation + store alert; e-mail problems are logged, never thrown
}

// ---------------------------------------------------------------------------
// Online payment (Razorpay)
// ---------------------------------------------------------------------------

// Create Razorpay order
export const checkout = asyncHandler(async (req, res) => {
  const { couponCode, couponId, paymentGateway = "RAZORPAY" } = req.body;
  const userId = req.user.id;

  // Support RAZORPAY only (PhonePe temporarily disabled)
  if (String(paymentGateway).toUpperCase() !== "RAZORPAY") {
    throw new ApiError(400, "Only RAZORPAY is currently supported for checkout");
  }

  // Payment gateway keys come from the database (the store owner's keys)
  const paymentConfig = await getPaymentGatewayConfig(userId, paymentGateway);

  // The amount is worked out HERE from the saved cart, the same way the cart page does it.
  // A total (or discount) sent by the browser is never trusted: that is what the customer is charged.
  const summary = await buildCheckoutSummary(prisma, userId, { couponId, couponCode, paymentMethod: "ONLINE" });
  const amountInPaise = Math.max(toPaise(summary.total), 100); // Razorpay's minimum is Rs1

  // Receipt id must be 40 characters or fewer
  const receipt = `rcpt_${Date.now().toString().slice(-10)}_${userId.slice(-4)}`;

  const notes = {
    userId,
    paymentGateway: paymentConfig.paymentSettings.gateway,
    paymentMode: paymentConfig.paymentSettings.mode,
    paymentOwnerId: paymentConfig.paymentSettings.userId,
  };
  if (summary.coupon) {
    notes.couponCode = summary.coupon.code;
    notes.couponId = summary.coupon.id;
    notes.discountAmount = summary.discount;
  }

  let order;
  try {
    order = await paymentConfig.razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new ApiError(500, razorpayErrorMessage(error));
  }

  if (!order) {
    throw new ApiError(500, "Error creating Razorpay order");
  }

  res.status(200).json(new ApiResponsive(200, { ...order, couponData: notes }, "Order created successfully"));
});

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

// The payment is already attached to an order: answer with that order, so a retry is harmless
const findPaymentRecord = (razorpayOrderId, razorpayPaymentId) =>
  prisma.razorpayPayment.findFirst({
    where: { OR: [{ razorpayPaymentId }, { razorpayOrderId }] },
    include: { order: true },
  });

/**
 * A valid, captured payment that cannot become an order (cart already ordered, item sold out, price changed,
 * amount mismatch...) is refunded automatically, and the store is told if even that fails.
 */
async function refundUnfulfilledPayment({ paymentConfig, razorpayPaymentId, amountPaise, reason, userId }) {
  let outcome;
  try {
    const refund = await paymentConfig.razorpayInstance.payments.refund(razorpayPaymentId, {
      amount: amountPaise,
      notes: { reason },
    });
    outcome = { ok: true, refundId: refund?.id };
  } catch (error) {
    outcome = { ok: false, error: razorpayErrorMessage(error) };
  }

  await prisma.activityLog
    .create({
      data: {
        entityType: "payment",
        entityId: razorpayPaymentId,
        action: outcome.ok ? "auto_refund" : "auto_refund_failed",
        description: `${reason}. ${outcome.ok ? `Refunded Rs${amountPaise / 100} (refund ${outcome.refundId}).` : `Automatic refund failed: ${outcome.error}`}`,
        performedBy: userId,
        performedByRole: "system",
      },
    })
    .catch(() => { });

  if (!outcome.ok) {
    notifyAdminAttention(`ACTION NEEDED: refund payment ${razorpayPaymentId}`, [
      `A customer paid Rs${amountPaise / 100} (Razorpay payment ${razorpayPaymentId}) but the order could not be created: ${reason}.`,
      `The automatic refund failed (${outcome.error}). Please refund this payment from the Razorpay dashboard.`,
    ]);
  }
  return outcome;
}

// Verify payment and create order
export const paymentVerification = asyncHandler(async (req, res) => {
  // Extract parameters with fallbacks for both snake_case and camelCase formats
  const razorpay_order_id = req.body.razorpay_order_id || req.body.razorpayOrderId;
  const razorpay_payment_id = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
  const razorpay_signature = req.body.razorpay_signature || req.body.razorpaySignature;
  const { shippingAddressId, billingAddressSameAsShipping = true, billingAddress, notes } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment details");
  }
  if (!shippingAddressId) {
    throw new ApiError(400, "Shipping address is required");
  }

  const userId = req.user.id;

  let paymentConfig;
  try {
    paymentConfig = await getPaymentGatewayConfig(userId, req.body.paymentGateway || "RAZORPAY");
  } catch (error) {
    throw new ApiError(400, error.message || "Payment gateway not configured");
  }
  const { razorpayInstance } = paymentConfig;

  // Signature: proves the browser really got this payment from Razorpay
  const expectedSignature = crypto
    .createHmac("sha256", paymentConfig.paymentSettings.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (!safeEqual(expectedSignature, razorpay_signature)) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const respondWithExisting = (existing) =>
    res.status(200).json(
      new ApiResponsive(
        200,
        { orderId: existing.orderId, orderNumber: existing.order.orderNumber, paymentId: existing.id, alreadyProcessed: true },
        "Payment already verified and order created"
      )
    );

  // Retry / double callback: answer with the order that already exists instead of failing
  const existing = await findPaymentRecord(razorpay_order_id, razorpay_payment_id);
  if (existing) {
    if (existing.order.userId !== userId) throw new ApiError(403, "This payment belongs to another account");
    if (["CANCELLED", "REFUNDED"].includes(existing.order.status)) {
      throw new ApiError(400, "This order was previously cancelled. Please start a new checkout process.");
    }
    return respondWithExisting(existing);
  }

  // What Razorpay really captured, and the order it was created for
  let payment;
  let razorpayOrder;
  try {
    payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
    razorpayOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
  } catch (error) {
    throw new ApiError(502, `Could not confirm the payment with Razorpay: ${razorpayErrorMessage(error)}`);
  }
  if (payment.order_id && payment.order_id !== razorpay_order_id) {
    throw new ApiError(400, "This payment does not belong to this order");
  }
  const rzNotes = razorpayOrder?.notes || {};
  if (rzNotes.userId && rzNotes.userId !== userId) {
    throw new ApiError(403, "This payment belongs to another account");
  }

  const paidPaise = Number(payment.amount);
  const paymentMethod = mapRazorpayMethod(payment.method);
  const paymentOwnerId = rzNotes.paymentOwnerId || paymentConfig.paymentSettings.userId;
  const paymentMode = rzNotes.paymentMode || paymentConfig.paymentSettings.mode;
  const paymentGateway = rzNotes.paymentGateway || paymentConfig.paymentSettings.gateway;

  // From here on a valid payment exists. If we cannot turn it into an order, it is refunded, never kept.
  const failAndRefund = async (status, reason) => {
    const outcome = await refundUnfulfilledPayment({
      paymentConfig,
      razorpayPaymentId: razorpay_payment_id,
      amountPaise: paidPaise,
      reason,
      userId,
    });
    const rupees = (paidPaise / 100).toFixed(2);
    throw new ApiError(
      status,
      outcome.ok
        ? `${reason}. Your payment of ₹${rupees} has been refunded and should reach your account in 5-7 working days.`
        : `${reason}. We could not refund your ₹${rupees} automatically; our team has been alerted and will refund you shortly (payment id ${razorpay_payment_id}).`
    );
  };

  // The cart, priced on the server (coupon taken from the Razorpay order our checkout created)
  let summary;
  try {
    summary = await buildCheckoutSummary(prisma, userId, {
      couponId: rzNotes.couponId,
      couponCode: rzNotes.couponCode,
      paymentMethod: "ONLINE",
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    const reason = error.message === "No items in cart"
      ? "Your cart was already ordered, so this looks like a duplicate payment"
      : error.message;
    return failAndRefund(error.statusCode || 400, reason);
  }

  // The captured amount must be exactly what this cart costs
  if (paidPaise !== toPaise(summary.total)) {
    return failAndRefund(
      409,
      `The amount paid (₹${(paidPaise / 100).toFixed(2)}) does not match your order total (₹${summary.total.toFixed(2)}), usually because a price changed`
    );
  }

  let result;
  try {
    result = await prisma.$transaction((tx) =>
      createOrderInTransaction(tx, {
        userId,
        summary,
        orderFields: {
          status: "PAID",
          paymentMethod: "RAZORPAY",
          paymentGateway,
          paymentMode,
          paymentOwnerId,
        },
        shippingAddressId,
        billingAddressSameAsShipping,
        billingAddress,
        notes,
        payment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentMethod,
          details: payment,
        },
      })
    );
  } catch (error) {
    // A parallel request may have just finished this very payment: that is success, not an error
    const done = await findPaymentRecord(razorpay_order_id, razorpay_payment_id);
    if (done && done.order.userId === userId) return respondWithExisting(done);

    if (error instanceof ApiError) return failAndRefund(error.statusCode || 400, error.message);
    console.error("Payment Verification Error:", error);
    throw new ApiError(500, "We received your payment but could not finish the order. Please contact support with payment id " + razorpay_payment_id);
  }

  afterOrderPlaced(result.order.id, userId);

  return res.status(200).json(
    new ApiResponsive(
      200,
      { orderId: result.order.id, orderNumber: result.order.orderNumber, paymentId: result.payment.id },
      "Payment verified and order created successfully"
    )
  );
});

// Get order history
export const getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Get total count
  const totalOrders = await prisma.order.count({
    where: { userId },
  });

  // Get orders with pagination
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          variant: {
            include: {
              attributes: {
                include: {
                  attributeValue: {
                    include: {
                      attribute: true,
                    },
                  },
                },
              },
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          returnRequests: {
            select: {
              id: true,
              status: true,
              reason: true,
              customReason: true,
              createdAt: true,
              processedAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      tracking: true,
      razorpayPayment: {
        select: {
          paymentMethod: true,
          status: true,
          razorpayPaymentId: true,
        },
      },
      coupon: {
        select: {
          code: true,
          discountType: true,
          discountValue: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  // Format response
  const formattedOrders = orders.map((order) => {
    // Ensure we use the original total without modifying it
    const originalTotal = parseFloat(order.total);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      // Use the original stored total
      total: originalTotal,
      subTotal: parseFloat(order.subTotal),
      shippingCost: parseFloat(order.shippingCost) || 0,
      tax: parseFloat(order.tax) || 0,
      discount: parseFloat(order.discount) || 0,
      couponCode: order.couponCode || null,
      couponDetails: order.coupon
        ? {
          code: order.coupon.code,
          discountType: order.coupon.discountType,
          discountValue: parseFloat(order.coupon.discountValue),
        }
        : null,
      paymentMethod: order.razorpayPayment?.paymentMethod || "ONLINE",
      paymentStatus: order.razorpayPayment?.status || order.status,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        image: item.product.images[0]
          ? getFileUrl(item.product.images[0].url)
          : null,
        slug: item.product.slug,
        // Extract all attributes dynamically
        attributes: (() => {
          if (!item.variant?.attributes) return {};
          const attributesMap = {};
          item.variant.attributes.forEach((vav) => {
            const attrName = vav.attributeValue?.attribute?.name;
            const attrValue = vav.attributeValue?.value;
            if (attrName && attrValue) {
              attributesMap[attrName] = attrValue;
            }
          });
          return attributesMap;
        })(),
        // Backward compatibility - keep color and size for existing code
        color: (() => {
          const colorAttr = item.variant?.attributes?.find(
            (attr) => attr.attributeValue?.attribute?.name === "Color"
          );
          return colorAttr?.attributeValue?.value || null;
        })(),
        size: (() => {
          const sizeAttr = item.variant?.attributes?.find(
            (attr) => attr.attributeValue?.attribute?.name === "Size"
          );
          return sizeAttr?.attributeValue?.value || null;
        })(),
        price: parseFloat(item.price),
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal),
        // Flash sale info
        flashSale: item.flashSaleId ? {
          id: item.flashSaleId,
          name: item.flashSaleName,
          discountPercentage: item.flashSaleDiscount,
          originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
        } : null,
        // Include return request information
        returnRequest: item.returnRequests && item.returnRequests.length > 0
          ? {
            id: item.returnRequests[0].id,
            status: item.returnRequests[0].status,
            reason: item.returnRequests[0].reason,
            customReason: item.returnRequests[0].customReason,
            createdAt: item.returnRequests[0].createdAt,
            processedAt: item.returnRequests[0].processedAt,
          }
          : null,
      })),
      tracking: order.tracking
        ? {
          carrier: order.tracking.carrier,
          trackingNumber: order.tracking.trackingNumber,
          status: order.tracking.status,
          estimatedDelivery: order.tracking.estimatedDelivery,
        }
        : null,
    };
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        orders: formattedOrders,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalOrders / parseInt(limit)),
        },
      },
      "Order history fetched successfully"
    )
  );
});

// Get order details by ID
export const getOrderDetails = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  // Get order with details
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          variant: {
            include: {
              attributes: {
                include: {
                  attributeValue: {
                    include: {
                      attribute: true,
                    },
                  },
                },
              },
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          // Include return requests for each item
          returnRequests: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      shippingAddress: true,
      tracking: {
        include: {
          updates: {
            orderBy: {
              timestamp: "desc",
            },
          },
        },
      },
      razorpayPayment: true,
      coupon: {
        select: {
          code: true,
          description: true,
          discountType: true,
          discountValue: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Format response - use original values to maintain historical pricing
  const formattedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.createdAt,
    status: order.status,
    cancelReason: order.cancelReason || null,
    cancelledAt: order.cancelledAt || null,
    cancelledBy: order.cancelledBy || null,
    subTotal: parseFloat(order.subTotal),
    tax: parseFloat(order.tax),
    shippingCost: parseFloat(order.shippingCost),
    discount: parseFloat(order.discount) || 0,
    // Use the original total stored in the database to preserve historical pricing
    total: parseFloat(order.total),
    paymentMethod: order.razorpayPayment?.paymentMethod || "ONLINE",
    paymentId: order.razorpayPayment?.razorpayPaymentId,
    paymentStatus: order.razorpayPayment?.status || order.status,
    notes: order.notes,
    couponCode: order.couponCode,
    couponId: order.couponId,
    // Add detailed coupon information
    couponDetails: order.coupon
      ? {
        code: order.coupon.code,
        description: order.coupon.description,
        discountType: order.coupon.discountType,
        discountValue: parseFloat(order.coupon.discountValue),
      }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      image: item.product.images[0]
        ? getFileUrl(item.product.images[0].url)
        : null,
      slug: item.product.slug,
      color: item.variant.color?.name,
      size: item.variant.size?.name || null,
      price: parseFloat(item.price),
      quantity: item.quantity,
      subtotal: parseFloat(item.subtotal),
      // Flash sale info
      flashSale: item.flashSaleId ? {
        id: item.flashSaleId,
        name: item.flashSaleName,
        discountPercentage: item.flashSaleDiscount,
        originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
      } : null,
      // Include return request information
      returnRequest: item.returnRequests && item.returnRequests.length > 0
        ? {
          id: item.returnRequests[0].id,
          status: item.returnRequests[0].status,
          reason: item.returnRequests[0].reason,
          customReason: item.returnRequests[0].customReason,
          createdAt: item.returnRequests[0].createdAt,
          processedAt: item.returnRequests[0].processedAt,
        }
        : null,
    })),
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddressSameAsShipping
      ? order.shippingAddress
      : order.billingAddress,
    tracking: order.tracking
      ? {
        carrier: order.tracking.carrier,
        trackingNumber: order.tracking.trackingNumber,
        status: order.tracking.status,
        estimatedDelivery: order.tracking.estimatedDelivery,
        updates: order.tracking.updates.map((update) => ({
          status: update.status,
          timestamp: update.timestamp,
          location: update.location,
          description: update.description,
        })),
      }
      : null,
  };

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        formattedOrder,
        "Order details fetched successfully"
      )
    );
});

// Cancel order (customer). Restocks the items, cancels the courier shipment and refunds online payments.
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "Cancellation reason is required");
  }

  const result = await cancelOrderForCustomer({
    orderId: req.params.orderId,
    userId: req.user.id,
    reason,
  });

  res
    .status(200)
    .json(new ApiResponsive(200, { success: true, refund: result.refund, refundFailed: result.refundFailed }, "Order cancelled successfully"));
});

// PhonePe Callback Handler
// PhonePe checkout is switched off (see `checkout`) and nothing creates PhonePe transactions. This public
// endpoint used to create a PAID order from an unsigned callback body, which anyone could have forged, so it
// is closed until PhonePe is properly integrated (with X-VERIFY signature checking).
export const phonePeCallback = asyncHandler(async (req, res) => {
  throw new ApiError(410, "PhonePe payments are not enabled");
});

// Create Cash on Delivery order
export const createCashOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, billingAddressSameAsShipping = true, billingAddress, couponCode, couponId, notes } = req.body;

  if (!shippingAddressId) {
    throw new ApiError(400, "Shipping address is required");
  }

  // Check payment settings
  const paymentSettings = await prisma.paymentSettings.findFirst();
  if (!paymentSettings || !paymentSettings.cashEnabled) {
    throw new ApiError(400, "Cash on Delivery is not enabled");
  }

  const userId = req.user.id;

  // Verify shipping address
  const shippingAddress = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId },
  });
  if (!shippingAddress) {
    throw new ApiError(404, "Shipping address not found");
  }

  // Priced on the server from the saved cart; any discount figure sent by the browser is ignored.
  const summary = await buildCheckoutSummary(prisma, userId, { couponId, couponCode, paymentMethod: "CASH" });

  let result;
  try {
    result = await prisma.$transaction((tx) =>
      createOrderInTransaction(tx, {
        userId,
        summary,
        orderFields: { status: "PENDING", paymentMethod: "CASH" }, // COD orders start as PENDING
        shippingAddressId,
        billingAddressSameAsShipping,
        billingAddress,
        notes,
        payment: null,
      })
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Cash Order Creation Error:", error);
    throw new ApiError(500, "Cash order creation failed");
  }

  afterOrderPlaced(result.order.id, userId);

  return res.status(200).json(
    new ApiResponsive(
      200,
      { orderId: result.order.id, orderNumber: result.order.orderNumber, paymentMethod: "CASH" },
      "Cash on Delivery order created successfully"
    )
  );
});

// Helper function to map Razorpay payment method to our enum
function mapRazorpayMethod(method) {
  const methodMap = {
    card: "CARD",
    netbanking: "NETBANKING",
    wallet: "WALLET",
    upi: "UPI",
    emi: "EMI",
  };

  return methodMap[method] || "OTHER";
}
