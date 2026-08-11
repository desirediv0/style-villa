import {
  BadgeCheck, Sparkles, Truck, ShieldCheck,
  HeartHandshake, IndianRupee, Star, ArrowRight,
  Gem, RefreshCw, Package, Heart, PhoneCall
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Why Choose Us | Style Villa — Premium Fashion & Bags",
  description: "Discover why thousands of customers across India trust Style Villa for curated fashion, designer handbags, footwear, and accessories — quality, style, and affordability.",
};

const REASONS = [
  {
    icon: BadgeCheck,
    color: "#A958A4",
    title: "Curated Premium Quality",
    description: "Every clothing item, bag, and accessory is handpicked and quality-inspected before it reaches you. No compromises on craftsmanship or materials.",
  },
  {
    icon: Gem,
    color: "#00AEEF",
    title: "Affordable Luxury",
    description: "We bridge the gap between luxury aesthetics and everyday affordability. Premium design at fair prices — no middleman markups.",
  },
  {
    icon: Truck,
    color: "#A958A4",
    title: "Pan-India Fast Delivery",
    description: "Reliable courier partnerships across all Indian PIN codes. Express shipping options with real-time tracking on every order.",
  },
  {
    icon: RefreshCw,
    color: "#00AEEF",
    title: "Easy Returns & Exchanges",
    description: "Not the right fit? Hassle-free returns and exchanges within 7 days. We make sure you're 100% happy with every purchase.",
  },
  {
    icon: IndianRupee,
    color: "#A958A4",
    title: "Transparent Pricing",
    description: "No hidden charges, no surprise fees. What you see is what you pay. Free shipping on prepaid orders above ₹999.",
  },
  {
    icon: HeartHandshake,
    color: "#00AEEF",
    title: "Personalized WhatsApp Support",
    description: "Style advice, order updates, size guidance — our team is available 24/7 on WhatsApp for fast, personal assistance.",
  },
];

const REVIEWS = [
  { name: "Neha Sharma", location: "Delhi", rating: 5, text: "Amazing quality handbag! The stitching and material are top-notch. Way better than what I expected at this price. Will order again!" },
  { name: "Priyanka Verma", location: "Mumbai", rating: 5, text: "Love the clothing collection. The fabric quality is premium and the designs are so trendy. My go-to for online fashion now." },
  { name: "Riya Gupta", location: "Lucknow", rating: 5, text: "Ordered shoes and a clutch for a wedding. Both arrived beautifully packed and on time. Got so many compliments!" },
  { name: "Simran Kaur", location: "Chandigarh", rating: 5, text: "The WhatsApp team helped me pick the perfect outfit for a party. Personalized service that you don't get from big brands." },
  { name: "Ananya Singh", location: "Jaipur", rating: 5, text: "Affordable prices with genuine quality. Ordered multiple times and never been disappointed. The packaging is also so pretty!" },
  { name: "Deepika Nair", location: "Kochi", rating: 5, text: "Ordered from Kerala and received in 4 days. The bag I bought looks exactly like the photos. Style Villa never disappoints." },
];

const STATS = [
  { value: "62K+", label: "Instagram Family" },
  { value: "Pan-India", label: "Delivery Network" },
  { value: "100%", label: "Quality Checked" },
  { value: "24/7", label: "WhatsApp Support" },
];

export default function WhyUsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FDFBF9" }}>

      {/* ── Hero ── */}
      <section
        className="relative py-16 md:py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #A958A4 60%, #00AEEF 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #00AEEF, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #00AEEF, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border border-white/20" style={{ background: "rgba(0,174,239,0.15)", color: "#00AEEF" }}>
            <Sparkles className="h-4 w-4" />
            Trusted by 62K+ Fashion Lovers Across India
          </div>
          <h1 className="text-4xl md:text-5xl text-white mb-5 leading-tight">
            Why Choose<br />
            <span style={{ color: "#00AEEF" }}>Style Villa?</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Curated fashion, designer bags, and premium accessories — delivered to your doorstep with care and quality you can trust.
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b" style={{ background: "white", borderColor: "#EDE8E3" }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black mb-1" style={{ color: "#A958A4" }}>{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reasons grid ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-3" style={{ color: "#1a1a2e" }}>
              What Sets Us Apart
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Not just another online store — here&apos;s why thousands of customers choose Style Villa for their fashion needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REASONS.map((reason, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderColor: "#EDE8E3" }}
              >
                <div
                  className="w-13 h-13 w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${reason.color}12` }}
                >
                  <reason.icon className="h-6 w-6" style={{ color: reason.color }} />
                </div>
                <h3 className="text-lg mb-2" style={{ color: "#1a1a2e" }}>{reason.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collections banner ── */}
      <section className="py-12" style={{ background: "white", borderTop: "1px solid #EDE8E3", borderBottom: "1px solid #EDE8E3" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#A958A412" }}>
                <Gem className="h-6 w-6" style={{ color: "#A958A4" }} />
              </div>
              <div>
                <p className="text-lg" style={{ color: "#1a1a2e" }}>Our Collections</p>
                <p className="text-sm text-gray-500">Clothing · Handbags · Footwear · Accessories · Women&apos;s · Men&apos;s</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Premium Clothing", "Designer Handbags", "Trendy Footwear", "Imported Accessories", "Women's Fashion", "Men's Collection"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ background: "#A958A412", borderColor: "#EDE8E3", color: "#A958A4" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="py-16 md:py-20" style={{ background: "#FDFBF9" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-3" style={{ color: "#1a1a2e" }}>
              What Our Customers Say
            </h2>
            <p className="text-gray-500">Real experiences from fashion lovers across India.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg" style={{ borderColor: "#EDE8E3" }}>
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm"
                    style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
                  >
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>{review.name}</p>
                    <p className="text-xs text-gray-400">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust points ── */}
      <section className="py-12" style={{ background: "white", borderTop: "1px solid #EDE8E3" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: "Quality Inspected", desc: "Every item checked" },
              { icon: Package, label: "Secure Packaging", desc: "Protective packing" },
              { icon: Heart, label: "62K+ Happy Customers", desc: "Growing community" },
              { icon: PhoneCall, label: "24/7 Support", desc: "Always here for you" },
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

      {/* ── CTA ── */}
      <section className="py-16" style={{ background: "#1a1a2e" }}>
        <div className="max-w-7xl mx-auto px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(169,88,164,0.08), transparent 70%)" }} />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl text-white mb-4">
              Ready to Elevate Your Style?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Shop curated fashion, designer bags, and premium accessories with fast delivery and 24/7 support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <button
                  className="h-13 px-10 text-white rounded-xl font-semibold cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #A958A4, #00AEEF)" }}
                >
                  Shop Now <ArrowRight className="inline ml-2 h-5 w-5" />
                </button>
              </Link>
              <a
                href="https://wa.me/919896400453"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-13 px-10 rounded-xl font-semibold text-white border-2 transition-all hover:opacity-90"
                style={{ borderColor: "#00AEEF", color: "#00AEEF", height: "3.25rem" }}
              >
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
