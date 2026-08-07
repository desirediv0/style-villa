import { Truck, Package, Clock, ShieldCheck, MapPin, Search, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery Policy | Style Villa",
  description: "Learn about Style Villa's shipping guidelines, dispatch schedules, regional delivery timelines across India, and order tracking details.",
};

const SHIPPING_CARDS = [
  {
    icon: Package,
    color: "#A958A4",
    title: "Careful Inspection & Secure Packing",
    description: "Every item is thoroughly inspected for quality standards and securely packed in protective packaging before dispatch.",
  },
  {
    icon: Truck,
    color: "#00AEEF",
    title: "Free Shipping Across India",
    description: "We provide free shipping mostly on all orders across India with trusted logistics delivery partners.",
  },
  {
    icon: Clock,
    color: "#A958A4",
    title: "Quick Dispatch Timelines",
    description: "Orders are typically dispatched within 1–2 business days from our facility upon order confirmation.",
  },
  {
    icon: ShieldCheck,
    color: "#00AEEF",
    title: "Dedicated Courier Coordination",
    description: "If delivery partners face challenges with your address, they will reach out to ensure smooth delivery.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Hero */}
      <section
        className="relative py-16 md:py-20 overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #A958A4, transparent 70%)" }} />
          <div className="absolute bottom-0 left-10 w-60 h-60 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #00AEEF, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-purple-300">Shipping Policy</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-gray-300 max-w-2xl text-sm md:text-base font-light leading-relaxed">
            At Style Villa, we are committed to ensuring that every product you receive meets our highest standards of quality.
          </p>
        </div>
      </section>

      {/* Cards grid */}
      <section className="py-12 md:py-16 px-5 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-10">

          <div className="grid md:grid-cols-2 gap-5">
            {SHIPPING_CARDS.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${card.color}15` }}
                >
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Policy Detail Prose */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200/80 shadow-sm space-y-10">

            {/* Quality & Dispatch */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2.5">
                <span className="w-1.5 h-6 bg-purple-600 rounded-full flex-shrink-0" />
                Shipping Commitment &amp; Dispatch
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                At Style Villa, we are committed to ensuring that every product you receive meets our highest standards of quality. Once your order is placed, we carefully inspect and securely pack your items before handing them over to our trusted delivery partners.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our delivery partners strive to ensure timely delivery of your package. In case of any challenges or issues while delivering to your address, they will reach out to you to resolve the matter and complete the delivery process smoothly.
              </p>
            </div>

            {/* Regional Delivery Timelines */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-purple-400">Pan-India Delivery</span>
                <h3 className="text-xl font-bold mt-1 text-white">Estimated Regional Delivery Timelines</h3>
                <p className="text-xs text-gray-300 mt-1">
                  We provide free shipping mostly on all orders across India. Orders are typically dispatched within 1–2 business days.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                  <div className="text-xs text-purple-300 font-semibold mb-1">North India</div>
                  <div className="text-xl font-extrabold text-white">3 Business Days</div>
                  <div className="text-[11px] text-gray-400 mt-1">Quick regional transit</div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                  <div className="text-xs text-sky-300 font-semibold mb-1">West &amp; Central India</div>
                  <div className="text-xl font-extrabold text-white">5–7 Business Days</div>
                  <div className="text-[11px] text-gray-400 mt-1">Standard express delivery</div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                  <div className="text-xs text-emerald-300 font-semibold mb-1">East &amp; South India</div>
                  <div className="text-xl font-extrabold text-white">7–10 Business Days</div>
                  <div className="text-[11px] text-gray-400 mt-1">Extended regional coverage</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 italic">
                * Delivery timelines depend on your exact location, PIN code, and courier service availability.
              </p>
            </div>

            {/* Order Tracking */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2.5">
                <Search className="w-5 h-5 text-purple-600" />
                HOW CAN I TRACK MY ORDER AFTER SHIPPING?
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Once your order has been dispatched, you will receive an email confirmation with your tracking number and details of the courier partner handling your delivery.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                You can track it online as well to get more information about the estimated delivery time. The tracking information will be updated and become active once the package has left our warehouse.
              </p>
            </div>

            {/* Support CTA */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="text-sm font-bold text-gray-900">Have questions about your package status?</p>
                <p className="text-xs text-gray-500 mt-0.5">Please feel free to reach out to our Customer Care Team. We are always here to support you!</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href="mailto:stylevilla.ktl@gmail.com"
                  className="text-xs px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-center font-medium text-gray-800 flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-600" /> stylevilla.ktl@gmail.com
                </a>
                <a
                  href="https://wa.me/919896400453"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-4 py-2.5 rounded-xl transition-colors hover:opacity-90 text-center text-white bg-emerald-600 font-medium flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Support
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

