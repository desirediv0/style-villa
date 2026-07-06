"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    AlertCircle,
    Loader2,
    Check
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
    if (!image) return "/placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

// Cart item component to optimize re-renders
const CartItem = React.memo(
    ({ item, onUpdateQuantity, onRemove, isLoading }) => {
        const getProductImage = () => {
            if (
                item.variant?.images &&
                Array.isArray(item.variant.images) &&
                item.variant.images.length > 0
            ) {
                const primaryImage = item.variant.images.find((img) => img.isPrimary);
                const imageUrl = primaryImage?.url || item.variant.images[0]?.url;
                if (imageUrl) return getImageUrl(imageUrl);
            }
            if (item.product?.image) {
                return getImageUrl(item.product.image);
            }
            if (item.image) {
                return getImageUrl(item.image);
            }
            return "/placeholder.jpg";
        };

        const getVariantName = () => {
            if (item.variantName && item.variantName.trim() !== "") {
                return item.variantName;
            }
            if (item.variant?.attributes && item.variant.attributes.length > 0) {
                const attrStrings = item.variant.attributes.map(
                    (attr) => `${attr.attribute}: ${attr.value}`
                );
                return attrStrings.join(", ");
            }
            let color = item.variant?.color?.name;
            let size = item.variant?.size?.name;
            if (!color) color = item.color?.name;
            if (!size) size = item.size?.name;

            if (color && size) {
                return `${color} • ${size}`;
            } else if (color) {
                return color;
            } else if (size) {
                return size;
            }
            return null;
        };

        const variantName = getVariantName();
        const productImage = getProductImage();
        const productName = item.productName || item.product?.name || "Product";
        const productSlug = item.productSlug || item.product?.slug || "#";

        return (
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-50/40 transition-all duration-300 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="relative h-28 w-24 md:h-32 md:w-28 bg-neutral-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm group">
                        <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="120px"
                        />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <span className="text-[9px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">stylevilla Collection</span>
                        <Link
                            href={`/products/${productSlug}`}
                            className="block font-display text-lg md:text-xl text-neutral-900 hover:text-neutral-600 transition-colors leading-snug truncate"
                        >
                            {productName}
                        </Link>
                        {variantName && (
                            <div className="text-xs text-neutral-500 font-medium flex items-center gap-2">
                                {/* Color Swatch */}
                                {(item.variant?.color?.hexCode || item.color?.hexCode) && (
                                    <div
                                        className="w-3.5 h-3.5 rounded-full border border-neutral-300 flex-shrink-0 shadow-sm"
                                        style={{
                                            backgroundColor: item.variant?.color?.hexCode || item.color?.hexCode,
                                        }}
                                    />
                                )}
                                <span>{variantName}</span>
                            </div>
                        )}
                        {item.moq && item.moq > 1 && (
                            <div className="inline-flex text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                                MOQ: {item.moq} Units
                            </div>
                        )}
                    </div>
                </div>

                {/* Right actions block (stepper, pricing, subtotal) */}
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-6 md:gap-10">
                    {/* Unit Price */}
                    <div className="flex flex-col text-left md:text-center min-w-[80px]">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">Price</span>
                        {!isLoading && !item.isAuthenticated && item.hidePricesForGuests ? (
                            <span className="text-xs font-semibold text-neutral-500">Login to view</span>
                        ) : (
                            <div className="flex flex-col">
                                {item.originalPrice && item.originalPrice !== item.price && (
                                    <span className="text-xs text-neutral-400 line-through">
                                        {formatCurrency(item.originalPrice)}
                                    </span>
                                )}
                                <span className="text-sm font-semibold text-neutral-900">
                                    {formatCurrency(item.price)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stepper */}
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1 self-start md:self-center">Quantity</span>
                        <div className="flex items-center border border-gray-100 rounded-xl overflow-hidden h-9 bg-white shadow-sm">
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity, -1)}
                                className="px-2.5 h-full hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                                disabled={isLoading || item.quantity <= (item.moq || 1)}
                            >
                                <Minus className="h-3 w-3 text-neutral-600" />
                            </button>
                            <span className="w-10 text-center text-xs font-semibold text-neutral-900">
                                {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin inline" />
                                ) : (
                                    item.quantity
                                )}
                            </span>
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity, 1)}
                                className="px-2.5 h-full hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                                disabled={isLoading}
                            >
                                <Plus className="h-3 w-3 text-neutral-600" />
                            </button>
                        </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex flex-col text-right min-w-[90px]">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">Subtotal</span>
                        <span className="text-base font-semibold text-neutral-900">
                            {!isLoading && !item.isAuthenticated && item.hidePricesForGuests ? "-" : formatCurrency(item.subtotal)}
                        </span>
                    </div>

                    {/* Remove Action */}
                    <button
                        onClick={() => onRemove(item.id)}
                        className="text-neutral-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
                        aria-label="Remove item"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        ) : (
                            <Trash2 className="h-4.5 w-4.5" />
                        )}
                    </button>
                </div>
            </div>
        );
    }
);
CartItem.displayName = "CartItem";

