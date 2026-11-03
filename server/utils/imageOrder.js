// Ordering used by every storefront and admin query, so a product looks the same on the home
// page, category pages, product cards, the product page itself and the admin edit page.

// A product's (or variant's) images: the primary image first, then the position the admin
// arranged, with creation time as a stable tie-break. Without an explicit order the database
// returns rows in whatever order it likes, which changes after updates.
export const IMAGE_ORDER = [
  { isPrimary: "desc" },
  { order: "asc" },
  { createdAt: "asc" },
];
export const VARIANT_IMAGE_ORDER = IMAGE_ORDER;
export const PRODUCT_IMAGE_ORDER = IMAGE_ORDER;

// A product's variants: cheapest first, and when prices are equal (e.g. several colours at the
// same price) the one the admin created first. Without the tie-break the database may return
// equal-priced variants in a different order each time, so the card and the product page could
// open on different colours.
export const VARIANT_ORDER = [{ price: "asc" }, { createdAt: "asc" }];
