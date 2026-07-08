"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, List, SlidersHorizontal, X, Grid3X3, LayoutGrid, Search,
} from "lucide-react";
import { ClientOnly } from "@/components/client-only";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";

function ProductCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden animate-pulse border border-line">
      <div className="aspect-[3/4] bg-ivory-deep" />
      <div className="p-4 space-y-2 flex flex-col items-center">
        <div className="h-2.5 bg-ivory-deep w-16" />
        <div className="h-3.5 bg-ivory-deep w-full" />
        <div className="h-3.5 bg-ivory-deep w-2/3" />
        <div className="h-4 bg-ivory-deep w-20 mt-2" />
      </div>
    </div>
  );
}

function FilterSection({ title, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-line py-5 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-[10px] text-noir uppercase tracking-[0.3em] font-semibold group-hover:text-gold-dark transition-colors">{title}</span>
        <span className={`text-stone text-lg font-light transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-[400px] mt-5 opacity-100" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const decodePlus = (s) => (s ? s.replace(/\+/g, " ") : "");
  const searchQuery = decodePlus(searchParams.get("search") || "");
  const categorySlug = searchParams.get("category") || "";
  const productType = searchParams.get("productType") || "";
  const colorId = searchParams.get("color") || "";
  const sizeId = searchParams.get("size") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortParam = searchParams.get("sort") || "createdAt";
  const orderParam = searchParams.get("order") || "desc";
  const pageParam = parseInt(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewCols, setViewCols] = useState(4);
  const [viewMode, setViewMode] = useState("grid");

  const [selectedColors, setSelectedColors] = useState(colorId ? [colorId] : []);
  const [selectedSizes, setSelectedSizes] = useState(sizeId ? [sizeId] : []);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [openSections, setOpenSections] = useState({ categories: true, price: true, color: true, size: true });

  const [priceRange, setPriceRange] = useState({ min: minPrice || 0, max: maxPrice || 1000 });
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [pagination, setPagination] = useState({ page: pageParam, limit: 12, total: 0, pages: 0 });

  const [filters, setFilters] = useState({
    search: searchQuery, category: categorySlug, productType,
    color: colorId, size: sizeId, minPrice, maxPrice,
    sort: sortParam, order: orderParam,
  });

  useEffect(() => { setSearchInput(filters.search || ""); }, [filters.search]);

  useEffect(() => {
    Promise.all([
      fetchApi("/public/categories"),
      fetchApi("/public/filter-attributes"),
    ]).then(([catRes, attrRes]) => {
      setCategories(catRes.data.categories || []);
      setColors(attrRes.data.colors || []);
      setSizes(attrRes.data.sizes || []);
      if (Array.isArray(attrRes.data.attributes)) {
        setAllAttributes(attrRes.data.attributes);
      } else {
        const attrs = [];
        if (attrRes.data.colors?.length) attrs.push({ id: "color-attr", name: "Color", values: attrRes.data.colors });
        if (attrRes.data.sizes?.length) attrs.push({ id: "size-attr", name: "Size", values: attrRes.data.sizes });
        setAllAttributes(attrs);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response;
        if (filters.productType) {
          const q = new URLSearchParams({ limit: String(pagination.limit * pagination.page) });
          response = await fetchApi(`/public/products/type/${filters.productType}?${q}`);
          const all = response.data?.products || [];
          const s = (pagination.page - 1) * pagination.limit;
          setProducts(all.slice(s, s + pagination.limit));
          setPagination((p) => ({ ...p, total: all.length, pages: Math.ceil(all.length / p.limit) }));
        } else {
          const q = new URLSearchParams({
            page: String(pagination.page),
            limit: String(pagination.limit),
            sort: ["createdAt", "updatedAt", "name", "price", "featured"].includes(filters.sort) ? filters.sort : "createdAt",
            order: filters.order,
          });
          if (filters.search) q.append("search", filters.search);
          if (filters.category) q.append("category", filters.category);
          if (filters.minPrice) q.append("minPrice", filters.minPrice);
          if (filters.maxPrice) q.append("maxPrice", filters.maxPrice);

          const attrIds = new Set();
          if (selectedColors.length > 0) { q.append("color", selectedColors[0]); selectedColors.forEach((id) => attrIds.add(id)); }
          if (selectedSizes.length > 0) { q.append("size", selectedSizes[0]); selectedSizes.forEach((id) => attrIds.add(id)); }
          Object.keys(selectedAttributes).forEach((k) => {
            if (k !== "color" && k !== "size") (selectedAttributes[k] || []).forEach((id) => attrIds.add(id));
          });
          if (attrIds.size > 0) q.append("attributeValueIds", [...attrIds].join(","));

          response = await fetchApi(`/public/products?${q}`);
          setProducts(response.data.products || []);
          setPagination(response.data.pagination || {});
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, pagination.page, selectedColors, selectedSizes, selectedAttributes]);

  const updateURL = (f) => {
    const pairs = [];
    const add = (k, v) => {
      if (v !== undefined && v !== null && v !== "")
        pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v)).replace(/%20/g, "+")}`);
    };
    add("search", f.search); add("category", f.category); add("productType", f.productType);
    add("color", f.color); add("size", f.size);
    add("minPrice", f.minPrice); add("maxPrice", f.maxPrice);
    if (f.sort !== "createdAt" || f.order !== "desc") { add("sort", f.sort); add("order", f.order); }
    if (f.page > 1) add("page", f.page);
    router.push(pairs.length ? `?${pairs.join("&")}` : window.location.pathname, { scroll: false });
  };

  const handleFilterChange = (name, value) => {
    const nf = { ...filters, [name]: value };
    setFilters(nf);
    updateURL(nf);
    if (pagination.page !== 1) setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleAttrChange = (attrName, valueId) => {
    const k = attrName.toLowerCase();
    const cur = selectedAttributes[k] || [];
    const updated = cur.includes(valueId) ? cur.filter((id) => id !== valueId) : [valueId];
    setSelectedAttributes((p) => ({ ...p, [k]: updated }));
    if (k === "color") { setSelectedColors(updated); handleFilterChange("color", updated[0] || ""); }
    else if (k === "size") { setSelectedSizes(updated); handleFilterChange("size", updated[0] || ""); }
  };

  const clearFilters = () => {
    const cf = { search: "", category: "", productType: "", color: "", size: "", minPrice: "", maxPrice: "", sort: "createdAt", order: "desc" };
    setFilters(cf); setSelectedColors([]); setSelectedSizes([]); setSelectedAttributes({});
    setPriceRange({ min: 0, max: 1000 });
    updateURL(cf); setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSortChange = (e) => {
    const map = {
      default: ["createdAt", "desc"],
      "price-asc": ["price", "asc"],
      "price-desc": ["price", "desc"],
      name: ["name", "asc"],
      featured: ["featured", "desc"]
    };
    const [sort, order] = map[e.target.value] || ["createdAt", "desc"];
    const nf = { ...filters, sort, order };
    setFilters(nf);
    updateURL(nf);
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: p }));
    const params = new URLSearchParams(searchParams.toString());
    p > 1 ? params.set("page", p) : params.delete("page");
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  const activeCount = [
    filters.search, filters.category, filters.productType,
    selectedColors.length > 0, selectedSizes.length > 0,
    filters.minPrice, filters.maxPrice,
  ].filter(Boolean).length;

  const getColsClass = () => {
    if (viewMode === "list") return "grid-cols-1";
    if (viewCols === 2) return "grid-cols-2";
    if (viewCols === 3) return "grid-cols-2 md:grid-cols-3";
    if (viewCols === 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  };

  const SidebarContent = () => (
    <div className="space-y-0">
      {/* Search in sidebar */}
      <div className="pb-5 border-b border-line">
        <div className="relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-dark" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterChange("search", searchInput)}
            className="w-full h-10 pl-7 pr-4 text-sm bg-transparent border-b border-noir/15 focus:outline-none focus:border-gold-dark transition-colors placeholder:text-stone"
          />
        </div>
      </div>

      <FilterSection
        title="Categories"
        isOpen={!!openSections.categories}
        onToggle={() => setOpenSections((p) => ({ ...p, categories: !p.categories }))}
      >
        <ul className="space-y-0.5">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => handleFilterChange("category", filters.category === cat.slug ? "" : cat.slug)}
                className={`text-xs tracking-wide flex items-center justify-between w-full py-2.5 px-3 transition-all duration-300 ${filters.category === cat.slug
                  ? "bg-noir text-gold-light"
                  : "text-noir/60 hover:text-noir hover:bg-ivory"
                }`}
              >
                <span>{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span className={`text-[10px] ${filters.category === cat.slug ? "text-gold-light/60" : "text-stone"}`}>{cat.productCount}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection
        title="Price Range"
        isOpen={!!openSections.price}
        onToggle={() => setOpenSections((p) => ({ ...p, price: !p.price }))}
      >
        <div className="space-y-5">
          <input
            type="range"
            min="0"
            max="2000"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
            className="w-full accent-[#A958A4] cursor-pointer bg-line h-px"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-dark tracking-wide">₹{priceRange.min} — ₹{priceRange.max}</span>
            <button
              onClick={() => {
                handleFilterChange("minPrice", String(priceRange.min));
                handleFilterChange("maxPrice", String(priceRange.max));
              }}
              className="px-5 py-2 bg-noir text-ivory text-[9px] uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-white transition-colors duration-300"
            >
              Apply
            </button>
          </div>
        </div>
      </FilterSection>

      {colors.length > 0 && (
        <FilterSection
          title="Colours"
          isOpen={!!openSections.color}
          onToggle={() => setOpenSections((p) => ({ ...p, color: !p.color }))}
        >
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const active = selectedColors.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => handleAttrChange("Color", c.id)}
                  className={`w-8 h-8 rounded-full border transition-all duration-300 ${active ? "ring-1 ring-gold ring-offset-2 border-gold scale-110" : "border-line hover:border-stone"}`}
                  style={{ backgroundColor: c.hexCode || "#fff" }}
                  title={c.name}
                  aria-label={c.name}
                />
              );
            })}
          </div>
        </FilterSection>
      )}

      {sizes.length > 0 && (
        <FilterSection
          title="Sizes"
          isOpen={!!openSections.size}
          onToggle={() => setOpenSections((p) => ({ ...p, size: !p.size }))}
        >
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const active = selectedSizes.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => handleAttrChange("Size", s.id)}
                  className={`min-w-[42px] px-3 py-2 text-[11px] tracking-[0.1em] border transition-all duration-300 ${active
                    ? "bg-noir border-noir text-gold-light"
                    : "border-line text-noir/60 hover:border-noir"
                  }`}
                >
                  {s.display || s.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* Editorial Header */}
      <div className="relative bg-hero-brand border-b border-line overflow-hidden">
        <span
          className="pointer-events-none select-none absolute -bottom-8 right-0 font-display italic text-[9rem] leading-none text-hollow-dark hidden lg:block"
          aria-hidden="true"
        >
          Shop
        </span>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-stone mb-4">
                <Link href="/" className="hover:text-gold-dark transition-colors">Home</Link>
                <span className="text-gold">·</span>
                <span className="text-noir">Shop</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-noir tracking-tight">
                {filters.search ? (
                  <>Results for <em className="luxe-italic text-gradient">&ldquo;{filters.search}&rdquo;</em></>
                ) : (
                  <>The <em className="luxe-italic text-gradient">Collection</em></>
                )}
              </h1>
              {pagination.total > 0 && (
                <p className="text-[11px] uppercase tracking-[0.25em] text-stone mt-4">{pagination.total} pieces</p>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2.5 px-6 py-3 border border-noir/25 text-[10px] uppercase tracking-[0.25em] font-semibold text-noir hover:bg-noir hover:text-gold-light transition-all duration-300 self-start"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-gold text-white text-[10px] flex items-center justify-center font-bold">{activeCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-noir">
                <h3 className="text-[10px] uppercase tracking-[0.35em] font-semibold text-noir">Refine</h3>
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="text-[9px] text-gold-dark uppercase tracking-[0.2em] hover:underline">
                    Clear All
                  </button>
                )}
              </div>
              <SidebarContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-7">
              {[
                { label: "Featured", type: "featured" },
                { label: "Best Sellers", type: "bestseller" },
                { label: "Trending", type: "trending" },
                { label: "New Arrivals", type: "new" },
              ].map(({ label, type }) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange("productType", filters.productType === type ? "" : type)}
                  className={`px-5 py-2.5 text-[9px] uppercase tracking-[0.25em] font-semibold border transition-all duration-300 ${filters.productType === type
                    ? "bg-noir border-noir text-gold-light"
                    : "border-line text-noir/60 hover:border-noir hover:text-noir"
                  }`}
                >
                  {label}
                </button>
              ))}
              {activeCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 text-[9px] uppercase tracking-[0.25em] font-semibold border border-brand-error/30 text-brand-error hover:bg-brand-error/5 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-line mb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                {loading ? (
                  <span className="h-4 bg-ivory-deep animate-pulse w-24 inline-block" />
                ) : (
                  <>Showing {products.length} of {pagination.total || 0}</>
                )}
              </span>

              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="hidden md:flex items-center border border-line">
                  {[2, 3, 4].map((c) => (
                    <button
                      key={c}
                      onClick={() => { setViewMode("grid"); setViewCols(c); }}
                      className={`w-8 h-8 flex items-center justify-center text-[10px] font-semibold transition-all ${viewMode === "grid" && viewCols === c
                        ? "bg-noir text-gold-light"
                        : "text-stone hover:text-noir"
                      }`}
                      aria-label={`${c} columns`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <select
                  onChange={handleSortChange}
                  className="text-[11px] uppercase tracking-[0.15em] text-noir bg-transparent border border-line px-3 py-2.5 focus:outline-none focus:border-gold-dark cursor-pointer"
                >
                  <option value="default">Latest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading && products.length === 0 ? (
              <div className={`grid gap-5 ${getColsClass()}`}>
                {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-ivory border border-line">
                <span className="font-display italic text-5xl text-noir/15 block mb-6">Nothing here…</span>
                <h3 className="font-display text-2xl text-noir mb-2">No pieces found</h3>
                <p className="text-sm text-stone-dark mb-8 font-light">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="btn-luxe">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-5 transition-opacity duration-300 ${loading ? "opacity-60 pointer-events-none" : ""} ${getColsClass()}`}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-14">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="w-10 h-10 border border-line flex items-center justify-center text-stone hover:border-noir hover:text-noir transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[...Array(pagination.pages)].map((_, i) => {
                  const p = i + 1;
                  if (pagination.pages > 7 && p > 3 && p < pagination.pages - 1 && Math.abs(p - pagination.page) > 1) {
                    if (p === 4 || p === pagination.pages - 2) return <span key={p} className="text-stone">…</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 text-xs font-medium flex items-center justify-center transition-all ${p === pagination.page
                        ? "bg-noir text-gold-light"
                        : "border border-line text-stone-dark hover:border-noir hover:text-noir"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                  className="w-10 h-10 border border-line flex items-center justify-center text-stone hover:border-noir hover:text-noir transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-noir/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <h3 className="text-[10px] uppercase tracking-[0.35em] font-semibold text-noir">Refine</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-stone hover:text-noir" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4" data-lenis-prevent>
              <SidebarContent />
            </div>
            <div className="p-5 border-t border-line">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full h-12 bg-noir text-ivory text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-gold hover:text-white transition-colors duration-300"
              >
                Show {pagination.total || 0} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <ClientOnly fallback={<div className="p-8 text-center animate-pulse text-stone text-xs uppercase tracking-[0.3em]">Loading shop…</div>}>
        <Suspense fallback={<div className="p-8 text-center animate-pulse text-stone text-xs uppercase tracking-[0.3em]">Loading shop…</div>}>
          <ProductsContent />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
