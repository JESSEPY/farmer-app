import { HeroSection } from "@/components/landing/hero-section";
import { ValueProps } from "@/components/landing/value-props";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FeaturesDetail } from "@/components/landing/features-detail";
import { CTASection } from "@/components/landing/cta-section";
import { GridBackground } from "@/components/landing/grid-background";

export default function LandingPage() {
  return (
    <GridBackground>
      <main className="min-h-screen">
        <HeroSection />
        <ValueProps />
        <HowItWorks />
        <Testimonials />
        <FeaturesDetail />
        <CTASection />
      </main>
    </GridBackground>
  );
}