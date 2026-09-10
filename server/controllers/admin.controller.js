import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { getFileUrl } from "../utils/deleteFromS3.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getDefaultPermissionsForRole,
  sanitizePermissions,
} from "../config/permissions.js";

// Register a new admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    roleId,
    customPermissions,
  } = req.body;

  // Check if the current user is a super admin (if not, they shouldn't be here)
  if (req.admin && req.admin.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Only Super Admins can create new admins");
  }

  if (!email || !password || !firstName || !lastName) {
    throw new ApiError(400, "Email, password, first name and last name are required");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    throw new ApiError(409, "Email already registered");
  }

  // Validate the assigned custom role, if any
  let resolvedRoleId = null;
  if (roleId) {
    const found = await prisma.role.findUnique({ where: { id: roleId } });
    if (!found) throw new ApiError(400, "Selected role does not exist");
    resolvedRoleId = found.id;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Explicit customPermissions win; otherwise fall back to the enum-role defaults.
  // (A custom Role's permissions are merged in at auth time, not copied here.)
  const permissionsToCreate =
    Array.isArray(customPermissions) && customPermissions.length > 0
      ? sanitizePermissions(customPermissions)
      : getDefaultPermissionsForRole(role || "ADMIN");

  // Create admin with permissions
  const newAdmin = await prisma.$transaction(async (tx) => {
    // Create the admin user
    const admin = await tx.admin.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "ADMIN",
        roleId: resolvedRoleId,
        lastLogin: new Date(),
      },
    });

    if (permissionsToCreate.length) {
      await tx.permission.createMany({
        data: permissionsToCreate.map((p) => ({ adminId: admin.id, ...p })),
        skipDuplicates: true,
      });
    }

    return admin;
  });

  // Remove sensitive data from response
  const adminWithoutPassword = { ...newAdmin };
  delete adminWithoutPassword.password;

  res
    .status(201)
    .json(
      new ApiResponsive(
        201,
        adminWithoutPassword,
        "Admin registered successfully"
      )
    );
});

// Login admin
export const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find admin
  const admin = await prisma.admin.findUnique({
    where: { email },
    include: {
      permissions: true,
      customRole: { include: { permissions: true } },
    },
  });

  if (!admin) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if admin account is active
  if (!admin.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Effective permissions = per-admin rows UNION assigned custom Role's rows.
  const effectivePermissions = Array.from(
    new Set([
      ...admin.permissions.map((p) => `${p.resource}:${p.action}`),
      ...(admin.customRole?.permissions || []).map(
        (p) => `${p.resource}:${p.action}`
      ),
    ])
  );

  // Generate token
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: effectivePermissions,
    },
    process.env.ADMIN_JWT_SECRET,
    {
      expiresIn: process.env.ADMIN_TOKEN_LIFE || "1d",
    }
  );

  // Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  // Remove sensitive data from response
  const { password: _pw, customRole, ...adminWithoutPassword } = admin;
  adminWithoutPassword.roleName = customRole?.name || null;
  adminWithoutPassword.permissions = effectivePermissions;

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        admin: adminWithoutPassword,
        token,
      },
      "Logged in successfully"
    )
  );
});

// Get admin profile
export const getAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    include: {
      permissions: true,
      customRole: { include: { permissions: true } },
    },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const effectivePermissions = Array.from(
    new Set([
      ...admin.permissions.map((p) => `${p.resource}:${p.action}`),
      ...(admin.customRole?.permissions || []).map(
        (p) => `${p.resource}:${p.action}`
      ),
    ])
  );

  // Remove sensitive data from response
  const { password: _pw, customRole, ...adminWithoutPassword } = admin;
  adminWithoutPassword.roleName = customRole?.name || null;
  adminWithoutPassword.permissions = effectivePermissions;

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { admin: adminWithoutPassword },
        "Admin profile fetched successfully"
      )
    );
});

// Update admin profile
export const updateAdminProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, language } = req.body;

  const updatedAdmin = await prisma.admin.update({
    where: { id: req.admin.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(language && { language }),
    },
  });

  // Remove sensitive data from response
  const adminWithoutPassword = { ...updatedAdmin };
  delete adminWithoutPassword.password;

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { admin: adminWithoutPassword },
        "Admin profile updated successfully"
      )
    );
});

