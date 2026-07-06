"use client";

import { useState } from "react";
import {
  Phone, Mail, Send, Loader2, MapPin, Clock, ArrowRight
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { fetchApi } from "@/lib/utils";
import { toast } from "sonner";

export default function ContactPage() {
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetchApi("/content/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success(response.data?.message || "Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    } catch (error) {
      toast.error(error.message || "Failed to send. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero — clean dark with gradient accent */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gray-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-30" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-6 bg-white/10 text-white/80 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            We&apos;re Online
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Let&apos;s Talk
          </h1>
          <p className="text-white/40 max-w-md mx-auto text-sm md:text-base">
            Questions, orders, collaborations — we&apos;re just a message away.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="max-w-7xl mx-auto px-5 -mt-8 relative z-20 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left Cards */}
          <div className="lg:col-span-4 space-y-4">

            {/* WhatsApp */}
            <a
              href="https://wa.me/918796449692"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                <FaWhatsapp className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">WhatsApp</h4>
                <p className="text-sm text-gray-400 mt-0.5">+91 87964 49692</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
            </a>

            {/* Call */}
            <a
              href="tel:+918796449692"
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-purple-50 text-[#A458A6] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#A458A6] group-hover:text-white transition-all duration-300">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Call Us</h4>
                <p className="text-sm text-gray-400 mt-0.5">+91 87964 49692</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#A458A6] group-hover:translate-x-1 transition-all" />
            </a>

            {/* Email */}
            <a
              href="mailto:stylevillabypoojakhan@gmail.com"
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#14A8E6] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#14A8E6] group-hover:text-white transition-all duration-300">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Email</h4>
                <p className="text-xs text-gray-400 mt-0.5 break-all">stylevillabypoojakhan@gmail.com</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#14A8E6] group-hover:translate-x-1 transition-all" />
            </a>

            {/* Info */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-4 w-4 text-[#A458A6]" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Business Hours</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">10:30 AM – 7:00 PM (Daily)</p>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#14A8E6]" />
                <a href="https://maps.app.goo.gl/MTy3mYLeAXTr7jxP" target="_blank" rel="noopener noreferrer" className="text-sm text-[#A458A6] font-semibold hover:underline">
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg shadow-gray-100/50">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Send Us a Message</h2>
                <p className="text-sm text-gray-400 mt-1">We&apos;ll get back to you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Full Name</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleInputChange} required
                      placeholder="John Doe"
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A458A6]/10 focus:border-[#A458A6] focus:outline-none transition-all text-sm placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Phone</label>
                    <input
                      type="text" name="phone" value={formData.phone} onChange={handleInputChange} required
                      placeholder="+91 87964 49692"
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A458A6]/10 focus:border-[#A458A6] focus:outline-none transition-all text-sm placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Email</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInputChange} required
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A458A6]/10 focus:border-[#A458A6] focus:outline-none transition-all text-sm placeholder:text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Subject</label>
                  <select
                    name="subject" value={formData.subject} onChange={handleInputChange}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A458A6]/10 focus:border-[#A458A6] focus:outline-none transition-all text-sm text-gray-700"
                  >
                    <option>General Inquiry</option>
                    <option>Order Status</option>
                    <option>Collaboration</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Message</label>
                  <textarea
                    name="message" value={formData.message} onChange={handleInputChange} required rows={4}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A458A6]/10 focus:border-[#A458A6] focus:outline-none transition-all text-sm resize-none placeholder:text-gray-300"
                  />
                </div>

                <button
                  type="submit" disabled={formLoading}
                  className="w-full h-13 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
                >
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Send Message <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}