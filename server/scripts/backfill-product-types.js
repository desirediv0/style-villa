import { PrismaClient } from "@prisma/client";
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_KEYS,
  normalizeProductType,
} from "../constants/productTypes.js";
import { parseProductTypes } from "../utils/productTypeHelper.js";

const prisma = new PrismaClient();

const DEFAULT_SECTIONS = [
  {
    name: "Featured Collections",
    slug: "featured",
    description: "Handpicked handcrafted bags selected for your style",
    color: "bg-blue-500",
    displayOrder: 1,
  },
  {
    name: "Latest Additions",
    slug: "latest",
    description: "Newly added premium bag collections",
    color: "bg-green-500",
    displayOrder: 2,
  },
  {
    name: "Best Sellers",
    slug: "bestseller",
    description: "Our most popular bag designs loved by clients across India",
    color: "bg-yellow-500",
    displayOrder: 3,
  },
  {
    name: "Trending Now",
    slug: "trending",
    description: "Most loved and trending handmade designs and accessories this week",
    color: "bg-purple-500",
    displayOrder: 4,
  },
  {
    name: "New Arrivals",
    slug: "new",
    description: "Fresh handcrafted creations added to our gallery",
    color: "bg-pink-500",
    displayOrder: 5,
  },
];

async function main() {
  console.log("====================================================");
  console.log("   StyleVilla - Product Types Backfill & Sync Script");
  console.log("====================================================");

  // 1. Ensure default sections exist
  console.log("\n[1/4] Checking Product Sections...");
  for (const s of DEFAULT_SECTIONS) {
    const existing = await prisma.productSection.findFirst({
      where: { slug: { equals: s.slug, mode: "insensitive" } },
    });
    if (!existing) {
      await prisma.productSection.create({
        data: {
          name: s.name,
          slug: s.slug,
          description: s.description,
          color: s.color,
          displayOrder: s.displayOrder,
          isActive: true,
          maxProducts: 15,
        },
      });
      console.log(`  + Created missing section: ${s.name} (${s.slug})`);
    } else {
      console.log(`  ✓ Section exists: ${existing.name} (${existing.slug})`);
    }
  }

  // 2. Fetch all products
  console.log("\n[2/4] Scanning all products in DB...");
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      featured: true,
      productType: true,
      isActive: true,
    },
  });

  console.log(`  Total products found: ${allProducts.length}`);

  let updatedCount = 0;
  const typeCounts = {
    featured: 0,
    bestseller: 0,
    trending: 0,
    new: 0,
    none: 0,
  };

  // 3. Normalize productType and sync featured boolean for each product
  console.log("\n[3/4] Normalizing productTypes and syncing flags...");
  for (const p of allProducts) {
    const { productTypes: cleanTypes, isFeatured: cleanFeatured } =
      parseProductTypes(p.productType, p.featured);

    const oldTypesStr = JSON.stringify(
      Array.isArray(p.productType) ? p.productType : []
    );
    const newTypesStr = JSON.stringify(cleanTypes);
    const featuredChanged = p.featured !== cleanFeatured;
    const typesChanged = oldTypesStr !== newTypesStr;

    if (typesChanged || featuredChanged) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          productType: cleanTypes,
          featured: cleanFeatured,
        },
      });
      updatedCount++;
      console.log(
        `  -> Updated [${p.name.substring(0, 30)}]: types: ${oldTypesStr} -> ${newTypesStr}, featured: ${p.featured} -> ${cleanFeatured}`
      );
    }

    // Tally counts
    if (cleanTypes.length === 0) {
      typeCounts.none++;
    } else {
      cleanTypes.forEach((t) => {
        if (typeCounts[t] !== undefined) typeCounts[t]++;
      });
    }
  }

  console.log(`\n  Products backfilled/updated: ${updatedCount}`);
  console.log("  Current Product Type Distribution:");
  console.log(`    - Featured:     ${typeCounts.featured}`);
  console.log(`    - Best Sellers: ${typeCounts.bestseller}`);
  console.log(`    - Trending:     ${typeCounts.trending}`);
  console.log(`    - New Arrivals: ${typeCounts.new}`);
  console.log(`    - No Type:      ${typeCounts.none}`);

  // 4. Sync ProductSectionItems for each section
  console.log("\n[4/4] Syncing ProductSectionItem records with product types...");
  const sections = await prisma.productSection.findMany();

  for (const sec of sections) {
    const canonicalSlug = normalizeProductType(sec.slug);

    // If section is "latest", take recent active products
    let matchingProducts = [];
    if (sec.slug === "latest") {
      matchingProducts = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: sec.maxProducts || 15,
      });
    } else {
      // Find all products that have canonicalSlug in productType (or featured: true for featured)
      matchingProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { productType: { array_contains: [canonicalSlug] } },
            { productType: { array_contains: [sec.slug] } },
            ...(canonicalSlug === "featured" ? [{ featured: true }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        take: sec.maxProducts || 15,
      });
    }

    const matchingIds = new Set(matchingProducts.map((p) => p.id));

    // Current items in this section
    const currentItems = await prisma.productSectionItem.findMany({
      where: { productSectionId: sec.id },
    });

    // Remove obsolete items
    const obsolete = currentItems.filter((i) => !matchingIds.has(i.productId));
    if (obsolete.length > 0) {
      await prisma.productSectionItem.deleteMany({
        where: { id: { in: obsolete.map((i) => i.id) } },
      });
    }

    // Add missing items
    const existingIds = new Set(
      currentItems
        .filter((i) => matchingIds.has(i.productId))
        .map((i) => i.productId)
    );
    const toAdd = matchingProducts.filter((p) => !existingIds.has(p.id));

    let maxOrder = currentItems.reduce(
      (max, i) => Math.max(max, i.displayOrder),
      -1
    );
    for (const p of toAdd) {
      maxOrder++;
      await prisma.productSectionItem.create({
        data: {
          productSectionId: sec.id,
          productId: p.id,
          displayOrder: maxOrder,
        },
      });
    }

    const finalCount = await prisma.productSectionItem.count({
      where: { productSectionId: sec.id },
    });

    console.log(
      `  ✓ Section [${sec.name}] (${sec.slug}): Synced. Obsolete removed: ${obsolete.length}, New added: ${toAdd.length}, Total items: ${finalCount}`
    );
  }

  console.log("\n====================================================");
  console.log("   Backfill & Sync completed successfully!");
  console.log("====================================================");
}

main()
  .catch((e) => {
    console.error("Backfill script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

