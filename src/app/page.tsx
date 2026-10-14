import type { Metadata } from "next";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustStats } from "@/components/landing/trust-stats";
import { Features } from "@/components/landing/features";
import { AiPreview } from "@/components/landing/ai-preview";
import { TimelinePreview } from "@/components/landing/timeline-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials, Faq } from "@/components/landing/social-proof";
import { FinalCta, Footer } from "@/components/landing/final-cta";

export const metadata: Metadata = {
  title: "LifeLedger — India's AI Personal Health Intelligence Platform",
  description:
    "Store lab reports and prescriptions securely, get plain-language AI health summaries, track a health timeline, and find hospitals and doctors near you.",
  openGraph: {
    title: "LifeLedger — India's AI Personal Health Intelligence Platform",
    description:
      "A private health vault for Indian families: encrypted records, AI report analysis, health timeline and nearby healthcare discovery.",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main id="main-content">
        <Hero />
        <TrustStats />
        <Features />
        <AiPreview />
        <TimelinePreview />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
