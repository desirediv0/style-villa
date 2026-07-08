"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Mail, KeyRound, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function VerifyOtpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyOtp, resendVerification } = useAuth();

    const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => { setEmail(initialEmail); }, [initialEmail]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Email is required");
        if (!/^\d{6}$/.test(otp)) return toast.error("Enter 6-digit OTP");

        setIsSubmitting(true);
        try {
            await verifyOtp(email, otp);
            toast.success("Verified! Logging you in...");
            setTimeout(() => router.push("/"), 500);
        } catch (err) {
            toast.error(err.message || "Failed to verify OTP");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!email) return toast.error("Enter your email to resend OTP");
        try {
            await resendVerification(email);
            toast.success("OTP sent to your email");
            setResendCooldown(30);
        } catch (err) {
            toast.error(err.message || "Failed to resend OTP");
        }
    };

    const handleChange = (e) => {
        const val = e.target.value.replace(/[^\d]/g, "").slice(0, 6);
        setOtp(val);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Backspace" && otp.length === 0) return;
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}>
                        <KeyRound className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
                    <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code sent to your email</p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8">
                    <form onSubmit={handleVerify} className="space-y-5">

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    placeholder="you@example.com"
                                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A958A4] focus:ring-2 focus:ring-[#A958A4]/10 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">OTP Code</label>
                            <div className="flex gap-2.5">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={otp[i] || ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^\d]/g, "");
                                            const newOtp = otp.split("");
                                            newOtp[i] = val;
                                            setOtp(newOtp.join("").slice(0, 6));
                                            if (val && e.target.nextElementSibling) {
                                                e.target.nextElementSibling.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !otp[i] && e.target.previousElementSibling) {
                                                e.target.previousElementSibling.focus();
                                            }
                                        }}
                                        className="w-full h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A958A4] focus:ring-2 focus:ring-[#A958A4]/10 transition-all text-gray-900"
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Didn&apos;t receive it? Check spam or{" "}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0}
                                    className={`font-semibold transition-colors ${resendCooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#A958A4] hover:underline"}`}
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                                </button>
                            </p>
                        </div>

                        <button
                            type="submit" disabled={isSubmitting || otp.length < 6}
                            className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/20"
                            style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    <Link href="/auth?tab=login" className="font-semibold text-[#A958A4] hover:underline">Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#A958A4" }} />
            </div>
        }>
            <VerifyOtpContent />
        </Suspense>
    );
}