"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { Minus, Plus, AlertCircle, Heart, CheckCircle, Zap, Truck, RefreshCw, ShieldCheck, ChevronRight, Share2, Star } from "lucide-react";
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
    if (initialLoading) return <div className="h-12 w-40 bg-ivory-deep animate-pulse" />;
    const hidePrices = priceSettings?.hidePricesForGuests && !isAuthenticated;
    if (hidePrices || priceSettings === null)
      return (
        <div>
          <p className="font-display text-2xl text-stone">Sign in to view price</p>
          <Link href={`/auth?redirect=/products/${slug}`} className="mt-2 inline-block text-[11px] uppercase tracking-[0.2em] text-gold-dark font-semibold hover:underline">Sign in →</Link>
        </div>
      );
    if (product?.flashSale?.isActive) {
      const fp = parseFloat(product.flashSale.flashSalePrice);
      const rp = parseFloat(product.basePrice);
      return (
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="font-display text-4xl md:text-[2.6rem] text-noir">{formatCurrency(fp)}</span>
          <span className="text-lg text-stone line-through font-light">{formatCurrency(rp)}</span>
          <span className="px-3 py-1.5 bg-gold text-white text-[9px] uppercase tracking-[0.2em] font-bold">−{product.flashSale.discountPercentage}% Flash</span>
        </div>
      );
    }
    if (selectedVariant) {
      const info = effectivePriceInfo || getEffectivePrice(selectedVariant, quantity);
      if (!info) return <p className="font-display text-2xl text-stone">Price unavailable</p>;
      const mrp = info.originalPrice ? parseFloat(info.originalPrice) : null;
      const sp = parseFloat(info.price);
      const hasDiff = mrp && mrp > sp;
      const disc = hasDiff ? Math.round(((mrp - sp) / mrp) * 100) : 0;
      return (
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="font-display text-4xl md:text-[2.6rem] text-noir">{formatCurrency(sp)}</span>
          {hasDiff && <><span className="text-lg text-stone line-through font-light">{formatCurrency(mrp)}</span><span className="px-3 py-1.5 bg-noir text-gold-light text-[9px] uppercase tracking-[0.2em] font-bold">{disc}% Off</span></>}
        </div>
      );
    }
    const bp = parseFloat(product?.basePrice) || 0;
    const rp = parseFloat(product?.regularPrice) || 0;
    const cp = (product?.hasSale && rp > bp) ? bp : (bp || rp);
    const op = (product?.hasSale && rp > bp) ? rp : null;
    const disc = op ? Math.round(((op - cp) / op) * 100) : 0;
    return (
      <div className="flex items-baseline gap-4 flex-wrap">
        <span className="font-display text-4xl md:text-[2.6rem] text-noir">{formatCurrency(cp)}</span>
        {op && <><span className="text-lg text-stone line-through font-light">{formatCurrency(op)}</span><span className="px-3 py-1.5 bg-noir text-gold-light text-[9px] uppercase tracking-[0.2em] font-bold">{disc}% Off</span></>}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <span className="font-display italic text-2xl text-noir/40">Style Villa</span>
      <span className="block h-px w-32 overflow-hidden bg-line relative">
        <span className="absolute inset-y-0 left-0 w-1/3 bg-gold animate-marquee-x" />
      </span>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <div className="w-20 h-20 border border-line flex items-center justify-center mb-8"><AlertCircle className="h-8 w-8 text-stone" strokeWidth={1.2} /></div>
      <h2 className="font-display text-3xl text-noir mb-3">Piece Not Found</h2>
      <p className="text-stone-dark mb-10 font-light">{error || "This piece is no longer in the collection."}</p>
      <Link href="/products" className="btn-luxe">Back to the Collection</Link>
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-7 pb-2">
        <nav className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-stone flex-wrap">
          <Link href="/" className="hover:text-gold-dark transition-colors">Home</Link>
          <span className="text-gold">·</span>
          <Link href="/products" className="hover:text-gold-dark transition-colors">Shop</Link>
          {product.category && <><span className="text-gold">·</span><Link href={`/category/${product.category.slug}`} className="hover:text-gold-dark transition-colors">{product.category.name}</Link></>}
          <span className="text-gold">·</span>
          <span className="text-noir font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Hero: Full Width Split */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Left: Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[640px] no-scrollbar pb-2 lg:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setMainImage(img); setActiveThumb(idx); }}
                    className={`relative flex-shrink-0 w-[72px] h-[92px] overflow-hidden border transition-all duration-300 ${activeThumb === idx ? "border-gold shadow-[0_10px_25px_-12px_rgba(181,98,176,0.6)]" : "border-line hover:border-stone opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={getImageUrl(img.url)} alt="" fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-ivory group cursor-zoom-in" data-cursor="Zoom">
              {images.length > 0 ? (
                <Image src={getImageUrl(primary?.url)} alt={product.name} fill className="object-cover transition-transform duration-1200 ease-luxe group-hover:scale-110" priority sizes="(max-width: 1024px) 100vw, 50vw" />
              ) : (
                <Image src="/placeholder.jpg" alt={product.name} fill className="object-cover" />
              )}
              <div className="absolute inset-3 border border-white/0 group-hover:border-white/40 transition-all duration-700 pointer-events-none z-10" />
              {/* Badges */}
              <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                {product.flashSale?.isActive && (
                  <span className="px-4 py-2 bg-gold text-white text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-1.5">
                    <Zap className="h-3 w-3 fill-noir" /> Flash Sale
                  </span>
                )}
                {outOfStock && (
                  <span className="px-4 py-2 bg-noir text-ivory text-[9px] font-bold uppercase tracking-[0.25em]">Sold Out</span>
                )}
              </div>
              {/* Wishlist */}
              <button onClick={handleWishlist} disabled={isAddingToWishlist} className={`absolute top-5 right-5 w-12 h-12 bg-white/90 backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 border border-transparent hover:border-gold/60 ${isInWishlist ? "text-red-500" : "text-noir/50 hover:text-red-400"}`} aria-label="Wishlist">
                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500" : ""}`} />
              </button>
              {/* Image count */}
              {images.length > 1 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-noir/50 backdrop-blur-md text-ivory text-[10px] tracking-[0.2em] z-20 font-display">
                  {activeThumb + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col lg:sticky lg:top-28 lg:self-start">

            {/* Brand */}
            {product.brand && (
              <span className="luxe-eyebrow mb-4">{product.brand.name}</span>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl md:text-[2.6rem] text-noir leading-[1.1] tracking-tight mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 text-gold fill-gold" />)}</div>
              <span className="text-[11px] tracking-[0.15em] uppercase text-stone">({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-7 pb-7 border-b border-line"><PriceDisplay /></div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-stone-dark leading-relaxed mb-7 font-light tracking-wide">{product.shortDescription}</p>
            )}

            {/* Maison service note */}
            <div className="mb-7 flex items-center gap-4 p-4 border border-gold/30 bg-ivory">
              <ShieldCheck className="h-5 w-5 text-gold-dark flex-shrink-0" strokeWidth={1.2} />
              <p className="text-xs text-noir/70 leading-relaxed tracking-wide">
                <strong className="font-semibold text-noir">Style Villa Promise</strong> — authentic imported pieces, quality-checked by hand before dispatch.
              </p>
            </div>

            {/* Attributes */}
            {product.attributeOptions?.map((attr) => {
              const values = getAvailableValues(attr.id);
              const selId = selectedAttributes[attr.id];
              const selVal = values.find((v) => v.id === selId);
              return (
                <div key={attr.id} className="mb-6">
                  <p className="text-[10px] font-semibold text-noir uppercase tracking-[0.3em] mb-3">
                    {attr.name} {selVal && <span className="text-stone font-normal normal-case tracking-normal text-xs">— {selVal.value}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {values.map((v) => (
                      <button key={v.id} onClick={() => handleAttributeChange(attr.id, v.id)}
                        className={`min-w-[46px] px-5 py-2.5 text-xs tracking-[0.1em] border transition-all duration-300 ${selId === v.id ? "border-noir bg-noir text-gold-light" : "border-line text-noir/60 hover:border-noir hover:text-noir"}`}>
                        {v.value}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Success */}
            {cartSuccess && (
              <div className="flex items-center gap-3 p-4 bg-ivory border border-brand-success/40 text-sm text-brand-success mb-6 font-medium tracking-wide">
                <CheckCircle className="h-5 w-5 flex-shrink-0" /> Added to your bag
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 mb-6" id="main-add-to-cart-btn">
              <div className="flex items-center border border-noir/20 overflow-hidden h-14 bg-white">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= (selectedVariant?.moq || 1) || isAddingToCart} className="w-12 h-full flex items-center justify-center text-noir/60 hover:bg-ivory disabled:opacity-30 transition-colors" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-display text-lg text-noir">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= stock || isAddingToCart} className="w-12 h-full flex items-center justify-center text-noir/60 hover:bg-ivory disabled:opacity-30 transition-colors" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button onClick={handleAddToCart} disabled={isAddingToCart || outOfStock}
                className="flex-1 h-14 bg-noir text-ivory text-[10px] font-semibold uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-40 hover:bg-gold hover:text-white active:scale-[0.99] border border-noir hover:border-gold">
                {isAddingToCart ? <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : outOfStock ? "Sold Out" : "Add to Bag"}
              </button>
            </div>

            {/* Delivery */}
            <div className="grid grid-cols-2 border border-line mb-7">
              <div className="flex items-center gap-3 p-4 border-r border-line">
                <Truck className="h-4 w-4 text-gold-dark flex-shrink-0" strokeWidth={1.2} />
                <div>
                  <p className="text-[9px] font-semibold text-noir uppercase tracking-[0.2em]">Free Delivery</p>
                  <p className="text-[10px] text-stone mt-0.5">2–3 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                <RefreshCw className="h-4 w-4 text-gold-dark flex-shrink-0" strokeWidth={1.2} />
                <div>
                  <p className="text-[9px] font-semibold text-noir uppercase tracking-[0.2em]">Easy Returns</p>
                  <p className="text-[10px] text-stone mt-0.5">7-day return policy</p>
                </div>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="flex items-center gap-2 text-xs text-stone-dark mb-6 tracking-wide">
              <span className="font-semibold text-noir uppercase text-[10px] tracking-[0.2em]">Est. delivery</span>
              <span className="font-display">{getDeliveryDates()}</span>
            </div>

            {/* Meta */}
            <div className="pt-6 border-t border-line space-y-3">
              <div className="flex text-xs items-baseline">
                <span className="w-24 text-[9px] font-semibold text-stone uppercase tracking-[0.25em]">Category</span>
                <span className="text-noir tracking-wide">{product.category?.name || "Fashion"}</span>
              </div>
              {product.brand && (
                <div className="flex text-xs items-baseline">
                  <span className="w-24 text-[9px] font-semibold text-stone uppercase tracking-[0.25em]">Brand</span>
                  <span className="text-noir tracking-wide">{product.brand.name}</span>
                </div>
              )}
            </div>

            {/* Share */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-line">
              <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-stone"><Share2 className="h-3.5 w-3.5" /> Share</span>
              <div className="flex gap-2">
                {[
                  { l: "WA", u: `https://api.whatsapp.com/send?text=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                  { l: "FB", u: `https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                  { l: "TW", u: `https://twitter.com/intent/tweet?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                ].map((s) => (
                  <a key={s.l} href={s.u} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-line flex items-center justify-center text-[9px] font-semibold tracking-[0.1em] text-noir/60 transition-all duration-300 hover:bg-noir hover:text-gold-light hover:border-noir">{s.l}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
          <div className="border border-line p-6 md:p-10 bg-ivory">
            <div className="mb-8">
              <span className="luxe-eyebrow block mb-2">Complete the Look</span>
              <h3 className="font-display text-2xl md:text-3xl text-noir">Frequently Bought <em className="luxe-italic text-gradient">Together</em></h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-2">
                {bundleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-white border border-line hover:border-gold/50 transition-colors">
                    <input type="checkbox" checked={!!bundleSelected[item.id]} disabled={item.isMain} onChange={(e) => setBundleSelected({ ...bundleSelected, [item.id]: e.target.checked })} className="w-4 h-4 border-2 border-stone text-gold-dark focus:ring-gold cursor-pointer disabled:opacity-50 accent-[#A958A4]" />
                    <div className="relative w-14 h-16 bg-ivory overflow-hidden flex-shrink-0">
                      <Image src={getImageUrl(item.image)} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-noir truncate tracking-wide">{item.isMain && <span className="text-[9px] uppercase tracking-[0.2em] text-gold-dark mr-2">This piece</span>}{item.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-noir">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-4 p-8 bg-noir text-ivory flex flex-col gap-5 text-center luxe-grain">
                <div className="relative z-10">
                  <span className="text-[9px] text-white/50 uppercase tracking-[0.35em] block mb-2">Bundle Total</span>
                  <span className="font-display text-4xl text-gold-light">{formatCurrency(bundleTotal)}</span>
                </div>
                <button onClick={handleAddBundleToCart} disabled={isAddingBundle || !Object.values(bundleSelected).some(Boolean)} className="relative z-10 w-full h-12 bg-gold text-white text-[10px] font-semibold uppercase tracking-[0.3em] transition-all duration-300 hover:bg-gold-dark disabled:opacity-40">
                  {isAddingBundle ? "Adding…" : "Add Bundle to Bag"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        <div className="flex gap-0 border-b border-line overflow-x-auto no-scrollbar">
          {[{ k: "description", l: "Description" }, { k: "additional", l: "Details" }, { k: "reviews", l: `Reviews (${product.reviewCount || 0})` }, { k: "shipping", l: "Shipping & Returns" }].map(({ k, l }) => (
            <button key={k} onClick={() => setActiveTab(k)} className={`px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] border-b -mb-[1px] transition-all whitespace-nowrap ${activeTab === k ? "border-gold text-noir" : "border-transparent text-stone hover:text-noir"}`}>{l}</button>
          ))}
        </div>
        <div className="py-10 max-w-4xl">
          {activeTab === "description" && <div className="prose prose-sm text-stone-dark leading-relaxed font-light tracking-wide" dangerouslySetInnerHTML={{ __html: product.description || "No description." }} />}
          {activeTab === "additional" && (
            <div className="border border-line overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[["Style", "Premium Collection"], ["Care", "Follow the enclosed care instructions"], ["Origin", "Premium imported materials"]].map(([k, v], i) => (
                    <tr key={k} className={`border-b border-line last:border-0 ${i % 2 === 0 ? "bg-ivory" : ""}`}>
                      <td className="py-4 px-6 font-semibold text-noir w-40 text-[10px] uppercase tracking-[0.2em]">{k}</td>
                      <td className="py-4 px-6 text-stone-dark font-light tracking-wide">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "reviews" && <ReviewSection product={product} />}
          {activeTab === "shipping" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{ t: "Shipping", i: Truck, r: [["Metro", "24–48h"], ["India", "3–5 days"], ["Free", "All India"]] },
                { t: "Returns", i: RefreshCw, r: [["Window", "7 days"], ["Support", "WhatsApp"], ["Pickup", "Doorstep"]] }].map(({ t, i: I, r }) => (
                <div key={t} className="p-8 border border-line bg-ivory">
                  <h3 className="font-display text-xl text-noir mb-6 flex items-center gap-3"><I className="h-4 w-4 text-gold-dark" strokeWidth={1.2} />{t}</h3>
                  <dl className="space-y-4">{r.map(([k, v]) => <div key={k} className="text-xs flex items-baseline gap-4"><dt className="w-20 font-semibold text-stone uppercase tracking-[0.2em] text-[9px]">{k}</dt><dd className="text-noir/70 tracking-wide">{v}</dd></div>)}</dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="luxe-eyebrow block mb-3">Keep Exploring</span>
              <h2 className="font-display text-3xl md:text-4xl text-noir tracking-tight">You May Also <em className="luxe-italic text-gradient">Like</em></h2>
            </div>
            <Link href="/products" className="luxe-link text-noir shrink-0">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Sticky Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-noir/95 backdrop-blur-md border-t border-gold/25 z-50 py-3">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-11 h-14 overflow-hidden bg-ivory border border-white/10 flex-shrink-0">
                <Image src={getImageUrl(primary?.url)} alt="" fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-sm text-ivory truncate">{product.name}</h4>
                <p className="text-sm text-gold-light font-semibold mt-0.5">{formatCurrency(selectedVariant ? (effectivePriceInfo?.price || selectedVariant.price) : (product.basePrice || product.regularPrice))}</p>
              </div>
            </div>
            <button onClick={handleAddToCart} disabled={isAddingToCart || outOfStock} className="px-8 h-12 bg-gold text-white text-[10px] font-semibold uppercase tracking-[0.25em] transition-all duration-300 hover:bg-gold-dark disabled:opacity-40">
              {isAddingToCart ? "Adding…" : "Add to Bag"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
