import {
  Sparkles, ShieldCheck, Heart, Award,
  Gem, Check, Gift, PhoneCall, MapPin, Instagram, Facebook, Phone, ArrowRight, Star, Zap
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Style Villa — Imported Premium Fashion",
  description: "Style Villa by Nirmala & Gorang Gera — your destination for imported premium clothing, bags, and footwear. Imported | Premium | Affordable.",
};

const stats = [
  { value: "62.3K+", label: "Instagram Followers", icon: <Instagram className="w-5 h-5" /> },
  { value: "Imported", label: "Premium Quality", icon: <Gem className="w-5 h-5" /> },
  { value: "100%", label: "Original Products", icon: <ShieldCheck className="w-5 h-5" /> },
  { value: "24/7", label: "WhatsApp Support", icon: <Phone className="w-5 h-5" /> },
];

const values = [
  {
    icon: Award,
    title: "Imported & Premium",
    description: "Every product is carefully imported and curated to bring you the latest international fashion trends at affordable prices.",
  },
  {
    icon: Gem,
    title: "Affordable Luxury",
    description: "We believe premium fashion shouldn't break the bank. Our direct sourcing model keeps prices fair without compromising quality.",
  },
  {
    icon: Heart,
    title: "Curated with Care",
    description: "Founded by Nirmala & Gorang Gera, every collection is handpicked to ensure style, quality, and value for our customers.",
  },
  {
    icon: Gift,
    title: "Signature Packaging",
    description: "Every order is packed with care in protective packaging, perfect for gifting yourself or your loved ones.",
  },
];

const CATEGORIES = [
  "Premium Clothing",
  "Designer Handbags",
  "Trendy Footwear",
  "Imported Accessories",
  "Women's Fashion",
  "Men's Collection",
  "Youth Styles",
  "Seasonal Collections",
];

const milestones = [
  { year: "2018", title: "Founded", desc: "Nirmala & Gorang Gera started Style Villa with a vision to bring premium imported fashion to everyone." },
  { year: "2020", title: "62K+ Family", desc: "Grew to over 62,000 Instagram followers — a community built on trust and quality." },
  { year: "2023", title: "Pan-India Delivery", desc: "Expanded shipping across India with fast, reliable delivery and secure packaging." },
  { year: "Now", title: "Premium Fashion", desc: "Thousands of happy customers enjoying imported clothing, bags, and footwear." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero — noir editorial */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-ivory luxe-aurora-light border-b border-line">
        <span
          className="pointer-events-none select-none absolute -bottom-8 left-1/2 -translate-x-1/2 font-display italic whitespace-nowrap text-[10rem] leading-none text-hollow-dark opacity-25 hidden lg:block"
          aria-hidden="true"
        >
          Maison
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <span className="luxe-eyebrow block mb-5">Since Day One</span>
          <h1 className="font-display text-4xl md:text-6xl text-noir mb-6 tracking-tight">
            Our <em className="luxe-italic text-gradient">Story</em>
          </h1>
          <span className="mx-auto block h-px w-24 bg-gradient-to-r from-transparent via-plum to-transparent mb-6" />
          <p className="text-stone-dark max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
            Imported · Premium · Affordable — your trusted destination for fashion, clothing, bags &amp; footwear.
          </p>
        </div>
      </section>

      {/* Stats — overlapping */}
      <section className="max-w-7xl mx-auto px-5 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-lg shadow-gray-100/50 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #A958A412, #00AEEF12)" }}>
                <span style={{ color: "#A958A4" }}>{stat.icon}</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-[11px] text-gray-400 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            <div>
              <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full mb-4 font-bold" style={{ background: "#A958A412", color: "#A958A4" }}>
                Our Legacy
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Fashion that speaks for itself
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
                Style Villa was founded by <strong className="text-gray-700">Nirmala & Gorang Gera</strong> with a simple vision — to bring premium, imported fashion to everyone at affordable prices.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6 text-sm md:text-base">
                From clothing and bags to footwear and accessories, every piece is carefully imported and curated to match international quality standards.
              </p>

              <div className="space-y-3 pt-6 border-t border-gray-100">
                {["Premium Imported Products", "Direct-from-source Pricing", "Trusted by 62K+ Customers"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#A958A412" }}>
                      <Check className="w-3 h-3" style={{ color: "#A958A4" }} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Card */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Our Collections</h3>
              <p className="text-xs text-gray-400 mb-6">Browse our range of imported premium fashion</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#A958A410" }}>
                      <Gem className="w-3.5 h-3.5" style={{ color: "#A958A4" }} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-gray-50 border-y border-gray-100 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full mb-4 font-bold" style={{ background: "#A958A412", color: "#A958A4" }}>
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              What Makes Us Different
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#A958A412" }}>
                    <Icon className="h-5 w-5" style={{ color: "#A958A4" }} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full mb-4 font-bold" style={{ background: "#A958A412", color: "#A958A4" }}>
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              From Vision to Trust
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gray-100 -translate-x-px" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Dot */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md z-10" style={{ background: i === 0 ? "#A958A4" : i === milestones.length - 1 ? "#00AEEF" : "#A958A4" }} />

                  {/* Content */}
                  <div className={`ml-14 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2" style={{ background: "#A958A412", color: "#A958A4" }}>
                      {m.year}
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 mb-1">{m.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50 border-y border-gray-100 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: "100% Original", desc: "Authentic products" },
              { icon: Zap, label: "Fast Delivery", desc: "Pan-India shipping" },
              { icon: Star, label: "62K+ Happy", desc: "Instagram family" },
              { icon: Gift, label: "Secure Packing", desc: "Gift-ready orders" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#A958A412" }}>
                  <b.icon className="w-5 h-5" style={{ color: "#A958A4" }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{b.label}</div>
                  <div className="text-[11px] text-gray-400">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-gray-950 py-14 px-6 md:px-14 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-20" style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }} />
            </div>

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                Connect With Us
              </h2>
              <p className="text-white/40 mb-8 text-sm">
                Follow us on social media or reach out on WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a href="https://wa.me/919991111861" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}>
                  <PhoneCall className="h-4 w-4" /> WhatsApp
                </a>
                <a href="https://www.instagram.com/stylevillaofficial" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all">
                  <Instagram className="h-4 w-4" /> @stylevillaofficial
                </a>
                <a href="https://www.facebook.com/stylevillafamily" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-white/30">
                <MapPin className="h-3 w-3" />
<a href="https://maps.app.goo.gl/K61B31xzQXyZCdMT6" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors underline">
  View on Google Maps
</a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
