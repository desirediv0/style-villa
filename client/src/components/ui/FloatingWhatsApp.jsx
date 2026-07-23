"use client";

import Image from "next/image";

export const FloatingWhatsApp = () => {
  const phoneNumber = "919991111861";
  const message = encodeURIComponent("Hello Style Villa, I would like to enquire about your collection.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[76px] md:bottom-6 right-4 md:right-6 z-40 group flex items-center justify-center w-14 h-14 bg-noir border border-gold/50 rounded-full shadow-[0_18px_40px_-16px_rgba(13,11,12,0.6)] hover:scale-110 hover:border-gold active:scale-95 transition-all duration-300 cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      {/* Soft gold pulse */}
      <div className="absolute inset-0 rounded-full glow-pulse pointer-events-none" />

      <Image
        src="/whatsapp.png"
        alt="WhatsApp Icon"
        width={50}
        height={50}
        className="w-9 h-9 object-contain"
      />
    </a>
  );
};

export default FloatingWhatsApp;
