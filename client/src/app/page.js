
import HeroSection from "@/components/sections/HeroSection";
import LuxuryMarquee from "@/components/sections/LuxuryMarquee";
import TrustBadgesSection from "@/components/sections/TrustBadgesSection";
import HomePageContent from "@/components/sections/HomePageContent";
import WatchAndBuySection from "@/components/sections/WatchAndBuySection";
import { WhyBuySection } from "@/components/sections/WhyBuySection";
import { ColdChainBanner } from "@/components/sections/JewelryHomeSections";
import CategoryGrid from "@/components/sections/CategoryGrid";
// import SocialMediaSection from "@/components/sections/SocialMediaSection";
import JournalSection from "@/components/sections/JournalSection";

export const metadata = {
  title: "Style Villa | Premium Fashion & Lifestyle",
  description: "Discover Style Villa — your destination for premium imported fashion, clothing, handbags, footwear and accessories.",
};

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <LuxuryMarquee />
        <CategoryGrid />
        <HomePageContent />
        <WatchAndBuySection />
        <ColdChainBanner />
        <TrustBadgesSection />
        <JournalSection />
        <WhyBuySection />
        {/* <SocialMediaSection /> */}
      </main>
    </>
  );
}
