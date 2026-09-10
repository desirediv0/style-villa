/**
 * Shiprocket Admin Routes
 */

import express from "express";
import { isAdmin } from "../middlewares/auth.middleware.js";
import { hasPermission } from "../middlewares/admin.middleware.js";
import {
    getSettings,
    updateSettings,
    testConnection,
    getPickupAddresses,
    createPickupAddress,
    updatePickupAddress,
    deletePickupAddress,
    checkOrderServiceability,
    syncOrderToShiprocket,
    getOrderTracking,
    cancelShipment,
    getShippingLabel,
    getOrderInvoice,
    handleWebhook,
} from "../controllers/admin.shiprocket.controller.js";

const router = express.Router();

// Settings routes
router.get("/settings", isAdmin, hasPermission("shiprocket", "read"), getSettings);
router.put("/settings", isAdmin, hasPermission("shiprocket", "update"), updateSettings);
router.post("/test-connection", isAdmin, hasPermission("shiprocket", "read"), testConnection);

// Pickup address routes
router.get("/pickup-addresses", isAdmin, hasPermission("shiprocket", "read"), getPickupAddresses);
router.post("/pickup-addresses", isAdmin, hasPermission("shiprocket", "create"), createPickupAddress);
router.put("/pickup-addresses/:id", isAdmin, hasPermission("shiprocket", "update"), updatePickupAddress);
router.delete("/pickup-addresses/:id", isAdmin, hasPermission("shiprocket", "delete"), deletePickupAddress);

// Serviceability check
router.post("/serviceability", isAdmin, hasPermission("shiprocket", "read"), checkOrderServiceability);

// Order operations (tied to orders permissions)
router.post("/orders/:orderId/sync", isAdmin, hasPermission("orders", "update"), syncOrderToShiprocket);
router.get("/orders/:orderId/tracking", isAdmin, hasPermission("orders", "read"), getOrderTracking);
router.post("/orders/:orderId/cancel", isAdmin, hasPermission("orders", "update"), cancelShipment);
router.get("/orders/:orderId/label", isAdmin, hasPermission("orders", "read"), getShippingLabel);
router.get("/orders/:orderId/invoice", isAdmin, hasPermission("orders", "read"), getOrderInvoice);

// Webhook (public - no auth, but with security token check in controller)
router.post("/webhook", handleWebhook);

export default router;
