"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, ShoppingCart, Check, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchApi, formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

const calculateDiscountPercentage = (regularPrice, salePrice) => {
  if (!regularPrice || !salePrice || regularPrice <= salePrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

const parsePrice = (value) => {
  if (value === null || value === undefined) return null;
  if (value === 0) return 0;
  const parsed = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(parsed) ? null : parsed;
};

export const ProductCard = ({ product, viewMode = "grid" }) => {
  const isList = viewMode === "list";
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [wishlistItems, setWishlistItems] = useState({});
  const [isAddingToWishlist, setIsAddingToWishlist] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [priceSettings, setPriceSettings] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    fetchApi("/users/wishlist", { credentials: "include" })
      .then((res) => {
        const map = res.data?.wishlistItems?.reduce((acc, item) => {
          acc[item.productId] = true;
          return acc;
        }, {}) || {};
        setWishlistItems(map);
      })
      .catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchApi("/public/price-visibility-settings")
      .then((res) => { if (res.success) setPriceSettings(res.data); })
      .catch(() => setPriceSettings({ hidePricesForGuests: false }));
  }, []);

  const getAllProductImages = useMemo(() => {
    const images = [];
    const imageUrls = new Set();
    const push = (raw) => {
      const url = raw?.url || raw;
      if (!url) return;
      const full = getImageUrl(url);
      if (!imageUrls.has(full)) { imageUrls.add(full); images.push(full); }
    };
    product.variants?.forEach((v) => v.images?.forEach(push));
    product.images?.forEach(push);
    if (images.length === 0 && product.image) push(product.image);
    if (images.length === 0) images.push("/placeholder.jpg");
    return images;
  }, [product]);

  useEffect(() => {
    if (!isHovered || getAllProductImages.length <= 1) { setCurrentImageIndex(0); return; }
    const t = setInterval(() => setCurrentImageIndex((p) => (p + 1) % getAllProductImages.length), 2000);
    return () => clearInterval(t);
  }, [isHovered, getAllProductImages.length]);

  const basePriceField = parsePrice(product.basePrice);
  const regularPriceField = parsePrice(product.regularPrice);
  const priceField = parsePrice(product.price);
  const salePriceField = parsePrice(product.salePrice);

  const hasFlashSale = product.flashSale?.isActive === true;
  const flashSalePrice = hasFlashSale ? parsePrice(product.flashSale.flashSalePrice) : null;
  const flashSaleDiscountPercent = hasFlashSale ? product.flashSale.discountPercentage : 0;

  let hasSale = product.hasSale !== undefined && product.hasSale !== null ? Boolean(product.hasSale) : false;
  if (!hasSale && salePriceField !== null && salePriceField > 0) {
    if ((regularPriceField && salePriceField < regularPriceField) || (priceField && salePriceField < priceField))
      hasSale = true;
  }

  let originalPrice = null;
  let currentPrice = 0;
  if (basePriceField !== null && regularPriceField !== null) {
    currentPrice = basePriceField;
    originalPrice = hasSale && basePriceField < regularPriceField ? regularPriceField : null;
  } else if (salePriceField !== null && hasSale) {
    currentPrice = salePriceField;
    originalPrice = priceField || basePriceField || regularPriceField || null;
  } else {
    currentPrice = basePriceField || regularPriceField || priceField || salePriceField || 0;
  }
  if (!currentPrice || isNaN(currentPrice)) currentPrice = 0;

  let displayPrice = currentPrice;
  let showFlashSaleBadge = false;
  if (hasFlashSale && flashSalePrice !== null) {
    if (!originalPrice) originalPrice = currentPrice;
    displayPrice = flashSalePrice;
    showFlashSaleBadge = true;
  }

  const discountPercent = showFlashSaleBadge
    ? flashSaleDiscountPercent
    : hasSale && originalPrice && currentPrice
      ? calculateDiscountPercentage(originalPrice, currentPrice)
      : 0;

  const showPrice = !priceSettings?.hidePricesForGuests || isAuthenticated;
  const isOutOfStock = product.stock === 0 || product.inStock === false;
  const inWishlist = wishlistItems[product.id];

  const handleAddToWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { router.push(`/auth?redirect=/products/${product.slug}`); return; }
    setIsAddingToWishlist((p) => ({ ...p, [product.id]: true }));
    try {
      if (inWishlist) {
        const res = await fetchApi("/users/wishlist", { credentials: "include" });
        const item = res.data?.wishlistItems?.find((i) => i.productId === product.id);
        if (item) {
          await fetchApi(`/users/wishlist/${item.id}`, { method: "DELETE", credentials: "include" });
          setWishlistItems((p) => { const n = { ...p }; delete n[product.id]; return n; });
        }
      } else {
        await fetchApi("/users/wishlist", {
          method: "POST", credentials: "include",
          body: JSON.stringify({ productId: product.id }),
        });
        setWishlistItems((p) => ({ ...p, [product.id]: true }));
      }
    } catch { toast.error("Failed to update wishlist"); }
    finally { setIsAddingToWishlist((p) => ({ ...p, [product.id]: false })); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!showPrice) { toast.error("Please login to purchase items"); return; }
    const variantId = product.variants?.[0]?.id;
    if (!variantId) {
      toast.error("Select options on product page");
      router.push(`/products/${product.slug}`);
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(variantId, 1);
      setAddedToCart(true);
      toast.success("Added to cart!");
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) { console.error(err); }
    finally { setIsAddingToCart(false); }
  };

  /* ── LIST MODE ── */
  if (isList) {
    return (
      <div
        className="group relative bg-white overflow-hidden flex flex-row transition-all duration-300 hover:shadow-lg border border-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/products/${product.slug}`}
          className="flex-shrink-0 flex items-center justify-center overflow-hidden bg-gray-50"
          style={{ width: "160px", minHeight: "180px" }}
        >
          <Image
            src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
            alt={product.name}
            width={140}
            height={140}
            className="object-contain transition-transform duration-500 group-hover:scale-105 p-3"
            style={{ width: "100%", height: "auto", maxHeight: "150px" }}
          />
        </Link>
        <div className="flex flex-col flex-1 p-4 justify-between min-w-0">
          <div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-sm font-semibold mb-0.5 line-clamp-1 hover:text-gray-600 transition-colors text-gray-900">{product.name}</h3>
            </Link>
            {product.category?.name && (
              <span className="text-xs text-gray-400">{product.category.name}</span>
            )}
            {showPrice ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-base font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
                {originalPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(originalPrice)}</span>}
              </div>
            ) : (
              <Link href="/auth" className="text-xs text-gray-500 mt-2 block">Login for Price</Link>
            )}
            {product.avgRating > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-3 h-3", s <= Math.round(product.avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">({product.reviewCount || 0})</span>
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!showPrice || isAddingToCart || isOutOfStock}
            className="mt-3 flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium transition-all rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 disabled:opacity-50"
          >
            {isAddingToCart ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : addedToCart ? <><Check className="w-3.5 h-3.5" /> Added</> : isOutOfStock ? "Out of Stock" : <><ShoppingCart className="w-3.5 h-3.5" /> Add to cart</>}
          </button>
        </div>
      </div>
    );
  }

  /* ── GRID MODE ── */
  return (
    <div
      className="group relative bg-white flex flex-col transition-all duration-300 w-full overflow-hidden hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image section */}
      <div className="relative block overflow-hidden bg-gray-50" style={{ aspectRatio: "3/4" }}>
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={getAllProductImages[currentImageIndex] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 z-20 text-[10px] tracking-wide text-white px-2.5 py-1 bg-gray-900 font-medium rounded-md pointer-events-none">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist[product.id]}
          className={cn(
            "absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full transition-all duration-300 shadow-sm",
            inWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500"
          )}
          aria-label="Wishlist"
        >
          {isAddingToWishlist[product.id]
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />}
        </button>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Add to cart overlay on hover */}
        {!isOutOfStock && showPrice && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={cn(
              "absolute bottom-0 inset-x-0 z-20 py-3 flex items-center justify-center gap-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium tracking-wide transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            )}
          >
            {isAddingToCart ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : addedToCart ? (
              <><Check className="w-4 h-4" /> Added</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Add to cart</>
            )}
          </button>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-col p-4">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-[13px] font-medium leading-snug text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.category?.name && (
          <span className="text-[11px] text-gray-400 mt-0.5">{product.category.name}</span>
        )}

        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("w-3 h-3", s <= Math.round(product.avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2">
          {showPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(displayPrice)}
              </span>
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <Link href="/auth" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              Login for Price
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
