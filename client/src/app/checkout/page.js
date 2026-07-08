"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { fetchApi, formatCurrency, loadScript } from "@/lib/utils";
import { playSuccessSound, fireConfetti } from "@/lib/sound-utils";
import { Button } from "@/components/ui/button";
import {
    CreditCard,
    AlertCircle,
    Loader2,
    CheckCircle,
    MapPin,
    Plus,
    ShoppingBag,
    PartyPopper,
    Gift,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AddressForm from "@/components/AddressForm";
import Image from "next/image";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
    if (!image) return "/placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function CheckoutPage() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const { cart, coupon, getCartTotals, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [paymentSettings, setPaymentSettings] = useState({
        cashEnabled: false,
        razorpayEnabled: true,
        codCharge: 0,
    });
    const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
    const [processing, setProcessing] = useState(false);
    const [orderCreated, setOrderCreated] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [razorpayKey, setRazorpayKey] = useState("");
    const [error, setError] = useState("");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [successAnimation, setSuccessAnimation] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(2);
    const [confettiCannon, setConfettiCannon] = useState(false);

    const totals = getCartTotals();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth?redirect=checkout");
        }
    }, [isAuthenticated, router]);

    // Redirect if cart is empty (but not if order is already created)
    useEffect(() => {
        if (isAuthenticated && cart.items?.length === 0 && !orderCreated) {
            router.push("/cart");
        }
    }, [isAuthenticated, cart, router, orderCreated]);

    // Fetch payment settings
    useEffect(() => {
        const fetchPaymentSettings = async () => {
            try {
                const response = await fetchApi("/payment/settings", {
                    credentials: "include",
                });
                if (response.success) {
                    setPaymentSettings({
                        cashEnabled: false,
                        razorpayEnabled: response.data.razorpayEnabled ?? true,
                        codCharge: response.data.codCharge ?? 0,
                    });
                    if (response.data.razorpayEnabled ?? true) {
                        setPaymentMethod("RAZORPAY");
                    }
                }
            } catch (error) {
                console.error("Error fetching payment settings:", error);
                setPaymentMethod("RAZORPAY");
            }
        };
        fetchPaymentSettings();
    }, []);

    // Fetch addresses
    const fetchAddresses = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoadingAddresses(true);
        try {
            const response = await fetchApi("/users/addresses", {
                credentials: "include",
            });

            if (response.success) {
                setAddresses(response.data.addresses || []);

                if (response.data.addresses?.length > 0) {
                    const defaultAddress = response.data.addresses.find(
                        (addr) => addr.isDefault
                    );
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress.id);
                    } else {
                        setSelectedAddressId(response.data.addresses[0].id);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Failed to load your addresses");
        } finally {
            setLoadingAddresses(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // Fetch Razorpay key
    useEffect(() => {
        const fetchRazorpayKey = async () => {
            try {
                const response = await fetchApi("/payment/razorpay-key", {
                    credentials: "include",
                });
                if (response.success) {
                    setRazorpayKey(response.data.key);
                }
            } catch (error) {
                console.error("Error fetching Razorpay key:", error);
            }
        };

        if (isAuthenticated) {
            fetchRazorpayKey();
        }
    }, [isAuthenticated]);

    const handleAddressSelect = (id) => {
        setSelectedAddressId(id);
    };

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
    };

    const handleAddressFormSuccess = () => {
        setShowAddressForm(false);
        fetchAddresses();
    };

    // Countdown for redirect
    useEffect(() => {
        if (orderCreated && redirectCountdown > 0) {
            const timer = setTimeout(() => {
                setRedirectCountdown(redirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (orderCreated && redirectCountdown === 0) {
            router.push(`/account/orders`);
        }
    }, [orderCreated, redirectCountdown, router]);

    // Confetti effect on order success
    useEffect(() => {
        if (successAnimation) {
            fireConfetti.celebration();
            const timer = setTimeout(() => {
                setConfettiCannon(true);
                fireConfetti.sides();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [successAnimation]);

    const handleSuccessfulPayment = (
        paymentResponse = null,
        orderData = null
    ) => {
        if (paymentResponse?.razorpay_payment_id) {
            setPaymentId(paymentResponse.razorpay_payment_id);
        }
        if (orderData?.orderNumber) {
            setOrderNumber(orderData.orderNumber);
        }
        setSuccessAnimation(true);
        playSuccessSound();
        clearCart();

        const orderNum = orderData?.orderNumber || orderNumber || "";
        toast.success("Order confirmed successfully!", {
            duration: 4000,
            icon: <PartyPopper className="h-5 w-5 text-green-500" />,
            description: orderNum
                ? `Order #${orderNum} has been confirmed. Redirecting to your orders…`
                : "Redirecting to your orders…",
        });

        setTimeout(() => {
            setOrderCreated(true);
        }, 100);
    };

    // Process checkout
    const handleCheckout = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a shipping address");
            return;
        }

        setProcessing(true);
        setError("");

        try {
            const calculatedAmount = totals.total;
            const amount = Math.max(parseFloat(calculatedAmount.toFixed(2)), 1);

            if (calculatedAmount < 1) {
                toast.info("Minimum order amount is ₹1. Your total has been adjusted.");
            }

            if (paymentMethod === "CASH") {
                toast.loading("Creating your order...", {
                    id: "order-creation",
                    duration: 10000,
                });

                const orderResponse = await fetchApi("/payment/cash-order", {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        shippingAddressId: selectedAddressId,
                        billingAddressSameAsShipping: true,
                        couponCode: coupon?.code || null,
                        couponId: coupon?.id || null,
                        discountAmount: totals.discount || 0,
                    }),
                });

                toast.dismiss("order-creation");

                if (!orderResponse.success) {
                    throw new Error(orderResponse.message || "Failed to create order");
                }

                const orderData = {
                    orderNumber: orderResponse.data.orderNumber,
                    orderId: orderResponse.data.orderId,
                    paymentMethod: orderResponse.data.paymentMethod || "CASH",
                };
                setOrderNumber(orderResponse.data.orderNumber);
                setOrderId(orderResponse.data.orderId || "");
                handleSuccessfulPayment(null, orderData);
                return;
            } else if (paymentMethod === "RAZORPAY") {
                if (!razorpayKey) {
                    try {
                        const keyResponse = await fetchApi("/payment/razorpay-key", {
                            method: "GET",
                            credentials: "include",
                        });
                        if (keyResponse.success && keyResponse.data?.key) {
                            setRazorpayKey(keyResponse.data.key);
                        } else {
                            throw new Error("Payment gateway key missing.");
                        }
                    } catch {
                        throw new Error("Failed to initialize payment gateway.");
                    }
                }

                toast.loading("Creating your order...", {
                    id: "order-creation",
                    duration: 10000,
                });

                const orderResponse = await fetchApi("/payment/checkout", {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        amount,
                        currency: "INR",
                        paymentGateway: "RAZORPAY",
                        couponCode: coupon?.code || null,
                        couponId: coupon?.id || null,
                        discountAmount: totals.discount || 0,
                    }),
                });

                toast.dismiss("order-creation");

                if (!orderResponse.success) {
                    throw new Error(orderResponse.message || "Failed to create order");
                }

                toast.success("Order created! Redirecting to secure gateway...", {
                    duration: 2000,
                });

                const razorpayOrder = orderResponse.data;
                setOrderId(razorpayOrder.id);

                toast.loading("Loading payment gateway...", {
                    id: "payment-gateway",
                    duration: 5000,
                });

                const loaded = await loadScript(
                    "https://checkout.razorpay.com/v1/checkout.js"
                );

                toast.dismiss("payment-gateway");

                if (!loaded) {
                    throw new Error("Payment gateway failed to load.");
                }

                let currentKey = razorpayKey;
                if (!currentKey) {
                    try {
                        const keyResponse = await fetchApi("/payment/razorpay-key", {
                            method: "GET",
                            credentials: "include",
                        });
                        if (keyResponse.success && keyResponse.data?.key) {
                            currentKey = keyResponse.data.key;
                            setRazorpayKey(currentKey);
                        }
                    } catch (err) {
                        console.error("Failed to fetch Razorpay key:", err);
                    }
                }

                if (!currentKey) {
                    throw new Error("Razorpay gateway keys are misconfigured.");
                }

                const options = {
                    key: currentKey,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: "Style Villa",
                    description: "Style Villa - Premium Fashion",
                    order_id: razorpayOrder.id,
                    prefill: {
                        name: user?.name || "",
                        email: user?.email || "",
                        contact: user?.phone || "",
                    },
                    handler: async function (response) {
                        setProcessing(true);
                        toast.loading("Verifying your payment...", {
                            id: "payment-verification",
                            duration: 10000,
                        });

                        try {
                            const verificationResponse = await fetchApi("/payment/verify", {
                                method: "POST",
                                credentials: "include",
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature,
                                    shippingAddressId: selectedAddressId,
                                    billingAddressSameAsShipping: true,
                                    couponCode: coupon?.code || null,
                                    couponId: coupon?.id || null,
                                    discountAmount: totals.discount || 0,
                                    notes: "",
                                }),
                            });

                            toast.dismiss("payment-verification");

                            if (verificationResponse.success) {
                                toast.success("Payment verified successfully! 🎉", {
                                    duration: 3000,
                                });
                                setOrderId(verificationResponse.data.orderId);
                                handleSuccessfulPayment(response, verificationResponse.data);
                            } else {
                                throw new Error(
                                    verificationResponse.message || "Payment verification failed"
                                );
                            }
                        } catch (error) {
                            console.error("Payment verification error:", error);
                            toast.dismiss("payment-verification");
                            setError(error.message || "Payment verification failed");
                            toast.error(error.message || "Verification failed. Please contact support.");
                            setProcessing(false);
                        }
                    },
                    theme: {
                        color: "#A958A4",
                    },
                    modal: {
                        ondismiss: function () {
                            setProcessing(false);
                        },
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.dismiss("order-creation");
            toast.dismiss("payment-gateway");
            toast.dismiss("payment-verification");
            setError(error.message || "Checkout failed");
            toast.error(error.message || "Checkout failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (!isAuthenticated || loadingAddresses) {
        return (
            <div className="min-h-screen bg-white py-24 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-neutral-300 border-t-[#A958A4] rounded-full animate-spin" />
                <p className="text-xs tracking-widest uppercase font-semibold text-neutral-400">Loading Checkout…</p>
            </div>
        );
    }

    // Success Screen
    if (orderCreated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40 flex items-center justify-center py-20 px-4">
                <div className="max-w-xl w-full bg-white p-8 md:p-12 rounded-3xl border border-purple-100/50 shadow-xl shadow-purple-100/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-50/30 via-white to-white opacity-60 z-0" />

                    <div className="relative z-10 space-y-6">
                        <div className="relative flex justify-center">
                            <div className="h-28 w-28 bg-gradient-to-br from-[#A958A4]/10 to-[#00AEEF]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <PartyPopper className="h-14 w-14 text-[#A958A4]" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl font-semibold tracking-wide text-neutral-900 mb-2">Order Confirmed</h1>
                            {orderNumber && (
                                <div className="bg-gradient-to-r from-[#A958A4]/10 to-[#00AEEF]/10 border border-purple-200/50 py-1.5 px-4 rounded-full inline-block mb-3">
                                    <p className="text-xs uppercase tracking-widest text-[#A958A4]">
                                        Order #{orderNumber}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 rounded-xl border border-green-100 text-xs font-semibold text-green-700 w-max mx-auto">
                            <CheckCircle className="h-4.5 w-4.5" />
                            <span>PAYMENT RECEIVED SUCCESSFULLY</span>
                        </div>

                        <p className="text-neutral-500 text-xs leading-relaxed max-w-sm mx-auto">
                            Thank you for choosing Style Villa. Your order has been registered, and a confirmation email is on its way.
                        </p>

                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-600 max-w-sm mx-auto">
                            <div className="flex items-center justify-center gap-2 mb-2 font-semibold">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#A958A4]" />
                                <span>Redirecting in {redirectCountdown} seconds…</span>
                            </div>
                            <Link href="/account/orders" className="underline hover:text-[#A958A4]">
                                Go to orders page now
                            </Link>
                        </div>

                        <div className="flex justify-center gap-3 pt-4 border-t border-neutral-100">
                            <Link href="/account/orders">
                                <button className="bg-gradient-to-r from-[#A958A4] to-[#00AEEF] hover:from-[#8C4188] hover:to-[#0887B8] text-white text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg">
                                    My Orders
                                </button>
                            </Link>
                            <Link href="/products">
                                <button className="border border-neutral-300 hover:border-[#A958A4] text-neutral-800 text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all bg-white hover:bg-purple-50/50">
                                    Continue Shopping
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50/20 via-white to-blue-50/20 pb-24">
            {/* Loading Overlay */}
            {processing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl space-y-4 border border-purple-100/30">
                        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#A958A4]/10 to-[#00AEEF]/10 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-[#A958A4] animate-spin" />
                        </div>
                        <h3 className="text-lg uppercase tracking-wider text-neutral-900 font-semibold">
                            Processing Payment
                        </h3>
                        <p className="text-neutral-500 text-xs leading-relaxed">
                            Do not close or refresh this window. We are securely validating transaction details.
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="mb-8">
                    <span className="luxe-eyebrow block mb-3">Secure Checkout</span>
                    <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-noir">
                        Almost <em className="luxe-italic text-gradient">yours</em>
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-xs text-red-700">
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="uppercase tracking-wider font-semibold">Payment Action Blocked</p>
                            <p className="mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    {/* Left: Shipping & Payment Info (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Address Section */}
                        <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                                <h2 className="text-lg uppercase tracking-wider text-neutral-900 flex items-center gap-2 font-semibold">
                                    <MapPin className="h-5 w-5 text-[#A958A4]" />
                                    Shipping Address
                                </h2>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-xs uppercase tracking-widest text-[#A958A4] hover:text-[#8C4188] transition-colors flex items-center gap-1 font-medium"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add New Address
                                </button>
                            </div>

                            {showAddressForm && (
                                <div className="mb-6 p-6 border border-neutral-100 rounded-2xl bg-neutral-50">
                                    <AddressForm
                                        onSuccess={handleAddressFormSuccess}
                                        onCancel={() => setShowAddressForm(false)}
                                        isInline={true}
                                    />
                                </div>
                            )}

                            {addresses.length === 0 && !showAddressForm ? (
                                <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 text-center text-xs text-neutral-500 leading-relaxed">
                                    No saved addresses found. Please add a shipping address to proceed.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((address) => {
                                        const selected = selectedAddressId === address.id;
                                        return (
                                            <div
                                                key={address.id}
                                                onClick={() => handleAddressSelect(address.id)}
                                                className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative ${selected
                                                    ? "border-[#A958A4] bg-[#A958A4]/5 shadow-sm shadow-purple-100/50"
                                                    : "border-neutral-200 hover:border-neutral-400 bg-white"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs text-neutral-800 uppercase tracking-wide font-medium">{address.name}</span>
                                                    {address.isDefault && (
                                                        <span className="text-[9px] uppercase tracking-widest bg-gradient-to-r from-[#A958A4] to-[#00AEEF] text-white px-2 py-0.5 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-neutral-500 leading-relaxed mb-4">
                                                    <p>{address.street}</p>
                                                    <p>{address.city}, {address.state} {address.postalCode}</p>
                                                    <p>{address.country}</p>
                                                    <p className="mt-2 text-neutral-800 font-medium">Phone: {address.phone || "N/A"}</p>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100/50">
                                                    <input
                                                        type="radio"
                                                        name="addressSelection"
                                                        checked={selected}
                                                        onChange={() => handleAddressSelect(address.id)}
                                                        className="h-4 w-4 text-[#A958A4] border-neutral-300 focus:ring-[#A958A4] cursor-pointer"
                                                    />
                                                    <span className="text-xs font-semibold text-neutral-700">Ship to this address</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Payment Method Selector */}
                        <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 shadow-sm">
                            <h2 className="text-lg uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 mb-6 font-semibold">
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {paymentSettings.razorpayEnabled && (
                                    <div
                                        onClick={() => handlePaymentMethodSelect("RAZORPAY")}
                                        className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 flex items-start gap-4 ${paymentMethod === "RAZORPAY"
                                            ? "border-[#A958A4] bg-[#A958A4]/5 shadow-sm shadow-purple-100/50"
                                            : "border-neutral-200 hover:border-neutral-400 bg-white"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === "RAZORPAY"}
                                            onChange={() => handlePaymentMethodSelect("RAZORPAY")}
                                            className="h-4 w-4 text-[#A958A4] border-neutral-300 focus:ring-[#A958A4] cursor-pointer mt-1"
                                        />
                                        <div className="space-y-1">
                                            <h3 className="text-xs uppercase tracking-wider text-neutral-800 font-semibold">
                                                Credit / Debit Card / UPI
                                            </h3>
                                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                                Pay securely using Net Banking, UPI, Wallets, or Debit/Credit Cards.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {paymentSettings.cashEnabled && (
                                    <div
                                        onClick={() => handlePaymentMethodSelect("CASH")}
                                        className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 flex items-start gap-4 ${paymentMethod === "CASH"
                                            ? "border-[#A958A4] bg-[#A958A4]/5 shadow-sm shadow-purple-100/50"
                                            : "border-neutral-200 hover:border-neutral-400 bg-white"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === "CASH"}
                                            onChange={() => handlePaymentMethodSelect("CASH")}
                                            className="h-4 w-4 text-[#A958A4] border-neutral-300 focus:ring-[#A958A4] cursor-pointer mt-1"
                                        />
                                        <div className="space-y-1">
                                            <h3 className="text-xs uppercase tracking-wider text-neutral-800 font-semibold">
                                                Cash On Delivery (COD)
                                            </h3>
                                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                                Pay upon delivery. Additional COD handling charges may apply.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right: Order Summary (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm flex flex-col gap-6 sticky top-24">
                            <h2 className="text-lg uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 font-semibold">
                                Order Summary
                            </h2>

                            {/* Cart items list summary */}
                            <div className="max-h-56 overflow-y-auto space-y-4 pr-1 no-scrollbar">
                                {cart.items?.map((item) => {
                                    const img = item.variant?.images?.[0]?.url || item.product?.image || item.image;
                                    return (
                                        <div key={item.id} className="flex items-center gap-3 py-1 border-b border-neutral-50 last:border-0 pb-2">
                                            <div className="relative w-10 h-12 bg-neutral-50 border rounded-lg overflow-hidden flex-shrink-0">
                                                <Image src={getImageUrl(img)} alt="" fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[11px] text-neutral-800 uppercase tracking-wide truncate font-medium">{item.productName || item.product?.name}</h4>
                                                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-[11px] text-neutral-900 font-medium">
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Coupon alert */}
                            {coupon && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-[10px] uppercase tracking-wider text-green-700 flex justify-between font-semibold">
                                    <span>Coupon Applied ({coupon.code})</span>
                                    <span>-{formatCurrency(totals.discount)}</span>
                                </div>
                            )}

                            {/* Pricing breakdown */}
                            <div className="space-y-3.5 text-xs font-medium text-neutral-500 border-t border-neutral-100 pt-4">
                                <div className="flex justify-between">
                                    <span className="uppercase tracking-wider">Subtotal</span>
                                    <span className="text-neutral-900 font-semibold">{formatCurrency(totals.subtotal)}</span>
                                </div>
                                {totals.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="uppercase tracking-wider">Coupon Discount</span>
                                        <span className="font-semibold">-{formatCurrency(totals.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="uppercase tracking-wider">Shipping</span>
                                    {totals.shipping > 0 ? (
                                        <span className="text-neutral-900 font-semibold">{formatCurrency(totals.shipping)}</span>
                                    ) : (
                                        <span className="text-green-600 uppercase tracking-widest font-semibold">FREE</span>
                                    )}
                                </div>
                            </div>

                            {/* Total Due */}
                            <div className="flex justify-between items-center text-base border-t border-neutral-100 pt-4 font-semibold">
                                <span className="uppercase tracking-widest text-neutral-900">Amount Due</span>
                                <span className="text-neutral-900 text-lg font-bold">
                                    {formatCurrency(totals.total)}
                                </span>
                            </div>

                            {/* Checkout action */}
                            <button
                                onClick={handleCheckout}
                                disabled={processing || !selectedAddressId}
                                className="w-full bg-noir border border-noir text-ivory text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-500 hover:bg-gold hover:border-gold hover:text-white disabled:opacity-40 h-14"
                            >
                                {processing ? "Processing…" : `Pay Now • ${formatCurrency(totals.total)}`}
                            </button>

                            <p className="text-[9px] text-neutral-400 text-center leading-relaxed">
                                Transaction processed via bank grade 256-bit SSL encrypted connection
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
