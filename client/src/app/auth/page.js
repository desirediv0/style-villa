"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const tabFromUrl = searchParams.get("tab") || "login";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => { setActiveTab(tabFromUrl); }, [tabFromUrl]);
  useEffect(() => { if (isAuthenticated) router.push("/"); }, [isAuthenticated, router]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/auth?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 sm:py-16">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Style Villa
            </span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-8">
          {[
            { key: "login", label: "Sign In" },
            { key: "register", label: "Register" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8">
          {activeTab === "login" && <LoginForm onSwitch={() => handleTabChange("register")} />}
          {activeTab === "register" && <RegisterForm onSwitch={() => handleTabChange("login")} />}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-gray-600 underline">Terms</Link>
          {" "}&{" "}
          <Link href="/privacy-policy" className="text-gray-600 underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password are required"); return; }
    setIsSubmitting(true);
    try {
      await login(email, password);
      sessionStorage.setItem("justLoggedIn", "true");
      toast.success("Welcome back!");
      const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect");
      setTimeout(() => router.push(returnUrl ? decodeURIComponent(returnUrl) : "/"), 300);
    } catch (error) {
      const msg = error.message || "Login failed.";
      if (msg.toLowerCase().includes("verify")) {
        toast.error(<div>{msg}{" "}<Link href="/resend-verification" className="font-medium underline text-black">Resend</Link></div>);
      } else { toast.error(msg); }
    } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

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
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-700">Password</label>
          <Link href="/forgot-password" className="text-xs font-medium text-[#A958A4] hover:underline">Forgot?</Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
            placeholder="Enter your password"
            className="w-full h-12 pl-10 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A958A4] focus:ring-2 focus:ring-[#A958A4]/10 transition-all placeholder:text-gray-400"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit" disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/20"
        style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
      </button>

      <p className="text-center text-sm text-gray-500 pt-2">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-[#A958A4] hover:underline">Register</button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.name.trim().length < 3) { toast.error("Name should be at least 3 characters"); return false; }
    if (!formData.phone || formData.phone.length < 10) { toast.error("Please enter a valid phone number"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.error("Please enter a valid email"); return false; }
    if (formData.password.length < 8) { toast.error("Password should be at least 8 characters"); return false; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const res = await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
      const payload = res?.data ?? res;
      const emailSent = payload?.emailSent !== false;
      if (payload?.debugOtp) {
        toast.success(`Verification code: ${payload.debugOtp}`, { duration: 25000 });
      } else if (emailSent) {
        toast.success("Account created! Check your email for OTP.", { duration: 4000 });
      } else {
        toast.warning(res?.message || "Account created but email could not be sent.");
      }
      localStorage.setItem("registeredEmail", formData.email);
      setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`), 600);
    } catch (error) {
      toast.error(error.message || "Registration failed.");
    } finally { setIsSubmitting(false); }
  };

  const fields = [
    { label: "Full Name", name: "name", type: "text", icon: User, placeholder: "John Doe" },
    { label: "Email", name: "email", type: "email", icon: Mail, placeholder: "you@example.com" },
    { label: "Phone", name: "phone", type: "tel", icon: Phone, placeholder: "+91 9876543210" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Create account</h2>
        <p className="text-sm text-gray-500 mt-1">Join Style Villa today</p>
      </div>

      {fields.map(({ label, name, type, icon: Icon, placeholder }) => (
        <div key={name}>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
          <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={type} name={name} value={formData[name]} onChange={handleChange} required placeholder={placeholder}
              className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A958A4] focus:ring-2 focus:ring-[#A958A4]/10 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      ))}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required
            placeholder="Min 8 characters"
            className="w-full h-12 pl-10 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A958A4] focus:ring-2 focus:ring-[#A958A4]/10 transition-all placeholder:text-gray-400"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
            placeholder="Confirm your password"
            className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A958A4] focus:ring-2 focus:ring-[#A958A4]/10 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <button
        type="submit" disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/20"
        style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
      </button>

      <p className="text-center text-sm text-gray-500 pt-2">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-[#A958A4] hover:underline">Sign In</button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#A958A4" }} />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}