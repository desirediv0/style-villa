import {
  Sparkles, ShieldCheck, Heart, Award,
  Gem, Check, Gift, PhoneCall, MapPin, Instagram, Facebook, Phone, ArrowRight, Star, Zap, Target, Eye, Compass, Store, GraduationCap, Building2
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Style Villa — Our Story, Mission & Vision",
  description: "Learn about Style Villa, founded by Gorang Gera and Nirmala Gera in Kaithal, Haryana. Discover our journey from corporate MBA careers to building a trusted fashion destination.",
};

const stats = [
  { value: "Kaithal", label: "Flagship Store, Haryana", icon: <Store className="w-5 h-5" /> },
  { value: "62.3K+", label: "Social Media Community", icon: <Instagram className="w-5 h-5" /> },
  { value: "Pan-India", label: "Delivery to Every PIN Code", icon: <ShieldCheck className="w-5 h-5" /> },
  { value: "24/7", label: "Customer Care Support", icon: <Phone className="w-5 h-5" /> },
];

const values = [
  {
    icon: Award,
    title: "Curated Excellence",
    description: "Every clothing item, bag, footwear and accessory is handpicked and inspected to ensure premium quality and contemporary style.",
  },
  {
    icon: Gem,
    title: "Affordable Luxury",
    description: "We bridge the gap between luxury aesthetics and everyday affordability, keeping prices fair without compromising craftsmanship.",
  },
  {
    icon: Heart,
    title: "Inclusive Fashion",
    description: "Fashion is a form of self-expression that belongs to everyone — no matter where you live or your access to premium markets.",
  },
  {
    icon: Gift,
    title: "Signature Care",
    description: "Every order is packed thoughtfully in protective packaging, ready to bring delight and confidence to your doorstep.",
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
  { year: "Corporate Days", title: "MBA & Corporate Success", desc: "Founders Gorang Gera & Nirmala Gera earned MBA degrees and gained corporate experience in strategy and customer management." },
  { year: "First Store", title: "Flagship Store in Kaithal", desc: "Stepped away from corporate paths to follow their true calling in fashion, opening their first store in Kaithal, Haryana." },
  { year: "Community", title: "62K+ Growing Family", desc: "Overwhelming customer response and growing social media followers inspired expansion beyond physical boundaries." },
  { year: "Online Expansion", title: "Pan-India Reach", desc: "Launched stylevilla.in to bring curated, premium fashion directly to doorsteps in cities, towns, and remote locations across India." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero — editorial header */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-ivory luxe-aurora-light border-b border-line">
        <span
          className="pointer-events-none select-none absolute -bottom-8 left-1/2 -translate-x-1/2 font-display italic whitespace-nowrap text-[10rem] leading-none text-hollow-dark opacity-25 hidden lg:block"
          aria-hidden="true"
        >
          Style Villa
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-5 text-center">
          <span className="luxe-eyebrow block mb-5">Our Journey &amp; Legacy</span>
          <h1 className="font-display text-4xl md:text-6xl text-noir mb-6 tracking-tight">
            Our <em className="luxe-italic text-gradient">Story</em>
          </h1>
          <span className="mx-auto block h-px w-24 bg-gradient-to-r from-transparent via-plum to-transparent mb-6" />
          <p className="text-stone-dark max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
            Every dream begins with a passion — ours began with a shared love for fashion, creativity, and bringing premium design to everyone.
          </p>
        </div>
      </section>

      {/* Stats */}
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
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            <div>
              <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full mb-4 font-bold" style={{ background: "#A958A412", color: "#A958A4" }}>
                Founders&apos; Story
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                From Corporate Excellence to Fashion Entrepreneurship
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
                Every dream begins with a passion, and ours began with a shared love for fashion, creativity, and the desire to make beautiful designs accessible to everyone.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
                The journey of founders <strong className="text-gray-900 font-bold">Gorang Gera and Nirmala Gera</strong> is a story of courage, transformation, and following one’s true calling. Both accomplished their MBA degrees and built successful careers in the corporate world, gaining valuable experience in management, business strategy, and understanding customer needs.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                However, after marriage, they chose to step away from their corporate paths and follow a passion that had always been close to their hearts — <strong className="text-gray-900 font-bold">Fashion and Entrepreneurship</strong>. With a vision to create a trusted fashion destination, they opened their first physical store in <strong className="text-gray-900 font-bold">Kaithal, Haryana</strong>, bringing their selection of premium products closer to their local community.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                The response was overwhelming. Customers connected with their eye for style, commitment to quality, and personalized shopping experience. As their community grew, so did their vision — leading to the launch of their online store to make fashion accessible, convenient, and inclusive across India.
              </p>

              <div className="space-y-3 pt-6 border-t border-gray-100">
                {[
                  "Founded by Gorang Gera & Nirmala Gera (MBA Graduates)",
                  "Started with Flagship Store in Kaithal, Haryana",
                  "Expanding Pan-India Online with Trusted Quality",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#A958A412" }}>
                      <Check className="w-3 h-3" style={{ color: "#A958A4" }} />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories & Highlights Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" /> Executive Corporate Roots
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Combining corporate management precision with creative fashion curation. Every piece is sourced, verified, and delivered with customer satisfaction as our highest priority.
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-xs text-purple-300">
                  <Building2 className="w-4 h-4" /> Management Strategy &bull; Sourcing Integrity &bull; Customer Care
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">Our Collections</h3>
                <p className="text-xs text-gray-400 mb-6">Browse our range of curated premium fashion</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#A958A410" }}>
                        <Gem className="w-3.5 h-3.5" style={{ color: "#A958A4" }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Philosophy, Mission & Vision */}
      <section className="py-16 md:py-20 bg-slate-50 border-y border-gray-100 px-5">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full mb-4 font-bold" style={{ background: "#A958A412", color: "#A958A4" }}>
              Core Beliefs
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Philosophy, Mission &amp; Vision
            </h2>
            <p className="text-gray-500 text-sm">
              The principles that guide every collection we curate and every customer relationship we build.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Philosophy */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#A958A415", color: "#A958A4" }}>
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Philosophy</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                  At Style Villa, we believe that fashion is not a privilege reserved for a few — it is a form of self-expression that belongs to everyone.
                </p>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Our philosophy is built on the belief that no individual, regardless of where they live or their access to premium markets, should be deprived of quality design and the confidence that comes with looking and feeling their best.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-purple-700 font-semibold">
                Bridging luxury aesthetics &amp; everyday affordability.
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#00AEEF15", color: "#00AEEF" }}>
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                  We believe that true style has no boundaries, and great design should be inclusive.
                </p>
                <p className="text-gray-800 text-xs md:text-sm font-semibold leading-relaxed bg-sky-50 p-4 rounded-2xl border border-sky-100/60">
                  &ldquo;Because fashion is not just about what you wear — it is about how you express yourself. And everyone deserves the opportunity to express who they are.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-sky-700 font-semibold">
                Empowering self-expression for every customer.
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#D4AF3720", color: "#B8860B" }}>
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                  Our vision goes beyond cities and fashion hubs. We strive to make stylish, quality products accessible even to customers in remote locations.
                </p>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Ensuring that geography never becomes a barrier to personal style. Through trusted sourcing, fair pricing, and a commitment to quality, we bring fashion closer to every doorstep and become the most lovable lifestyle brand.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-amber-700 font-semibold">
                Fashion to every doorstep — city or remote.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Why Choose Us / Values */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full mb-4 font-bold" style={{ background: "#A958A412", color: "#A958A4" }}>
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              What Makes Style Villa Special
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
                  <p className="text-gray-500 text-xs leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="py-16 md:py-20 bg-gray-50 border-t border-gray-100 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full mb-4 font-bold" style={{ background: "#A958A412", color: "#A958A4" }}>
              Our Milestone Story
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              From Kaithal Store to Pan-India Vision
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-px" />

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
                    <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-y border-gray-100 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: "Quality Inspected", desc: "Carefully checked before packing" },
              { icon: Zap, label: "Fast Shipping", desc: "Pan-India delivery" },
              { icon: Star, label: "Loved Community", desc: "62K+ Instagram family" },
              { icon: Gift, label: "Thoughtfully Packed", desc: "Protective packaging" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
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
          <div className="relative rounded-3xl overflow-hidden bg-gray-950 py-14 px-6 md:px-14 text-center shadow-2xl">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-20" style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }} />
            </div>

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                Connect With Style Villa
              </h2>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Visit our store in Kaithal, Haryana or follow us on social media for exclusive drops and new arrivals.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a href="https://wa.me/919896400453" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}>
                  <PhoneCall className="h-4 w-4" /> WhatsApp Support
                </a>
                <a href="https://www.instagram.com/stylevillaofficial" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all">
                  <Instagram className="h-4 w-4" /> @stylevillaofficial
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-white/40">
                <MapPin className="h-3.5 w-3.5 text-purple-400" />
                <span>Kaithal, Haryana &bull; </span>
                <a href="https://maps.app.goo.gl/K61B31xzQXyZCdMT6" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">
                  View Flagship Store on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

