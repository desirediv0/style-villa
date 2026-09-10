
import HeroSection from "@/components/sections/HeroSection";
import HeroSection3D from "@/components/sections/HeroSection3D";
import HeroSectionStore from "@/components/sections/HeroSectionStore";
import HeroSectionLight from "@/components/sections/HeroSectionLight";
import LuxuryMarquee from "@/components/sections/LuxuryMarquee";
import TrustBadgesSection from "@/components/sections/TrustBadgesSection";
import HomePageContent from "@/components/sections/HomePageContent";
import WatchAndBuySection from "@/components/sections/WatchAndBuySection";
import CategoryGrid from "@/components/sections/CategoryGrid";
// import SocialMediaSection from "@/components/sections/SocialMediaSection";
import TestimonialSection from "@/components/sections/TestimonialSection";

export const metadata = {
  title: "Style Villa | Premium Fashion & Lifestyle",
  description: "Discover Style Villa — your destination for premium imported fashion, clothing, handbags, footwear and accessories.",
};

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        {/* <HeroSection3D /> */}
        {/* <HeroSectionStore /> */}
        {/* <HeroSectionLight /> */}
        <LuxuryMarquee />
        <CategoryGrid />
        <WatchAndBuySection />
        <HomePageContent />
        <TrustBadgesSection />
        <TestimonialSection />
        {/* <SocialMediaSection /> */}
      </main>
    </>
  );
}
