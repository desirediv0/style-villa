"use client";

const ITEMS = [
  "Premium Imported Fashion",
  "Free Shipping Above ₹999",
  "Curated by Style Villa",
  "Worldwide Delivery",
  "New Arrivals Weekly",
  "Easy Returns & Exchanges",
];

function MarqueeContent() {
  return (
    <div className="flex items-center flex-shrink-0">
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="text-sm md:text-base font-medium text-white/90 whitespace-nowrap px-8 md:px-12 tracking-wide">
            {item}
          </span>
          <span className="text-white/30 text-xs" aria-hidden="true">|</span>
        </span>
      ))}
    </div>
  );
}

export default function LuxuryMarquee() {
  return (
    <section
      className="luxe-marquee py-4 border-y border-brand-border select-none"
      style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
      aria-label="Style Villa highlights"
    >
      <div className="luxe-marquee-track">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </section>
  );
}
