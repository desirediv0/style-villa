import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import {
  RESOURCES,
  ACTIONS,
  ALL_PERMISSIONS,
  sanitizePermissions,
} from "../config/permissions.js";

const flatten = (permissions) =>
  (permissions || []).map((p) => `${p.resource}:${p.action}`);

const serializeRole = (role) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  isSystem: role.isSystem,
  adminCount: role._count?.admins ?? role.admins?.length ?? 0,
  permissions: flatten(role.permissions),
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
});

// GET /api/admin/roles/catalog  -> the full resource/action matrix definition
export const getPermissionCatalog = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponsive(
      200,
      {
        resources: Object.entries(RESOURCES).map(([key, label]) => ({
          key,
          label,
        })),
        actions: ACTIONS,
        all: ALL_PERMISSIONS,
      },
      "Permission catalog fetched"
    )
  );
});

// GET /api/admin/roles
export const getRoles = asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { admins: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { roles: roles.map(serializeRole) },
        "Roles fetched successfully"
      )
    );
});

// GET /api/admin/roles/:roleId
export const getRoleById = asyncHandler(async (req, res) => {
  const { roleId } = req.params;

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: true,
      _count: { select: { admins: true } },
      admins: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!role) throw new ApiError(404, "Role not found");

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        role: {
          ...serializeRole(role),
          admins: role.admins,
        },
      },
      "Role fetched successfully"
    )
  );
});

// POST /api/admin/roles
export const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions } = req.body;

  if (!name || !name.trim()) throw new ApiError(400, "Role name is required");

  const existing = await prisma.role.findUnique({
    where: { name: name.trim() },
  });
  if (existing) throw new ApiError(409, "A role with this name already exists");

  const cleanPerms = sanitizePermissions(permissions);

  const role = await prisma.role.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      permissions: { create: cleanPerms },
    },
    include: { permissions: true, _count: { select: { admins: true } } },
  });

  res
    .status(201)
    .json(
      new ApiResponsive(
        201,
        { role: serializeRole(role) },
        "Role created successfully"
      )
    );
});

// PATCH /api/admin/roles/:roleId
export const updateRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const { name, description, permissions } = req.body;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new ApiError(404, "Role not found");

  if (name && name.trim() && name.trim() !== role.name) {
    const clash = await prisma.role.findUnique({
      where: { name: name.trim() },
    });
    if (clash) throw new ApiError(409, "A role with this name already exists");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id: roleId },
      data: {
        ...(name && name.trim() ? { name: name.trim() } : {}),
        ...(description !== undefined
          ? { description: description?.trim() || null }
          : {}),
      },
    });

    if (Array.isArray(permissions)) {
      const cleanPerms = sanitizePermissions(permissions);
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (cleanPerms.length) {
        await tx.rolePermission.createMany({
          data: cleanPerms.map((p) => ({ roleId, ...p })),
          skipDuplicates: true,
        });
      }
    }

    return tx.role.findUnique({
      where: { id: roleId },
      include: { permissions: true, _count: { select: { admins: true } } },
    });
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { role: serializeRole(updated) },
        "Role updated successfully"
      )
    );
});

// DELETE /api/admin/roles/:roleId
export const deleteRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { _count: { select: { admins: true } } },
  });
  if (!role) throw new ApiError(404, "Role not found");

  if (role._count.admins > 0) {
    throw new ApiError(
      400,
      `This role is assigned to ${role._count.admins} admin(s). Reassign them before deleting.`
    );
  }

  await prisma.role.delete({ where: { id: roleId } });

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Role deleted successfully"));
});
