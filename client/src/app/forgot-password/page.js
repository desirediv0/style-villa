"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Mail, Loader2, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { forgotPassword, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            await forgotPassword(email);
            toast.success("If your email is registered, you will receive a password reset link");
            router.push("/auth?tab=login");
        } catch (err) {
            toast.error(err.message || "Failed to request password reset");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
                        <KeyRound className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    placeholder="you@example.com"
                                    className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A458A6] focus:ring-2 focus:ring-[#A458A6]/10 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={submitting || loading}
                            className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/20"
                            style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
                        >
                            {submitting || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    <Link href="/auth?tab=login" className="font-semibold text-[#A458A6] hover:underline">Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
}