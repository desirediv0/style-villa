import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromS3, getFileUrl } from "../utils/deleteFromS3.js";
import { processAndUploadImage } from "../middlewares/multer.middlerware.js";

// Get all testimonials (admin - includes unpublished)
export const getTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "", isPublished } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { text: { contains: search, mode: "insensitive" } },
    ];
  }
  if (isPublished !== undefined && isPublished !== "") {
    where.isPublished = isPublished === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [testimonials, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      skip,
      take: parseInt(limit),
    }),
    prisma.testimonial.count({ where }),
  ]);

  const formatted = testimonials.map((t) => ({
    ...t,
    image: t.image ? getFileUrl(t.image) : null,
  }));

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        testimonials: formatted,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Testimonials fetched successfully"
    )
  );
});

// Get single testimonial (admin)
export const getTestimonialById = asyncHandler(async (req, res) => {
  const { testimonialId } = req.params;

  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
  });

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        testimonial: {
          ...testimonial,
          image: testimonial.image ? getFileUrl(testimonial.image) : null,
        },
      },
      "Testimonial fetched successfully"
    )
  );
});

// Create testimonial (admin)
export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, role, city, text, rating, isPublished, position } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  // Upload image if provided
  let imageUrl = null;
  if (req.file) {
    try {
      imageUrl = await processAndUploadImage(req.file, "testimonials");
    } catch (error) {
      throw new ApiError(400, "Failed to upload image: " + error.message);
    }
  }

  // Auto-calculate position
  let testimonialPosition = 0;
  if (position !== undefined && position !== null && position !== "") {
    testimonialPosition = parseInt(position) || 0;
  } else {
    const maxPos = await prisma.testimonial.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });
    testimonialPosition = maxPos ? maxPos.position + 1 : 0;
  }

  // Shift existing testimonials at or after this position
  const toShift = await prisma.testimonial.findMany({
    where: { position: { gte: testimonialPosition } },
  });
  for (const t of toShift) {
    await prisma.testimonial.update({
      where: { id: t.id },
      data: { position: t.position + 1 },
    });
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      name,
      role: role || null,
      city: city || null,
      text: text || null,
      rating: parseInt(rating) || 5,
      image: imageUrl,
      isPublished: isPublished !== "false" && isPublished !== false,
      position: testimonialPosition,
    },
  });

  res.status(201).json(
    new ApiResponsive(
      201,
      {
        testimonial: {
          ...testimonial,
          image: testimonial.image ? getFileUrl(testimonial.image) : null,
        },
      },
      "Testimonial created successfully"
    )
  );
});

// Update testimonial (admin)
export const updateTestimonial = asyncHandler(async (req, res) => {
  const { testimonialId } = req.params;
  const { name, role, city, text, rating, isPublished, position } = req.body;

  const existing = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
  });

  if (!existing) {
    throw new ApiError(404, "Testimonial not found");
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role || null;
  if (city !== undefined) updateData.city = city || null;
  if (text !== undefined) updateData.text = text || null;
  if (rating !== undefined) updateData.rating = parseInt(rating) || 5;
  if (isPublished !== undefined) {
    updateData.isPublished = isPublished !== "false" && isPublished !== false;
  }
  if (position !== undefined && position !== null && position !== "") {
    updateData.position = parseInt(position) || 0;
  }

  // Handle image update
  if (req.file) {
    try {
      // Delete old image
      if (existing.image) {
        await deleteFromS3(existing.image);
      }
      updateData.image = await processAndUploadImage(req.file, "testimonials");
    } catch (error) {
      throw new ApiError(400, "Failed to upload image: " + error.message);
    }
  }

  const testimonial = await prisma.testimonial.update({
    where: { id: testimonialId },
    data: updateData,
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        testimonial: {
          ...testimonial,
          image: testimonial.image ? getFileUrl(testimonial.image) : null,
        },
      },
      "Testimonial updated successfully"
    )
  );
});

// Delete testimonial (admin)
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const { testimonialId } = req.params;

  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
  });

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  // Delete image from S3
  if (testimonial.image) {
    await deleteFromS3(testimonial.image);
  }

  await prisma.testimonial.delete({ where: { id: testimonialId } });

  // Reorder remaining
  const remaining = await prisma.testimonial.findMany({
    where: { position: { gt: testimonial.position } },
    orderBy: { position: "asc" },
  });
  for (const t of remaining) {
    await prisma.testimonial.update({
      where: { id: t.id },
      data: { position: t.position - 1 },
    });
  }

  res.status(200).json(
    new ApiResponsive(200, null, "Testimonial deleted successfully")
  );
});

// Toggle publish (admin)
export const togglePublishTestimonial = asyncHandler(async (req, res) => {
  const { testimonialId } = req.params;

  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
  });

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  const updated = await prisma.testimonial.update({
    where: { id: testimonialId },
    data: { isPublished: !testimonial.isPublished },
  });

  res.status(200).json(
    new ApiResponsive(
      200,
      {
        testimonial: {
          ...updated,
          image: updated.image ? getFileUrl(updated.image) : null,
        },
      },
      `Testimonial ${updated.isPublished ? "published" : "unpublished"} successfully`
    )
  );
});

// Get published testimonials (public)
export const getPublishedTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      role: true,
      city: true,
      text: true,
      rating: true,
      image: true,
    },
  });

  const formatted = testimonials.map((t) => ({
    ...t,
    image: t.image ? getFileUrl(t.image) : null,
  }));

  res.status(200).json(
    new ApiResponsive(
      200,
      { testimonials: formatted },
      "Testimonials fetched successfully"
    )
  );
});
