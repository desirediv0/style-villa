"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";

export default function ResendVerificationPage() {
    const { resendVerification } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedEmail = localStorage.getItem("registeredEmail");
            if (storedEmail) setEmail(storedEmail);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { toast.error("Please enter your email address"); return; }

        setStatus("submitting");
        try {
            await resendVerification(email);
            setStatus("success");
            toast.success("OTP sent! Redirecting...", { duration: 3000 });
            if (typeof window !== "undefined") localStorage.removeItem("registeredEmail");
            setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`), 1500);
        } catch (error) {
            setStatus("error");
            toast.error(error.message || "Failed to send verification email");
            setTimeout(() => setStatus("idle"), 500);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}>
                        <Send className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Resend OTP</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        We&apos;ll send a new 6-digit code to your email
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8">

                    {status === "success" && (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-50">
                                <Mail className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm font-semibold text-green-600 mb-1">OTP Sent Successfully!</p>
                            <p className="text-xs text-gray-500">Taking you to enter the OTP...</p>
                            <Link
                                href={`/verify-otp?email=${encodeURIComponent(email)}`}
                                className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                                style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
                            >
                                Enter OTP <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )}

                    {(status === "idle" || status === "error") && (
                        <form onSubmit={handleSubmit} className="space-y-5">
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

                            <button
                                type="submit" disabled={status === "submitting"}
                                className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/20"
                                style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
                            >
                                {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
                            </button>
                        </form>
                    )}

                    {status === "submitting" && (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: "#A958A4" }} />
                            <p className="text-sm text-gray-500 mt-4">Sending verification email...</p>
                        </div>
                    )}
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    <Link href="/auth?tab=login" className="font-semibold text-[#A958A4] hover:underline">Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
}