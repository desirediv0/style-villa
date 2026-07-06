"use client";

import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";

export const FloatingWhatsApp = () => {
  const phoneNumber = "918796449692";
  const message = encodeURIComponent("Hello stylevilla, I would like to enquire about handmade jewellery.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[76px] md:bottom-6 right-4 md:right-6 z-40 group flex items-center justify-center md:justify-start w-14 h-14 md:w-auto md:h-auto bg-gradient-to-r from-[#03360E] to-[#0A5618] hover:from-[#022409] hover:to-[#073c10] border border-white/20 md:px-2 md:py-2 rounded-full shadow-2xl hover:shadow-emerald-950/20 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />

      {/* Icon on Right / Main Icon */}
      <Image
        src="/whatsapp.png"
        alt="WhatsApp Icon"
        width={50}
        height={50}
        className="w-10 h-10 md:w-12 md:h-12 object-contain"
      />
    </a>
  );
};

export default FloatingWhatsApp;