export default function CartPage() {
    const {
        cart,
        loading,
        cartItemsLoading,
        error,
        removeFromCart,
        updateCartItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        coupon,
        couponLoading,
        getCartTotals,
        isAuthenticated,
        mergeProgress,
        hidePricesForGuests,
    } = useCart();
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const router = useRouter();

    const handleQuantityChange = useCallback(
        async (cartItemId, currentQuantity, change) => {
            const newQuantity = currentQuantity + change;
            const cartItem = cart.items.find(item => item.id === cartItemId);
            const effectiveMOQ = cartItem?.moq || 1;

            if (newQuantity < effectiveMOQ) {
                toast.error(`Minimum order quantity is ${effectiveMOQ} units`);
                return;
            }
            if (newQuantity < 1) return;

            try {
                await updateCartItem(cartItemId, newQuantity);
            } catch (err) {
                console.error("Error updating quantity:", err);
                toast.error(err.message || "Failed to update quantity");
            }
        },
        [updateCartItem, cart.items]
    );

    const handleRemoveItem = useCallback(
        async (cartItemId) => {
            try {
                await removeFromCart(cartItemId);
            } catch (err) {
                console.error("Error removing item:", err);
                toast.error("Failed to remove item");
            }
        },
        [removeFromCart]
    );

    const handleClearCart = useCallback(async () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            try {
                await clearCart();
                toast.success("Cart has been cleared");
            } catch (err) {
                console.error("Error clearing cart:", err);
                toast.error("Failed to clear cart");
            }
        }
    }, [clearCart]);

    const handleApplyCoupon = useCallback(
        async (e) => {
            e.preventDefault();
            if (!couponCode.trim()) {
                setCouponError("Please enter a coupon code");
                return;
            }
            setCouponError("");
            try {
                await applyCoupon(couponCode);
                setCouponCode("");
            } catch (err) {
                setCouponError(err.message || "Invalid coupon code");
                toast.error(err.message || "Invalid coupon code");
            }
        },
        [couponCode, applyCoupon]
    );

    const handleRemoveCoupon = useCallback(() => {
        removeCoupon();
        setCouponCode("");
        setCouponError("");
        toast.success("Coupon removed");
    }, [removeCoupon]);

    const totals = useMemo(() => getCartTotals(), [cart, coupon, getCartTotals]);

    const handleCheckout = useCallback(() => {
        if (!isAuthenticated && hidePricesForGuests) {
            router.push("/auth?redirect=checkout");
            return;
        }
        const calculatedAmount = totals.subtotal - totals.discount;
        if (calculatedAmount < 1) {
            toast.info("Minimum order amount is ₹1");
            return;
        }
        if (!isAuthenticated) {
            router.push("/auth?redirect=checkout");
        } else {
            router.push("/checkout");
        }
    }, [isAuthenticated, router, totals, hidePricesForGuests]);

    if (loading && (!cart.items || cart.items.length === 0)) {
        return (
            <div className="min-h-screen bg-white py-24 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-xs tracking-widest uppercase font-semibold text-neutral-400">Loading Cart…</p>
            </div>
        );
    }

    if ((!cart.items || cart.items.length === 0) && !error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-white">
                <div className="bg-white p-10 md:p-14 rounded-2xl text-center max-w-xl mx-auto border border-gray-100 shadow-sm">
                    <div className="inline-flex justify-center items-center p-6 rounded-2xl mb-8 bg-gradient-to-br from-[#A458A6]/10 to-[#14A8E6]/10">
                        <ShoppingBag className="h-10 w-10 stroke-[1.25] text-[#A458A6]" />
                    </div>
                    <h2 className="font-display text-4xl font-medium mb-4 text-neutral-900">
                        Your Bag is Empty
                    </h2>
                    <span className="block w-12 h-[1px] bg-[#A458A6] mx-auto mb-5" />
                    <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm font-light leading-relaxed tracking-wide">
                        Explore our gallery of handcrafted, premium luxury jewellery collections to find your perfect style.
                    </p>
                    <Link href="/products">
                        <button className="bg-[#A458A6] text-white text-xs font-semibold uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-[#1A1A1A] transition-all">
                            Browse the Collection
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="mb-10">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-[#A458A6] uppercase block mb-2">Your Shopping Bag</span>
                    <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-wide text-neutral-900">
                        Shopping Cart
                    </h1>
                </div>

                {/* Guest cart notice */}
                {!isAuthenticated && cart.items.length > 0 && (
                    <div className="bg-white border p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-gray-100">
                        <div className="flex-1">
                            <h2 className="text-base font-semibold text-neutral-900 mb-1 uppercase tracking-wide">
                                Guest Shopping Cart
                            </h2>
                            <p className="text-xs text-neutral-500 leading-relaxed font-light">
                                Log in to save your selections, access express checkout, and enjoy personalized offers.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/auth?redirect=cart">
                                <button className="bg-[#A458A6] text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-[#1A1A1A] transition-all">
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/auth?redirect=cart">
                                <button className="border border-[#A458A6] text-[#A458A6] text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-[#A458A6] hover:text-white transition-all">
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Show merge progress */}
                {mergeProgress && (
                    <div className="bg-neutral-950 text-white p-4 rounded-xl flex items-center gap-3 mb-8 shadow-md">
                        <Loader2 className="h-4.5 w-4.5 animate-spin flex-shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{mergeProgress}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl border overflow-hidden border-gray-100 shadow-sm">
                            <div className="divide-y divide-gray-100">
                                {cart.items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={{ ...item, isAuthenticated, hidePricesForGuests }}
                                        onUpdateQuantity={handleQuantityChange}
                                        onRemove={handleRemoveItem}
                                        isLoading={cartItemsLoading[item.id]}
                                    />
                                ))}
                            </div>

                            {/* Cart Actions */}
                            <div className="p-6 bg-neutral-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <Link href="/products">
                                    <button className="text-xs font-semibold uppercase tracking-widest text-neutral-800 hover:text-black transition-colors flex items-center gap-1.5">
                                        ← Keep Shopping
                                    </button>
                                </Link>
                                <button
                                    onClick={handleClearCart}
                                    className="text-xs font-semibold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                                    disabled={loading}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl border p-6 flex flex-col gap-6 sticky top-24 border-gray-100 shadow-sm">
                            <h2 className="font-display text-2xl font-medium text-neutral-900 border-b pb-3 border-gray-100">
                                Order Summary
                            </h2>

                            {/* Apply Coupon */}
                            {(!hidePricesForGuests || isAuthenticated) && (
                                <div className="p-4 bg-neutral-50 rounded-xl border border-gray-100">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-3 flex items-center gap-2">
                                        Have a coupon?
                                    </h3>
                                    {coupon ? (
                                        <div className="flex justify-between items-start bg-green-50 p-3 rounded-xl border border-green-200">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-green-700 text-xs tracking-wider uppercase">
                                                        {coupon.code}
                                                    </span>
                                                    <span className="text-[9px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-semibold uppercase">
                                                        Applied
                                                    </span>
                                                </div>
                                                <p className="text-xs font-semibold text-green-600">
                                                    {coupon.discountType === "PERCENTAGE"
                                                        ? `${coupon.discountValue}% off`
                                                        : `₹${coupon.discountValue} off`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="text-[10px] font-semibold uppercase tracking-wider text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                                                disabled={couponLoading}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="COUPON CODE"
                                                    value={couponCode}
                                                    onChange={(e) =>
                                                        setCouponCode(e.target.value.toUpperCase())
                                                    }
                                                    className="flex-1 border border-gray-100 text-xs font-semibold tracking-widest px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:border-[#A458A6]"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={couponLoading}
                                                    className="text-white text-xs font-semibold uppercase tracking-widest px-4 py-2.5 rounded-xl bg-[#A458A6] hover:bg-[#1A1A1A] transition-all"
                                                >
                                                    Apply
                                                </button>
                                            </form>
                                            {couponError && (
                                                <div className="mt-2 flex items-start gap-1.5 text-red-600 text-xs font-medium">
                                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <p>{couponError}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="space-y-4 text-xs font-medium text-neutral-500">
                                <div className="flex justify-between items-center">
                                    <span className="uppercase tracking-wider">Subtotal</span>
                                    <span className="font-semibold text-neutral-900">
                                        {!isAuthenticated && hidePricesForGuests ? (
                                            <Link href="/auth?redirect=cart" className="underline hover:text-black"> Login to view</Link>
                                        ) : (formatCurrency(totals.subtotal))}
                                    </span>
                                </div>

                                {coupon && (
                                    <div className="flex justify-between items-center bg-green-50/50 p-2.5 rounded-xl">
                                        <span className="text-green-700 uppercase tracking-wider">Discount</span>
                                        <span className="text-green-700 font-semibold">
                                            -{formatCurrency(totals.discount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="uppercase tracking-wider">Shipping</span>
                                    {totals.shipping > 0 ? (
                                        <span className="text-neutral-900 font-semibold">
                                            {formatCurrency(totals.shipping)}
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-semibold tracking-widest flex items-center gap-1">
                                            FREE
                                        </span>
                                    )}
                                </div>

                                {/* Free Shipping Progress Alert */}
                                {totals.shipping > 0 && cart.freeShippingThreshold > 0 && (
                                    <div className="text-[11px] text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-gray-100/50 text-center font-normal">
                                        Add <strong>{formatCurrency(cart.freeShippingThreshold - totals.subtotal)}</strong> more for <span className="text-[#14A8E6] font-semibold uppercase">FREE shipping!</span>
                                    </div>
                                )}
                            </div>

                            {/* Grand Total */}
                            <div className="flex justify-between items-center font-semibold text-base border-t border-gray-100 pt-4">
                                <span className="uppercase tracking-widest text-neutral-900">Total</span>
                                <span className="text-neutral-900 text-lg font-semibold">
                                    {!isAuthenticated && hidePricesForGuests ? (
                                        <Link href="/auth?redirect=cart" className="underline hover:text-black"> Login to view</Link>
                                    ) : (
                                        formatCurrency(totals.total)
                                    )}
                                </span>
                            </div>

                            {/* Checkout Actions */}
                            <button
                                className="w-full text-white text-[11px] font-semibold uppercase tracking-[0.25em] py-4.5 rounded-xl transition-all bg-gradient-to-r from-[#A458A6] to-[#14A8E6] hover:shadow-lg hover:shadow-[#A458A6]/20 hover:-translate-y-0.5 active:scale-[0.99] h-12"
                                onClick={handleCheckout}
                            >
                                {!isAuthenticated && hidePricesForGuests ? (
                                    "Login to Checkout"
                                ) : (
                                    <span className="flex items-center justify-center gap-1">
                                        Proceed to Checkout • <strong className="ml-1 text-white">{formatCurrency(totals.total)}</strong>
                                    </span>
                                )}
                            </button>

                            <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
                                Shipping, taxes, and discounts calculated during checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