// Change admin password
export const changeAdminPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Find admin
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
  });

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: hashedPassword },
  });

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Password changed successfully"));
});

// Get all admins (super admin only)
export const getAllAdmins = asyncHandler(async (req, res, next) => {
  // Check if current admin is a super admin
  if (req.admin.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Forbidden: Insufficient permissions");
  }

  const admins = await prisma.admin.findMany({
    include: {
      permissions: true,
      customRole: { include: { permissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Remove sensitive data and expose effective (own UNION role) permissions.
  const adminsWithoutPasswords = admins.map((admin) => {
    const { password, customRole, ...adminData } = admin;
    const own = admin.permissions.map((p) => `${p.resource}:${p.action}`);
    const fromRole = (customRole?.permissions || []).map(
      (p) => `${p.resource}:${p.action}`
    );
    return {
      ...adminData,
      roleName: customRole?.name || null,
      ownPermissions: own,
      rolePermissions: fromRole,
      permissions: Array.from(new Set([...own, ...fromRole])),
    };
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { admins: adminsWithoutPasswords },
        "Admins fetched successfully"
      )
    );
});

// Update admin role / active status / assigned custom role (super admin only)
export const updateAdminRole = asyncHandler(async (req, res, next) => {
  const { adminId } = req.params;
  // roleId: null clears the custom role; undefined leaves it untouched.
  // resetPermissionsFromRole: if true, replace per-admin permissions with the
  //   enum-role defaults (the old behaviour). Off by default now that custom
  //   roles are merged at auth time.
  const { role, isActive, roleId, resetPermissionsFromRole } = req.body;

  // Check if current admin is a super admin
  if (req.admin.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Forbidden: Insufficient permissions");
  }

  const target = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!target) throw new ApiError(404, "Admin not found");

  // Prevent self-demotion
  if (adminId === req.admin.id && (role || isActive === false)) {
    throw new ApiError(400, "You cannot change your own role or active status");
  }

  if (roleId) {
    const found = await prisma.role.findUnique({ where: { id: roleId } });
    if (!found) throw new ApiError(400, "Selected role does not exist");
  }

  const updatedAdmin = await prisma.$transaction(async (tx) => {
    const admin = await tx.admin.update({
      where: { id: adminId },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(roleId !== undefined && { roleId: roleId || null }),
      },
    });

    if (role && resetPermissionsFromRole) {
      await tx.permission.deleteMany({ where: { adminId } });
      const defaults = getDefaultPermissionsForRole(role);
      if (defaults.length) {
        await tx.permission.createMany({
          data: defaults.map((p) => ({ adminId, ...p })),
          skipDuplicates: true,
        });
      }
    }

    return admin;
  });

  const { password, ...adminWithoutPassword } = updatedAdmin;

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { admin: adminWithoutPassword },
        "Admin updated successfully"
      )
    );
});

// Update an admin's profile details / password (super admin only)
export const updateAdminDetails = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { firstName, lastName, email, password, isActive } = req.body;

  if (req.admin.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Forbidden: Insufficient permissions");
  }

  const target = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!target) throw new ApiError(404, "Admin not found");

  if (adminId === req.admin.id && isActive === false) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }

  if (email && email !== target.email) {
    const clash = await prisma.admin.findUnique({ where: { email } });
    if (clash) throw new ApiError(409, "Email already registered");
  }

  if (password !== undefined && password !== "" && password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data: {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(email ? { email } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
  });

  const { password: _pw, ...adminWithoutPassword } = updated;

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { admin: adminWithoutPassword },
        "Admin details updated successfully"
      )
    );
});

// Delete admin (super admin only)
export const deleteAdmin = asyncHandler(async (req, res, next) => {
  const { adminId } = req.params;

  // Check if current admin is a super admin
  if (req.admin.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Forbidden: Insufficient permissions");
  }

  // Prevent self-deletion
  if (adminId === req.admin.id) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  // Delete admin
  await prisma.admin.delete({
    where: { id: adminId },
  });

  res
    .status(200)
    .json(new ApiResponsive(200, {}, "Admin deleted successfully"));
});

