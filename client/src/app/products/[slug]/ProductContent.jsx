"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { Minus, Plus, AlertCircle, Heart, CheckCircle, Zap, Truck, RefreshCw, ShoppingBag, ChevronRight, Share2, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import ReviewSection from "./ReviewSection";
import { useAddVariantToCart } from "@/lib/cart-utils";
import { useCart } from "@/lib/cart-context";
import { ProductCard } from "@/components/products/ProductCard";

const getImageUrl = (img) => {
  if (!img) return "/placeholder.jpg";
  if (img.startsWith("http")) return img;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${img}`;
};

export default function ProductContent({ slug }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [effectivePriceInfo, setEffectivePriceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [availableCombinations, setAvailableCombinations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [priceSettings, setPriceSettings] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [bundleSelected, setBundleSelected] = useState({});
  const [isAddingBundle, setIsAddingBundle] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { addVariantToCart } = useAddVariantToCart();
  const { addToCart } = useCart();

  const getEffectivePrice = (variant, qty) => {
    if (!variant) return null;
    const salePrice = variant.salePrice ? parseFloat(variant.salePrice) : null;
    const regPrice = variant.price ? parseFloat(variant.price) : 0;
    let price = salePrice && salePrice < regPrice ? salePrice : regPrice;
    let originalPrice = salePrice && salePrice < regPrice ? regPrice : null;
    if (variant.pricingSlabs?.length > 0) {
      const sorted = [...variant.pricingSlabs].sort((a, b) => b.minQty - a.minQty);
      for (const slab of sorted) {
        if (qty >= slab.minQty && (slab.maxQty === null || qty <= slab.maxQty)) {
          return { price: parseFloat(slab.price), originalPrice: price, source: "SLAB", slab };
        }
      }
    }
    return { price, originalPrice, source: "DEFAULT", slab: null };
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setInitialLoading(true);
    fetchApi(`/public/products/${slug}`)
      .then((res) => {
        const pd = res.data.product;
        setProduct(pd);
        setRelatedProducts(res.data.relatedProducts || []);
        if (pd.images?.length) { setMainImage(pd.images[0]); setActiveThumb(0); }
        if (pd.variants?.length) {
          const combos = pd.variants.filter((v) => v.isActive).map((v) => ({ attributeValueIds: v.attributes?.map((a) => a.attributeValueId) || [], variant: v }));
          setAvailableCombinations(combos);
          if (pd.attributeOptions?.length) {
            const defaults = {};
            pd.attributeOptions.forEach((a) => { if (a.values?.length) defaults[a.id] = a.values[0].id; });
            setSelectedAttributes(defaults);
            const match = combos.find((c) => c.attributeValueIds.sort().join(",") === Object.values(defaults).sort().join(","));
            const v = match?.variant || pd.variants[0];
            setSelectedVariant(v);
            setQuantity(v.moq || 1);
            setEffectivePriceInfo(getEffectivePrice(v, v.moq || 1));
          } else {
            const v = pd.variants[0];
            setSelectedVariant(v);
            setQuantity(v.moq || 1);
            setEffectivePriceInfo(getEffectivePrice(v, v.moq || 1));
          }
        }
      })
      .catch((err) => { console.error(err); setError(err.message); })
      .finally(() => { setLoading(false); setInitialLoading(false); });
  }, [slug]);

  useEffect(() => {
    fetchApi("/public/price-visibility-settings")
      .then((r) => { if (r.success) setPriceSettings(r.data); })
      .catch(() => setPriceSettings({ hidePricesForGuests: false }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !product) return;
    fetchApi("/users/wishlist", { credentials: "include" })
      .then((r) => setIsInWishlist(r.data.wishlistItems?.some((i) => i.productId === product.id)))
      .catch(console.error);
  }, [isAuthenticated, product]);

  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById("main-add-to-cart-btn");
      if (btn) setShowStickyBar(btn.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (product) {
      const initial = { [product.id]: true };
      relatedProducts.slice(0, 3).forEach((p) => { initial[p.id] = true; });
      setBundleSelected(initial);
    }
  }, [product, relatedProducts]);

  const handleAttributeChange = (attrId, valueId) => {
    const next = { ...selectedAttributes, [attrId]: valueId };
    setSelectedAttributes(next);
    const selIds = Object.values(next).sort();
    const match = availableCombinations.find((c) => {
      const cIds = c.attributeValueIds.sort();
      return cIds.length === selIds.length && cIds.every((id, i) => id === selIds[i]);
    });
    if (match) {
      setSelectedVariant(match.variant);
      const moq = match.variant.moq || 1;
      if (quantity < moq) setQuantity(moq);
      setEffectivePriceInfo(getEffectivePrice(match.variant, quantity < moq ? moq : quantity));
    } else { setSelectedVariant(null); setEffectivePriceInfo(null); }
  };

  const getAvailableValues = (attrId) => {
    if (!product?.attributeOptions) return [];
    const attr = product.attributeOptions.find((a) => a.id === attrId);
    if (!attr?.values) return [];
    const others = { ...selectedAttributes }; delete others[attrId];
    const available = new Set();
    availableCombinations.forEach((c) => {
      const othIds = Object.values(others);
      if (othIds.length === 0 || othIds.every((id) => c.attributeValueIds.includes(id)))
        c.variant.attributes?.forEach((a) => { if (a.attributeId === attrId) available.add(a.attributeValueId); });
    });
    return attr.values.filter((v) => available.has(v.id));
  };

  const handleQuantityChange = (delta) => {
    const moq = selectedVariant?.moq || 1;
    const stock = selectedVariant?.stock || selectedVariant?.quantity || 0;
    const next = quantity + delta;
    if (next < moq || (stock > 0 && next > stock)) return;
    setQuantity(next);
    if (selectedVariant) setEffectivePriceInfo(getEffectivePrice(selectedVariant, next));
  };

  const handleAddToCart = async () => {
    const v = selectedVariant || product?.variants?.[0];
    if (!v) return;
    setIsAddingToCart(true); setCartSuccess(false);
    try {
      const result = await addVariantToCart(v, quantity, product.name);
      if (result.success) { setCartSuccess(true); setTimeout(() => setCartSuccess(false), 3000); }
    } catch (err) { console.error(err); }
    finally { setIsAddingToCart(false); }
  };

  const handleAddBundleToCart = async () => {
    setIsAddingBundle(true);
    try {
      const mainV = selectedVariant || product?.variants?.[0];
      if (mainV && bundleSelected[product.id]) await addToCart(mainV.id, quantity);
      for (const p of relatedProducts.slice(0, 3)) {
        if (bundleSelected[p.id]) { const v = p.variants?.[0]; if (v) await addToCart(v.id, 1); }
      }
      setCartSuccess(true); setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setIsAddingBundle(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { router.push(`/auth?redirect=/products/${slug}`); return; }
    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        const r = await fetchApi("/users/wishlist", { credentials: "include" });
        const item = r.data.wishlistItems.find((i) => i.productId === product.id);
        if (item) { await fetchApi(`/users/wishlist/${item.id}`, { method: "DELETE", credentials: "include" }); setIsInWishlist(false); }
      } else {
        await fetchApi("/users/wishlist", { method: "POST", credentials: "include", body: JSON.stringify({ productId: product.id }) });
        setIsInWishlist(true);
      }
    } catch (err) { console.error(err); }
    finally { setIsAddingToWishlist(false); }
  };

  const getDeliveryDates = () => {
    const today = new Date();
    const f = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const s = new Date(today); s.setDate(today.getDate() + 3);
    const e = new Date(today); e.setDate(today.getDate() + 6);
    return `${f(s).toUpperCase()} – ${f(e).toUpperCase()}`;
  };

  const getImages = () => {
    if (selectedVariant?.images?.length) return selectedVariant.images;
    if (product?.images?.length) return product.images;
    return product?.variants?.find((v) => v.images?.length)?.images || [];
  };

  const PriceDisplay = () => {
    if (initialLoading) return <div className="h-12 w-40 bg-gray-100 rounded-2xl animate-pulse" />;
    const hidePrices = priceSettings?.hidePricesForGuests && !isAuthenticated;
    if (hidePrices || priceSettings === null)
      return (
        <div>
          <p className="text-2xl font-bold text-gray-300">Login to view price</p>
          <Link href={`/auth?redirect=/products/${slug}`} className="mt-2 inline-block text-sm text-[#A458A6] font-semibold hover:underline">Sign in →</Link>
        </div>
      );
    if (product?.flashSale?.isActive) {
      const fp = parseFloat(product.flashSale.flashSalePrice);
      const rp = parseFloat(product.basePrice);
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-4xl font-bold text-gray-900">{formatCurrency(fp)}</span>
          <span className="text-lg text-gray-400 line-through">{formatCurrency(rp)}</span>
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">-{product.flashSale.discountPercentage}%</span>
        </div>
      );
    }
    if (selectedVariant) {
      const info = effectivePriceInfo || getEffectivePrice(selectedVariant, quantity);
      if (!info) return <p className="text-2xl text-gray-400">Price unavailable</p>;
      const mrp = info.originalPrice ? parseFloat(info.originalPrice) : null;
      const sp = parseFloat(info.price);
      const hasDiff = mrp && mrp > sp;
      const disc = hasDiff ? Math.round(((mrp - sp) / mrp) * 100) : 0;
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-4xl font-bold text-gray-900">{formatCurrency(sp)}</span>
          {hasDiff && <><span className="text-lg text-gray-400 line-through">{formatCurrency(mrp)}</span><span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">{disc}% OFF</span></>}
        </div>
      );
    }
    const bp = parseFloat(product?.basePrice) || 0;
    const rp = parseFloat(product?.regularPrice) || 0;
    const cp = (product?.hasSale && rp > bp) ? bp : (bp || rp);
    const op = (product?.hasSale && rp > bp) ? rp : null;
    const disc = op ? Math.round(((op - cp) / op) * 100) : 0;
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-4xl font-bold text-gray-900">{formatCurrency(cp)}</span>
        {op && <><span className="text-lg text-gray-400 line-through">{formatCurrency(op)}</span><span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">{disc}% OFF</span></>}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-3 border-[#A458A6] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400 tracking-widest uppercase font-semibold">Loading...</p>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6"><AlertCircle className="h-10 w-10 text-gray-300" /></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
      <p className="text-gray-500 mb-8">{error || "This product doesn't exist."}</p>
      <Link href="/products" className="px-8 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-[#A458A6] transition-colors">Back to Shop</Link>
    </div>
  );

  const images = getImages();
  const primary = mainImage && images.some((i) => i.url === mainImage.url) ? mainImage : (images.find((i) => i.isPrimary) || images[0]);
  const stock = selectedVariant?.stock || selectedVariant?.quantity || product.stock || 15;
  const outOfStock = stock === 0;

  const bundleItems = [
    { id: product.id, name: product.name, price: parseFloat(effectivePriceInfo?.price || selectedVariant?.salePrice || selectedVariant?.price || product.basePrice || 0), isMain: true, stock, image: primary?.url },
    ...relatedProducts.slice(0, 3).map((p) => { const v = p.variants?.[0] || {}; return { id: p.id, name: p.name, price: parseFloat(v.salePrice || v.price || p.basePrice || 0), isMain: false, stock: p.stock || 10, image: p.image || p.images?.[0]?.url }; })
  ];
  const bundleTotal = bundleItems.reduce((sum, item) => sum + (bundleSelected[item.id] ? (item.price * (item.isMain ? quantity : 1)) : 0), 0);

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-[#A458A6] transition-colors">Home</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link href="/products" className="hover:text-[#A458A6] transition-colors">Shop</Link>
          {product.category && <><ChevronRight className="h-2.5 w-2.5" /><Link href={`/category/${product.category.slug}`} className="hover:text-[#A458A6] transition-colors">{product.category.name}</Link></>}
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Hero: Full Width Split */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* Left: Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar pb-2 lg:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setMainImage(img); setActiveThumb(idx); }}
                    className={`relative flex-shrink-0 w-[72px] h-[90px] rounded-2xl overflow-hidden border-2 transition-all ${activeThumb === idx ? "border-[#A458A6] shadow-lg shadow-purple-200" : "border-gray-100 hover:border-gray-300"}`}
                  >
                    <Image src={getImageUrl(img.url)} alt="" fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 group cursor-zoom-in">
              {images.length > 0 ? (
                <Image src={getImageUrl(primary?.url)} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" priority sizes="(max-width: 1024px) 100vw, 50vw" />
              ) : (
                <Image src="/placeholder.jpg" alt={product.name} fill className="object-cover" />
              )}
              {/* Badges */}
              <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                {product.flashSale?.isActive && (
                  <span className="px-4 py-2 bg-[#A458A6] text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-lg">
                    <Zap className="h-3.5 w-3.5 fill-white" /> FLASH SALE
                  </span>
                )}
                {outOfStock && (
                  <span className="px-4 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">SOLD OUT</span>
                )}
              </div>
              {/* Wishlist */}
              <button onClick={handleWishlist} disabled={isAddingToWishlist} className={`absolute top-5 right-5 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-all shadow-lg z-20 hover:scale-110 ${isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500" : ""}`} />
              </button>
              {/* Image count */}
              {images.length > 1 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-medium z-20">
                  {activeThumb + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">

            {/* Brand */}
            {product.brand && (
              <span className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: "#A458A6" }}>{product.brand.name}</span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{product.name}</h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}</div>
              <span className="text-xs text-gray-400">({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-100"><PriceDisplay /></div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{product.shortDescription}</p>
            )}

            {/* Urgency Badge */}
            <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
              <ShoppingBag className="h-5 w-5 text-orange-500 animate-bounce flex-shrink-0" />
              <p className="text-xs text-orange-700"><strong>12 people</strong> are viewing this right now. Almost gone!</p>
            </div>

            {/* Attributes */}
            {product.attributeOptions?.map((attr) => {
              const values = getAvailableValues(attr.id);
              const selId = selectedAttributes[attr.id];
              const selVal = values.find((v) => v.id === selId);
              return (
                <div key={attr.id} className="mb-5">
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    {attr.name} {selVal && <span className="text-gray-400 font-normal">— {selVal.value}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {values.map((v) => (
                      <button key={v.id} onClick={() => handleAttributeChange(attr.id, v.id)}
                        className={`px-5 py-2.5 text-xs font-bold rounded-full border-2 transition-all ${selId === v.id ? "border-[#A458A6] bg-[#A458A6] text-white shadow-md shadow-purple-200" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                        {v.value}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Success */}
            {cartSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-700 mb-5 font-semibold">
                <CheckCircle className="h-5 w-5 flex-shrink-0" /> Added to your bag!
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 mb-5" id="main-add-to-cart-btn">
              <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden h-14 bg-white">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= (selectedVariant?.moq || 1) || isAddingToCart} className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold text-base text-gray-900">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= stock || isAddingToCart} className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button onClick={handleAddToCart} disabled={isAddingToCart || outOfStock}
                className="flex-1 h-14 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
                {isAddingToCart ? <div className="h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" /> : "Add to Cart"}
              </button>
            </div>

            {/* Delivery */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <Truck className="h-4 w-4 text-[#A458A6] flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-900 uppercase">Free Delivery</p>
                  <p className="text-[10px] text-gray-400">2-3 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <RefreshCw className="h-4 w-4 text-[#14A8E6] flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-gray-900 uppercase">Easy Returns</p>
                  <p className="text-[10px] text-gray-400">7-day return policy</p>
                </div>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
              <span className="font-semibold text-gray-900">Est. delivery:</span>
              <span>{getDeliveryDates()}</span>
            </div>

            {/* Meta */}
            <div className="pt-5 border-t border-gray-100 space-y-2.5">
              <div className="flex text-xs">
                <span className="w-20 font-bold text-gray-400 uppercase tracking-wider">Category</span>
                <span className="text-gray-900 font-medium">{product.category?.name || "Fashion"}</span>
              </div>
              {product.brand && (
                <div className="flex text-xs">
                  <span className="w-20 font-bold text-gray-400 uppercase tracking-wider">Brand</span>
                  <span className="text-gray-900 font-medium">{product.brand.name}</span>
                </div>
              )}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
              <Share2 className="h-4 w-4 text-gray-400" />
              <div className="flex gap-2">
                {[
                  { l: "WA", c: "bg-green-500", u: `https://api.whatsapp.com/send?text=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                  { l: "FB", c: "bg-blue-600", u: `https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                  { l: "TW", c: "bg-sky-500", u: `https://twitter.com/intent/tweet?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                ].map((s) => (
                  <a key={s.l} href={s.u} target="_blank" rel="noopener noreferrer" className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:-translate-y-0.5 ${s.c}`}>{s.l}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
          <div className="border border-gray-100 rounded-3xl p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>+</span>
              Frequently Bought Together
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                {bundleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-colors">
                    <input type="checkbox" checked={!!bundleSelected[item.id]} disabled={item.isMain} onChange={(e) => setBundleSelected({ ...bundleSelected, [item.id]: e.target.checked })} className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#A458A6] focus:ring-[#A458A6] cursor-pointer disabled:opacity-50" />
                    <div className="relative w-14 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={getImageUrl(item.image)} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.isMain && <span className="text-gray-400 font-normal">This: </span>}{item.name}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-4 p-6 bg-white border border-gray-100 rounded-3xl flex flex-col gap-4 text-center shadow-lg">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Bundle Total</span>
                  <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(bundleTotal)}</span>
                </div>
                <button onClick={handleAddBundleToCart} disabled={isAddingBundle || !Object.values(bundleSelected).some(Boolean)} className="w-full h-12 text-white text-[10px] font-bold uppercase tracking-wider rounded-2xl transition-all hover:shadow-lg disabled:opacity-40" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
                  {isAddingBundle ? "Adding..." : "Add Bundle to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
          {[{ k: "description", l: "Description" }, { k: "additional", l: "Details" }, { k: "reviews", l: `Reviews (${product.reviewCount || 0})` }, { k: "shipping", l: "Shipping & Returns" }].map(({ k, l }) => (
            <button key={k} onClick={() => setActiveTab(k)} className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider border-b-2 -mb-[1px] transition-all whitespace-nowrap ${activeTab === k ? "border-[#A458A6] text-[#A458A6]" : "border-transparent text-gray-400 hover:text-gray-700"}`}>{l}</button>
          ))}
        </div>
        <div className="py-8 max-w-4xl">
          {activeTab === "description" && <div className="prose prose-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || "No description." }} />}
          {activeTab === "additional" && (
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[["Style", "Premium Collection"], ["Care", "Avoid water and chemicals"], ["Material", "925 Sterling Silver / 24K Gold Plating"]].map(([k, v], i) => (
                    <tr key={k} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "bg-gray-50" : ""}`}>
                      <td className="py-4 px-5 font-bold text-gray-700 w-40">{k}</td>
                      <td className="py-4 px-5 text-gray-600">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "reviews" && <ReviewSection product={product} />}
          {activeTab === "shipping" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{ t: "Shipping", i: Truck, r: [["Metro", "24-48h"], ["India", "3-5 days"], ["Free", "All India"]] },
                { t: "Returns", i: RefreshCw, r: [["Window", "7 days"], ["Support", "WhatsApp"], ["Pickup", "Doorstep"]] }].map(({ t, i: I, r }) => (
                <div key={t} className="rounded-2xl p-6 border border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2"><I className="h-4 w-4 text-[#A458A6]" />{t}</h3>
                  <dl className="space-y-3">{r.map(([k, v]) => <div key={k} className="text-xs"><dt className="font-bold text-gray-800 uppercase">{k}</dt><dd className="text-gray-500 mt-0.5">{v}</dd></div>)}</dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">You May Also Like</h2>
            <Link href="/products" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A458A6] hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Sticky Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                <Image src={getImageUrl(primary?.url)} alt="" fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                <p className="text-sm font-extrabold text-gray-900 mt-0.5">{formatCurrency(selectedVariant ? (effectivePriceInfo?.price || selectedVariant.price) : (product.basePrice || product.regularPrice))}</p>
              </div>
            </div>
            <button onClick={handleAddToCart} disabled={isAddingToCart || outOfStock} className="px-8 h-12 text-white text-[10px] font-bold uppercase tracking-wider rounded-2xl transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}