import { HeroSection } from "@/components/sections/HeroSection";
import { DimensionsSection } from "@/components/sections/DimensionsSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <Header />
      <HeroSection />
      <DimensionsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
