import { prisma } from "../config/db.js";
import {
  normalizeProductType,
  getLegacyAliasesForType,
  PRODUCT_TYPES,
  PRODUCT_TYPE_KEYS,
  PRODUCT_TYPE_ALIASES,
} from "../constants/productTypes.js";

// Re-export constants and normalization functions
export {
  normalizeProductType,
  getLegacyAliasesForType,
  PRODUCT_TYPES,
  PRODUCT_TYPE_KEYS,
  PRODUCT_TYPE_ALIASES,
};

/**
 * Cleanly parse and normalize product types from request payload
 */
export function parseProductTypes(rawProductType, rawFeatured) {
  let types = [];
  if (rawProductType !== undefined && rawProductType !== null) {
    if (Array.isArray(rawProductType)) {
      types = rawProductType;
    } else if (typeof rawProductType === "string") {
      try {
        const parsed = JSON.parse(rawProductType);
        types = Array.isArray(parsed) ? parsed : [rawProductType];
      } catch {
        types = rawProductType.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  const normalizedSet = new Set();
  types.forEach((t) => {
    const norm = normalizeProductType(t);
    if (norm) normalizedSet.add(norm);
  });

  // If rawFeatured is explicitly true or "true", ensure "featured" is in types
  const hasFeaturedFlag =
    rawFeatured === true ||
    rawFeatured === "true" ||
    normalizedSet.has("featured");

  if (hasFeaturedFlag) {
    normalizedSet.add("featured");
  } else if (rawFeatured === false || rawFeatured === "false") {
    normalizedSet.delete("featured");
  }

  return {
    productTypes: Array.from(normalizedSet),
    isFeatured: normalizedSet.has("featured"),
  };
}

/**
 * Builds Prisma where condition to match products for a given type or aliases
 */
export function buildProductTypeWhereCondition(productType) {
  const canonical = normalizeProductType(productType);
  if (!canonical) return null;

  const aliases = getLegacyAliasesForType(canonical);
  const conditions = aliases.map((alias) => ({
    productType: {
      array_contains: [alias],
    },
  }));

  // Also include exact canonical match
  conditions.push({
    productType: {
      array_contains: [canonical],
    },
  });

  // If type is featured, also match on featured boolean
  if (canonical === "featured") {
    conditions.push({ featured: true });
  }

  return {
    OR: conditions,
  };
}

/**
 * Automatically sync product's productType tags with ProductSectionItem
 */
export async function syncProductWithSections(productId, productTypes, tx = prisma) {
  try {
    const client = tx || prisma;
    const sections = await client.productSection.findMany();
    if (!sections || sections.length === 0) return;

    const targetTypes = new Set(
      (productTypes || []).map((t) => normalizeProductType(t))
    );

    for (const section of sections) {
      const sectionSlug = normalizeProductType(section.slug);
      const shouldBeInSection = targetTypes.has(sectionSlug);

      const existingItem = await client.productSectionItem.findFirst({
        where: {
          productSectionId: section.id,
          productId: productId,
        },
      });

      if (shouldBeInSection && !existingItem) {
        // Find maximum display order in this section
        const maxOrderItem = await client.productSectionItem.findFirst({
          where: { productSectionId: section.id },
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        const nextOrder = (maxOrderItem?.displayOrder ?? -1) + 1;

        await client.productSectionItem.create({
          data: {
            productSectionId: section.id,
            productId: productId,
            displayOrder: nextOrder,
          },
        });
      } else if (!shouldBeInSection && existingItem) {
        await client.productSectionItem.delete({
          where: { id: existingItem.id },
        });
      }
    }
  } catch (err) {
    console.error(`Error syncing product ${productId} with sections:`, err);
  }
}

