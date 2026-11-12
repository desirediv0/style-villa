export const PRODUCT_TYPES = {
  FEATURED: "featured",
  BESTSELLER: "bestseller",
  TRENDING: "trending",
  NEW: "new",
};

export const PRODUCT_TYPE_KEYS = ["featured", "bestseller", "trending", "new"];

export const PRODUCT_TYPE_ALIASES = {
  // Bestseller aliases
  bestseller: "bestseller",
  bestsellers: "bestseller",
  "best-seller": "bestseller",
  "best-sellers": "bestseller",
  best_seller: "bestseller",
  best_sellers: "bestseller",
  bestselling: "bestseller",
  "best-selling": "bestseller",
  isbestseller: "bestseller",
  is_bestseller: "bestseller",

  // New arrivals aliases
  new: "new",
  "new-arrival": "new",
  "new-arrivals": "new",
  new_arrival: "new",
  new_arrivals: "new",
  newarrival: "new",
  newarrivals: "new",
  latest: "new",
  isnew: "new",
  is_new: "new",
  isnewarrival: "new",

  // Featured aliases
  featured: "featured",
  feature: "featured",
  isfeatured: "featured",
  is_featured: "featured",

  // Trending aliases
  trending: "trending",
  trend: "trending",
  istrending: "trending",
  is_trending: "trending",
  popular: "trending",
};

export const normalizeProductType = (type) => {
  if (!type || typeof type !== "string") return "";
  const cleaned = type.trim().toLowerCase();
  return PRODUCT_TYPE_ALIASES[cleaned] || cleaned;
};

export const getLegacyAliasesForType = (canonicalType) => {
  const norm = normalizeProductType(canonicalType);
  return Object.keys(PRODUCT_TYPE_ALIASES).filter(
    (k) => PRODUCT_TYPE_ALIASES[k] === norm
  );
};

