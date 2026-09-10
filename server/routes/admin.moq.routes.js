import express from "express";
import {
    getGlobalMOQ,
    setGlobalMOQ,
    getProductMOQ,
    setProductMOQ,
    deleteProductMOQ,
    getVariantMOQ,
    setVariantMOQ,
    deleteVariantMOQ,
    getEffectiveMOQ,
    getAllPricingSlabs,
    getProductPricingSlabs,
    getVariantPricingSlabs,
    createPricingSlab,
    updatePricingSlab,
    deletePricingSlab,
    getEffectivePrice,
} from "../controllers/admin.moq.controller.js";
import {
    verifyAdminJWT,
    hasPermission,
} from "../middlewares/admin.middleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyAdminJWT);

// ==================== MOQ Settings Routes ====================

// Global MOQ
router.get("/moq/global", hasPermission("moq", "read"), getGlobalMOQ);
router.post("/moq/global", hasPermission("moq", "update"), setGlobalMOQ);
router.put("/moq/global", hasPermission("moq", "update"), setGlobalMOQ);

// Product MOQ
router.get("/moq/product/:productId", hasPermission("moq", "read"), getProductMOQ);
router.post("/moq/product/:productId", hasPermission("moq", "update"), setProductMOQ);
router.put("/moq/product/:productId", hasPermission("moq", "update"), setProductMOQ);
router.delete("/moq/product/:productId", hasPermission("moq", "delete"), deleteProductMOQ);

// Variant MOQ
router.get("/moq/variant/:variantId", hasPermission("moq", "read"), getVariantMOQ);
router.post("/moq/variant/:variantId", hasPermission("moq", "update"), setVariantMOQ);
router.put("/moq/variant/:variantId", hasPermission("moq", "update"), setVariantMOQ);
router.delete("/moq/variant/:variantId", hasPermission("moq", "delete"), deleteVariantMOQ);

// Effective MOQ (for frontend)
router.get("/moq/effective/:variantId", getEffectiveMOQ);

// ==================== Pricing Slabs Routes ====================

// Get All Pricing Slabs
router.get("/pricing-slabs", hasPermission("pricing-slabs", "read"), getAllPricingSlabs);

// Product Pricing Slabs
router.get("/pricing-slabs/product/:productId", hasPermission("pricing-slabs", "read"), getProductPricingSlabs);

// Variant Pricing Slabs
router.get("/pricing-slabs/variant/:variantId", hasPermission("pricing-slabs", "read"), getVariantPricingSlabs);

// Create Pricing Slab
router.post("/pricing-slabs", hasPermission("pricing-slabs", "create"), createPricingSlab);

// Update Pricing Slab
router.put("/pricing-slabs/:id", hasPermission("pricing-slabs", "update"), updatePricingSlab);

// Delete Pricing Slab
router.delete("/pricing-slabs/:id", hasPermission("pricing-slabs", "delete"), deletePricingSlab);

// Get Effective Price (for frontend)
router.get("/pricing-slabs/effective/:variantId", getEffectivePrice);

export default router;