// Replace an admin's per-admin permission set with exactly what the UI sends.
// Body: { permissions: [{ resource, action }, ...] }
// If `permissions` is omitted, fall back to re-seeding from the enum-role defaults.
export const updateAdminPermissions = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { permissions } = req.body;

  if (req.admin.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Forbidden: Insufficient permissions");
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw new ApiError(404, "Admin not found");

  const desired = Array.isArray(permissions)
    ? sanitizePermissions(permissions)
    : getDefaultPermissionsForRole(admin.role);

  const result = await prisma.$transaction(async (tx) => {
    await tx.permission.deleteMany({ where: { adminId } });
    if (desired.length) {
      await tx.permission.createMany({
        data: desired.map((p) => ({ adminId, ...p })),
        skipDuplicates: true,
      });
    }
    return tx.permission.findMany({ where: { adminId } });
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        adminId,
        permissions: result.map((p) => `${p.resource}:${p.action}`),
        count: result.length,
      },
      "Admin permissions updated successfully"
    )
  );
});

// Get low stock inventory alerts for admin dashboard
export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query;

  // Get product variants with quantity below threshold
  const lowStockVariants = await prisma.productVariant.findMany({
    where: {
      quantity: { lte: parseInt(threshold) },
      isActive: true,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          variants: {
            where: { isActive: true },
            include: {
              images: true,
            },
          },
        },
      },
      attributes: {
        include: {
          attributeValue: {
            include: {
              attribute: true,
            },
          },
        },
      },
      images: true,
    },
    orderBy: { quantity: "asc" },
  });

  // Format response with proper image URLs with fallback logic
  const formattedAlerts = lowStockVariants.map((variant) => {
    // Get image with priority: variant images > product images > other variant images
    let imageUrl = null;

    // Priority 1: Current variant images
    if (variant.images && variant.images.length > 0) {
      const primaryImage = variant.images.find((img) => img.isPrimary);
      imageUrl = primaryImage ? primaryImage.url : variant.images[0].url;
    }
    // Priority 2: Product images
    else if (variant.product.images && variant.product.images.length > 0) {
      const primaryImage = variant.product.images.find((img) => img.isPrimary);
      imageUrl = primaryImage
        ? primaryImage.url
        : variant.product.images[0].url;
    }
    // Priority 3: Any variant images from any variant
    else if (variant.product.variants && variant.product.variants.length > 0) {
      const variantWithImages = variant.product.variants.find(
        (v) => v.images && v.images.length > 0
      );
      if (variantWithImages) {
        const primaryImage = variantWithImages.images.find(
          (img) => img.isPrimary
        );
        imageUrl = primaryImage
          ? primaryImage.url
          : variantWithImages.images[0].url;
      }
    }

    return {
      id: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      stock: variant.quantity, // Use quantity but keep the response field as "stock" for frontend compatibility
      sku: variant.sku,
      attributes: variant.attributes
        ? variant.attributes.map((va) => ({
          attribute: va.attributeValue.attribute.name,
          value: va.attributeValue.value,
        }))
        : [],
      image: imageUrl ? getFileUrl(imageUrl) : null,
      status: variant.quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
      createdAt: variant.createdAt,
    };
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        alerts: formattedAlerts,
        count: formattedAlerts.length,
        outOfStockCount: formattedAlerts.filter(
          (a) => a.status === "OUT_OF_STOCK"
        ).length,
        lowStockCount: formattedAlerts.filter((a) => a.status === "LOW_STOCK")
          .length,
      },
      "Inventory alerts fetched successfully"
    )
  );
});

// Get users with pagination and search
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, search = "" } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const whereClause = search
    ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }
    : {};

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        otpVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalUsers / parseInt(limit));

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        users,
        pagination: {
          total: totalUsers,
          pages: totalPages,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Users fetched successfully"
    )
  );
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      otpVerified: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponsive(200, { user }, "User fetched successfully"));
});

