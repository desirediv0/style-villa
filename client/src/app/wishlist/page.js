"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { fetchApi } from "@/lib/utils";
import { Trash2, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";

export default function WishlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/auth?redirect=/wishlist");
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingItems(true);
    fetchApi("/users/wishlist", { credentials: "include" })
      .then((res) => setWishlistItems(res.data?.wishlistItems || []))
      .catch(() => setError("Failed to load wishlist. Please try again."))
      .finally(() => setLoadingItems(false));
  }, [isAuthenticated]);

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      await fetchApi(`/users/wishlist/${wishlistItemId}`, { method: "DELETE", credentials: "include" });
      setWishlistItems((cur) => cur.filter((item) => item.id !== wishlistItemId));
      setError("");
    } catch {
      setError("Failed to remove item. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-white pb-24">

        {/* Hero Section */}
        <section className="relative py-14 md:py-16 overflow-hidden bg-gray-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[120px] opacity-25" style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }} />
          </div>
          <div className="max-w-7xl mx-auto px-5 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-[0.25em] text-white/50 uppercase block mb-1">CURATED SELECTIONS</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">My Wishlist</h1>
            </div>
            {!loadingItems && wishlistItems.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border" style={{ background: "#A958A412", color: "#A958A4", borderColor: "#A958A430" }}>
                <Heart className="w-3 h-3" />
                {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
              </span>
            )}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-5 py-10">

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Loading skeletons */}
          {loadingItems ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse overflow-hidden shadow-sm">
                  <div className="aspect-[4/5] bg-gray-100" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                    <div className="h-4 bg-gray-100 rounded-full w-full" />
                    <div className="h-3.5 bg-gray-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (

            /* Empty state */
            <div className="bg-white rounded-2xl p-12 md:p-16 text-center max-w-lg mx-auto border border-gray-100 shadow-sm mt-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #A958A412, #00AEEF12)" }}>
                <Heart className="h-8 w-8" style={{ color: "#A958A4" }} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Wishlist is Empty</h2>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                Save your favorite styles for later. Tap the heart icon on any product to save them here.
              </p>
              <Link href="/products">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}>
                  <ShoppingBag className="h-4 w-4" />
                  Browse Collection
                </button>
              </Link>
            </div>

          ) : (

            /* Wishlist grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {wishlistItems.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />

                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                    className="absolute top-3 right-14 z-30 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 shadow-md border border-gray-100 transition-all duration-300 active:scale-95"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

          )}
        </div>
      </div>
    </ClientOnly>
  );
}
