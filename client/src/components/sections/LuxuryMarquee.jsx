"use client";

const WORDS = [
  "New Season",
  "Handbags",
  "Clothing",
  "Footwear",
  "Accessories",
  "Imported Fashion",
];

function MarqueeRow() {
  return (
    <div className="flex items-center flex-shrink-0" aria-hidden="true">
      {WORDS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={
              i % 2 === 0
                ? "font-display italic text-3xl md:text-5xl text-gradient whitespace-nowrap px-6 md:px-10 tracking-wide"
                : "font-display text-3xl md:text-5xl text-hollow-dark whitespace-nowrap px-6 md:px-10 tracking-wide uppercase"
            }
          >
            {item}
          </span>
          <span className={`text-sm md:text-base ${i % 2 === 0 ? "text-azure" : "text-plum"}`}>✦</span>
        </span>
      ))}
    </div>
  );
}

export default function LuxuryMarquee() {
  return (
    <section
      className="relative bg-ivory py-7 md:py-9 select-none overflow-hidden luxe-aurora-light border-y border-line"
      aria-label="Style Villa highlights"
    >
      <div className="luxe-marquee relative z-10">
        <div className="luxe-marquee-track">
          <MarqueeRow />
          <MarqueeRow />
        </div>
      </div>
    </section>
  );
}