// Update user status (active/inactive)
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    throw new ApiError(400, "isActive field is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { user: updatedUser },
        `User ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

// Verify user email (mark OTP verified)
export const verifyUserEmail = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.otpVerified) {
    return res
      .status(200)
      .json(new ApiResponsive(200, {}, "Email is already verified"));
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { otpVerified: true, otp: null, otpVerifiedExpiry: null },
    select: {
      id: true,
      name: true,
      email: true,
      otpVerified: true,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { user: updatedUser },
        "User email verified successfully"
      )
    );
});

// Update user details
export const updateUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is being changed and already exists
  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(409, "Email is already in use by another account");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      otpVerified: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponsive(
        200,
        { user: updatedUser },
        "User details updated successfully"
      )
    );
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete user - in a real application, consider soft delete or archiving
  await prisma.user.delete({
    where: { id: userId },
  });

  res.status(200).json(new ApiResponsive(200, {}, "User deleted successfully"));
});

// Get payment settings
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

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        cashEnabled: paymentSettings.cashEnabled,
        razorpayEnabled: paymentSettings.razorpayEnabled,
        codCharge: parseFloat(paymentSettings.codCharge) || 0,
      },
      "Payment settings fetched successfully"
    )
  );
});

// Update payment settings
export const updatePaymentSettings = asyncHandler(async (req, res) => {
  const { cashEnabled, razorpayEnabled, codCharge } = req.body;

  // Validate that at least one payment method is enabled
  if (cashEnabled === false && razorpayEnabled === false) {
    throw new ApiError(
      400,
      "At least one payment method must be enabled (Cash or Razorpay)"
    );
  }

  // Validate COD charge is non-negative
  if (codCharge !== undefined && codCharge < 0) {
    throw new ApiError(400, "COD charge cannot be negative");
  }

  // Get or create payment settings
  let paymentSettings = await prisma.paymentSettings.findFirst();

  if (!paymentSettings) {
    paymentSettings = await prisma.paymentSettings.create({
      data: {
        cashEnabled: cashEnabled !== undefined ? cashEnabled : true,
        razorpayEnabled: razorpayEnabled !== undefined ? razorpayEnabled : false,
        codCharge: codCharge !== undefined ? codCharge : 0,
        updatedBy: req.admin?.id,
      },
    });
  } else {
    paymentSettings = await prisma.paymentSettings.update({
      where: { id: paymentSettings.id },
      data: {
        ...(cashEnabled !== undefined && { cashEnabled }),
        ...(razorpayEnabled !== undefined && { razorpayEnabled }),
        ...(codCharge !== undefined && { codCharge }),
        updatedBy: req.admin?.id,
      },
    });
  }

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        cashEnabled: paymentSettings.cashEnabled,
        razorpayEnabled: paymentSettings.razorpayEnabled,
        codCharge: parseFloat(paymentSettings.codCharge) || 0,
      },
      "Payment settings updated successfully"
    )
  );
});

// Get price visibility settings
export const getPriceVisibilitySettings = asyncHandler(async (req, res) => {
  // Get or create price visibility settings (singleton)
  let priceVisibilitySettings = await prisma.priceVisibilitySetting.findFirst();

  // If no settings exist, create default ones
  if (!priceVisibilitySettings) {
    priceVisibilitySettings = await prisma.priceVisibilitySetting.create({
      data: {
        hidePricesForGuests: false,
        isActive: true,
      },
    });
  }

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        hidePricesForGuests: priceVisibilitySettings.hidePricesForGuests,
        isActive: priceVisibilitySettings.isActive,
      },
      "Price visibility settings fetched successfully"
    )
  );
});

// Update price visibility settings
export const updatePriceVisibilitySettings = asyncHandler(async (req, res) => {
  const { hidePricesForGuests } = req.body;

  // Get or create price visibility settings
  let priceVisibilitySettings = await prisma.priceVisibilitySetting.findFirst();

  if (!priceVisibilitySettings) {
    priceVisibilitySettings = await prisma.priceVisibilitySetting.create({
      data: {
        hidePricesForGuests: hidePricesForGuests !== undefined ? hidePricesForGuests : false,
        isActive: true,
        updatedBy: req.admin?.id,
      },
    });
  } else {
    priceVisibilitySettings = await prisma.priceVisibilitySetting.update({
      where: { id: priceVisibilitySettings.id },
      data: {
        ...(hidePricesForGuests !== undefined && { hidePricesForGuests }),
        updatedBy: req.admin?.id,
      },
    });
  }

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        hidePricesForGuests: priceVisibilitySettings.hidePricesForGuests,
        isActive: priceVisibilitySettings.isActive,
      },
      "Price visibility settings updated successfully"
    )
  );
});
