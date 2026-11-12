export const PRODUCT_TYPES = {
  FEATURED: "featured",
  BESTSELLER: "bestseller",
  TRENDING: "trending",
  NEW: "new",
} as const;

export type ProductTypeKey = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES];

export const PRODUCT_TYPE_OPTIONS = [
  { key: "featured", labelKey: "products.form.settings.types.featured", defaultLabel: "Featured", icon: "⭐" },
  { key: "bestseller", labelKey: "products.form.settings.types.bestseller", defaultLabel: "Bestseller", icon: "📈" },
  { key: "trending", labelKey: "products.form.settings.types.trending", defaultLabel: "Trending", icon: "🔥" },
  { key: "new", labelKey: "products.form.settings.types.new", defaultLabel: "New Arrivals", icon: "🆕" },
];

export const PRODUCT_TYPE_ALIASES: Record<string, string> = {
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

export const normalizeProductType = (type: string | undefined | null): string => {
  if (!type || typeof type !== "string") return "";
  const cleaned = type.trim().toLowerCase();
  return PRODUCT_TYPE_ALIASES[cleaned] || cleaned;
};

