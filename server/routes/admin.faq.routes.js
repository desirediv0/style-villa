import { Router } from "express";
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getFaqById,
  bulkUpdateFaqOrder,
  getFaqCategories,
} from "../controllers/faq.controller.js";
import {
  verifyAdminJWT,
  hasPermission,
} from "../middlewares/admin.middleware.js";

const router = Router();

// All admin FAQ routes are protected
router.use(verifyAdminJWT);

router.get("/", hasPermission("faqs", "read"), getAllFaqs);
router.post("/", hasPermission("faqs", "create"), createFaq);
router.get("/categories", hasPermission("faqs", "read"), getFaqCategories);
router.put(
  "/bulk-update-order",
  hasPermission("faqs", "update"),
  bulkUpdateFaqOrder
);
router.get("/:id", hasPermission("faqs", "read"), getFaqById);
router.put("/:id", hasPermission("faqs", "update"), updateFaq);
router.delete("/:id", hasPermission("faqs", "delete"), deleteFaq);

export default router;
