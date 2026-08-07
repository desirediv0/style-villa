"use client";

import { useState } from "react";
import {
  Phone, Mail, Send, Loader2, MapPin, Clock, ArrowRight
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { fetchApi } from "@/lib/utils";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "919896400453";
const PHONE_NUMBER = "+91 98964 00453";
const SECONDARY_PHONE = "+91 99911 11861";
const EMAIL_ADDRESS = "stylevilla.ktl@gmail.com";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/K61B31xzQXyZCdMT6";

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

      {/* Hero — noir editorial */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-ivory luxe-aurora-light border-b border-line">
        <span
          className="pointer-events-none select-none absolute -bottom-8 left-1/2 -translate-x-1/2 font-display italic whitespace-nowrap text-[10rem] leading-none text-hollow-dark opacity-25 hidden lg:block"
          aria-hidden="true"
        >
          Bonjour
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2.5 mb-6 text-[10px] uppercase tracking-[0.35em] text-plum font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            We&apos;re Online
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-noir mb-6 tracking-tight">
            Let&apos;s <em className="luxe-italic text-gradient">Talk</em>
          </h1>
          <span className="mx-auto block h-px w-24 bg-gradient-to-r from-transparent via-plum to-transparent mb-6" />
          <p className="text-stone-dark max-w-md mx-auto text-sm md:text-base font-light leading-relaxed">
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
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                <FaWhatsapp className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">WhatsApp</h4>
                <p className="text-sm text-gray-400 mt-0.5">{PHONE_NUMBER}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
            </a>

            {/* Call */}
            <a
              href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-purple-50 text-[#A958A4] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#A958A4] group-hover:text-white transition-all duration-300">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Call Us</h4>
                <p className="text-sm text-gray-400 mt-0.5">{PHONE_NUMBER}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#A958A4] group-hover:translate-x-1 transition-all" />
            </a>

            {/* Email */}
            <a
              href={`mailto:${EMAIL_ADDRESS}`}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#00AEEF] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00AEEF] group-hover:text-white transition-all duration-300">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Email</h4>
                <p className="text-xs text-gray-400 mt-0.5 break-all">{EMAIL_ADDRESS}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#00AEEF] group-hover:translate-x-1 transition-all" />
            </a>

            {/* Info */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-4 w-4 text-[#A958A4]" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Business Hours</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">10:30 AM – 08:30 PM (Daily)</p>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#00AEEF]" />
                <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-[#A958A4] font-semibold hover:underline">
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
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A958A4]/10 focus:border-[#A958A4] focus:outline-none transition-all text-sm placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Phone</label>
                    <input
                      type="text" name="phone" value={formData.phone} onChange={handleInputChange} required
                      placeholder={PHONE_NUMBER}
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A958A4]/10 focus:border-[#A958A4] focus:outline-none transition-all text-sm placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Email</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInputChange} required
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A958A4]/10 focus:border-[#A958A4] focus:outline-none transition-all text-sm placeholder:text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Subject</label>
                  <select
                    name="subject" value={formData.subject} onChange={handleInputChange}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A958A4]/10 focus:border-[#A958A4] focus:outline-none transition-all text-sm text-gray-700"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#A958A4]/10 focus:border-[#A958A4] focus:outline-none transition-all text-sm resize-none placeholder:text-gray-300"
                  />
                </div>

                <button
                  type="submit" disabled={formLoading}
                  className="w-full h-13 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
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