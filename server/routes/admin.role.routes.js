import express from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissionCatalog,
} from "../controllers/admin.role.controller.js";
import {
  verifyAdminJWT,
  hasPermission,
} from "../middlewares/admin.middleware.js";

const router = express.Router();

// The permission matrix definition - any admin who can read roles can load it.
router.get(
  "/roles/catalog",
  verifyAdminJWT,
  hasPermission("roles", "read"),
  getPermissionCatalog
);

router.get(
  "/roles",
  verifyAdminJWT,
  hasPermission("roles", "read"),
  getRoles
);

router.get(
  "/roles/:roleId",
  verifyAdminJWT,
  hasPermission("roles", "read"),
  getRoleById
);

router.post(
  "/roles",
  verifyAdminJWT,
  hasPermission("roles", "create"),
  createRole
);

router.patch(
  "/roles/:roleId",
  verifyAdminJWT,
  hasPermission("roles", "update"),
  updateRole
);

router.delete(
  "/roles/:roleId",
  verifyAdminJWT,
  hasPermission("roles", "delete"),
  deleteRole
);

export default router;
