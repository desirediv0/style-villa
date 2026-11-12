export const PRODUCT_TYPES = {
  ALL: "",
  FEATURED: "featured",
  BESTSELLER: "bestseller",
  TRENDING: "trending",
  NEW: "new",
};

export const PRODUCT_TYPE_TABS = [
  { label: "All", type: "" },
  { label: "Featured", type: "featured" },
  { label: "Best Sellers", type: "bestseller" },
  { label: "Trending", type: "trending" },
  { label: "New Arrivals", type: "new" },
];

export const PRODUCT_TYPE_ALIASES = {
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

  featured: "featured",
  feature: "featured",
  isfeatured: "featured",
  is_featured: "featured",

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

