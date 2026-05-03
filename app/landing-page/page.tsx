import { HeroSection } from "@/components/landing/hero-section";
import { ValueProps } from "@/components/landing/value-props";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesDetail } from "@/components/landing/features-detail";
import { CTASection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ValueProps />
      <HowItWorks />
      <FeaturesDetail />
      <CTASection />
    </main>
  );
}