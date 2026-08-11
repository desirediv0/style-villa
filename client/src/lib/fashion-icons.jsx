// Shared fashion category icon mapping
// Used by CategoriesCarousel, CategoryGrid, and page layouts

import {
  Sparkles,
  Scissors,
  Crown,
  Heart,
  Gift,
  Gem,
  Award,
  Wrench,
  Package,
  ShoppingBag,
  Shirt,
  Footprints,
  Watch,
} from "lucide-react";

// Map: keyword -> { icon component, color }
export const FASHION_ICON_MAP = [
  { keys: ["clothing", "apparel", "shirt", "dress", "top", "tshirt"], Icon: Shirt, color: "#A958A4" },
  { keys: ["bag", "handbag", "purse", "tote", "clutch"], Icon: ShoppingBag, color: "#00AEEF" },
  { keys: ["shoe", "footwear", "sandal", "heel", "sneaker", "boot"], Icon: Footprints, color: "#A958A4" },
  { keys: ["accessories", "jewellery", "jewelry", "necklace", "earring", "ring", "bracelet"], Icon: Gem, color: "#00AEEF" },
  { keys: ["watch", "watches", "timepiece"], Icon: Watch, color: "#A958A4" },
  { keys: ["hair", "headband", "clip", "scarf"], Icon: Crown, color: "#00AEEF" },
  { keys: ["custom", "bespoke", "designer"], Icon: Award, color: "#A958A4" },
  { keys: ["gift", "packaging", "box"], Icon: Gift, color: "#00AEEF" },
  { keys: ["stitch", "tailor", "alteration"], Icon: Scissors, color: "#A958A4" },
];

export function getFashionIcon(name = "", slug = "") {
  const n = name.toLowerCase();
  const s = slug.toLowerCase();
  for (const entry of FASHION_ICON_MAP) {
    if (entry.keys.some((k) => n.includes(k) || s.includes(k))) {
      return entry;
    }
  }
  // Default fallback icon
  return { Icon: Sparkles, color: "#A958A4" };
}
