// Mirror of server/config/permissions.js — the admin permission matrix.
// Keep resource keys in sync with the backend.

export const ACTIONS = ["create", "read", "update", "delete"] as const;
export type ActionKey = (typeof ACTIONS)[number];

// resource key -> human label, grouped for the matrix UI.
export interface ResourceDef {
  key: string;
  label: string;
  group: string;
}

export const RESOURCE_DEFS: ResourceDef[] = [
  { key: "dashboard", label: "Dashboard", group: "Overview" },
  { key: "analytics", label: "Analytics", group: "Overview" },

  { key: "products", label: "Products", group: "Catalog" },
  { key: "inventory", label: "Inventory", group: "Catalog" },
  { key: "categories", label: "Categories", group: "Catalog" },
  { key: "subcategories", label: "Subcategories", group: "Catalog" },
  { key: "attributes", label: "Attributes", group: "Catalog" },
  { key: "brands", label: "Brands", group: "Catalog" },

  { key: "orders", label: "Orders", group: "Sales" },
  { key: "returns", label: "Return Requests", group: "Sales" },
  { key: "coupons", label: "Coupons", group: "Sales" },
  { key: "referrals", label: "Referrals", group: "Sales" },

  { key: "banners", label: "Banners", group: "Content" },
  { key: "testimonials", label: "Testimonials", group: "Content" },
  { key: "video-reels", label: "Video Reels", group: "Content" },
  { key: "flash-sales", label: "Flash Sales", group: "Content" },
  { key: "product-sections", label: "Homepage Sections", group: "Content" },
  { key: "reviews", label: "Reviews", group: "Content" },
  { key: "content", label: "Content Pages", group: "Content" },
  { key: "contact", label: "Contact Messages", group: "Content" },
  { key: "faqs", label: "FAQs", group: "Content" },

  { key: "users", label: "Customers", group: "People" },
  { key: "partners", label: "Partners", group: "People" },
  { key: "admins", label: "Admin Users", group: "People" },
  { key: "roles", label: "Roles & Permissions", group: "People" },

  { key: "settings", label: "Store Settings", group: "Settings" },
  { key: "moq", label: "MOQ Settings", group: "Settings" },
  { key: "pricing-slabs", label: "Pricing Slabs", group: "Settings" },
  { key: "payment", label: "Payment Settings", group: "Settings" },
  { key: "shiprocket", label: "Shiprocket", group: "Settings" },
  { key: "shipping", label: "Shipping", group: "Settings" },
];

export const RESOURCE_KEYS = RESOURCE_DEFS.map((r) => r.key);

export const RESOURCE_GROUPS = Array.from(
  new Set(RESOURCE_DEFS.map((r) => r.group))
);

export const labelFor = (key: string): string =>
  RESOURCE_DEFS.find((r) => r.key === key)?.label ?? key;

// { resource: [action, ...] } -> ["resource:action", ...]
export const matrixToList = (
  matrix: Record<string, string[]>
): { resource: string; action: string }[] => {
  const out: { resource: string; action: string }[] = [];
  Object.entries(matrix).forEach(([resource, actions]) => {
    if (!RESOURCE_KEYS.includes(resource)) return;
    actions.forEach((action) => {
      if ((ACTIONS as readonly string[]).includes(action)) {
        out.push({ resource, action });
      }
    });
  });
  return out;
};

// ["resource:action", ...] -> { resource: [action, ...] }
export const listToMatrix = (list: string[] = []): Record<string, string[]> => {
  const matrix: Record<string, string[]> = {};
  RESOURCE_KEYS.forEach((k) => (matrix[k] = []));
  list.forEach((perm) => {
    const [resource, action] = perm.split(":");
    if (matrix[resource] && !matrix[resource].includes(action)) {
      matrix[resource].push(action);
    }
  });
  return matrix;
};

export const emptyMatrix = (): Record<string, string[]> => {
  const matrix: Record<string, string[]> = {};
  RESOURCE_KEYS.forEach((k) => (matrix[k] = []));
  return matrix;
};
