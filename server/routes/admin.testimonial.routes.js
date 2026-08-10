import express from "express";
import {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  togglePublishTestimonial,
} from "../controllers/admin.testimonial.controller.js";
import { verifyAdminJWT, hasPermission } from "../middlewares/admin.middleware.js";
import { uploadFiles } from "../middlewares/multer.middlerware.js";

const router = express.Router();

router.get(
  "/testimonials",
  verifyAdminJWT,
  hasPermission("testimonials", "read"),
  getTestimonials
);

router.get(
  "/testimonials/:testimonialId",
  verifyAdminJWT,
  hasPermission("testimonials", "read"),
  getTestimonialById
);

router.post(
  "/testimonials",
  verifyAdminJWT,
  hasPermission("testimonials", "create"),
  uploadFiles.single("image"),
  createTestimonial
);

router.put(
  "/testimonials/:testimonialId",
  verifyAdminJWT,
  hasPermission("testimonials", "update"),
  uploadFiles.single("image"),
  updateTestimonial
);

router.delete(
  "/testimonials/:testimonialId",
  verifyAdminJWT,
  hasPermission("testimonials", "delete"),
  deleteTestimonial
);

router.patch(
  "/testimonials/:testimonialId/publish",
  verifyAdminJWT,
  hasPermission("testimonials", "update"),
  togglePublishTestimonial
);

export default router;
