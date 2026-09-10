// Single source of truth for the admin permission matrix.
// Every admin-facing "page" is a RESOURCE; every RESOURCE supports the 4 ACTIONS below.
// Route files gate with hasPermission(resource, action); the admin UI renders the same list.

export const ACTIONS = ["create", "read", "update", "delete"];

// resource key -> human label (label is only used for docs / seeding readability)
export const RESOURCES = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  admins: "Admin Users",
  roles: "Roles & Permissions",
  users: "Customers",
  partners: "Partners",
  products: "Products",
  inventory: "Inventory",
  categories: "Categories",
  subcategories: "Subcategories",
  attributes: "Attributes",
  brands: "Brands",
  orders: "Orders",
  returns: "Return Requests",
  coupons: "Coupons",
  referrals: "Referrals",
  banners: "Banners",
  testimonials: "Testimonials",
  "video-reels": "Video Reels",
  "flash-sales": "Flash Sales",
  "product-sections": "Homepage Sections",
  reviews: "Reviews",
  content: "Content Pages",
  contact: "Contact Messages",
  faqs: "FAQs",
  settings: "Store Settings",
  moq: "MOQ Settings",
  "pricing-slabs": "Pricing Slabs",
  payment: "Payment Settings",
  shiprocket: "Shiprocket",
  shipping: "Shipping",
  flavors: "Flavors",
  weights: "Weights",
};

export const RESOURCE_KEYS = Object.keys(RESOURCES);

// Every resource:action pair as a flat list of { resource, action }.
export const ALL_PERMISSIONS = RESOURCE_KEYS.flatMap((resource) =>
  ACTIONS.map((action) => ({ resource, action }))
);

export const isValidPermission = (resource, action) =>
  RESOURCE_KEYS.includes(resource) && ACTIONS.includes(action);

// Filters an arbitrary list down to valid, de-duplicated { resource, action } pairs.
export const sanitizePermissions = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const p of list) {
    if (!p || typeof p !== "object") continue;
    const { resource, action } = p;
    if (!isValidPermission(resource, action)) continue;
    const key = `${resource}:${action}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ resource, action });
  }
  return out;
};

// Default permission sets for the built-in AdminRole enum values.
// Used when creating an admin without a custom Role and without customPermissions.
export const getDefaultPermissionsForRole = (role) => {
  const ro = (resource) => ({ resource, action: "read" });
  const rw = (resource) => [
    { resource, action: "read" },
    { resource, action: "create" },
    { resource, action: "update" },
  ];
  const full = (resource) => ACTIONS.map((action) => ({ resource, action }));

  const base = [ro("dashboard")];

  switch (role) {
    case "SUPER_ADMIN":
      return ALL_PERMISSIONS.slice();

    case "ADMIN":
      return [
        ...base,
        ...full("products"),
        ...full("inventory"),
        ...full("categories"),
        ...full("subcategories"),
        ...full("attributes"),
        ...full("brands"),
        ...rw("orders"),
        ...rw("returns"),
        ...full("coupons"),
        ...full("banners"),
        ...full("testimonials"),
        ...full("video-reels"),
        ...full("flash-sales"),
        ...full("product-sections"),
        ...rw("reviews"),
        ...full("content"),
        ...rw("contact"),
        ...full("faqs"),
        ...rw("users"),
        ro("analytics"),
        ro("partners"),
        ro("referrals"),
        { resource: "settings", action: "read" },
        { resource: "settings", action: "update" },
      ];

    case "MANAGER":
      return [
        ...base,
        ro("products"),
        { resource: "products", action: "update" },
        ...rw("orders"),
        ...rw("returns"),
        ro("categories"),
        ro("brands"),
        ro("inventory"),
        { resource: "inventory", action: "update" },
        ro("coupons"),
        ...rw("reviews"),
        ro("users"),
        ro("analytics"),
      ];

    case "CONTENT_EDITOR":
      return [
        ...base,
        ro("products"),
        { resource: "products", action: "update" },
        ro("categories"),
        { resource: "categories", action: "update" },
        ...full("banners"),
        ...full("testimonials"),
        ...full("video-reels"),
        ...full("product-sections"),
        ...full("content"),
        ...full("faqs"),
      ];

    case "SUPPORT_AGENT":
      return [
        ...base,
        ro("users"),
        ro("orders"),
        ro("returns"),
        { resource: "returns", action: "update" },
        ro("products"),
        ro("reviews"),
        { resource: "reviews", action: "update" },
        ...rw("contact"),
      ];

    default:
      return base;
  }
};
