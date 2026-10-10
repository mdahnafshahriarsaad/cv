"use client";

import * as React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TwoMethods } from "@/components/landing/two-methods";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { AIFeature } from "@/components/landing/ai-feature";
import { FinalCTA } from "@/components/landing/final-cta";

export function LandingPage() {
  const onNavigate = React.useCallback((target: string) => {
    if (target === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const map: Record<string, string> = {
      how: "how",
      templates: "templates-showcase",
      features: "features",
    };
    const id = map[target] ?? target;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="bg-[#212121] min-h-[100dvh] flex flex-col grain-overlay">
      <ScrollProgress />
      <Navbar onNavigate={onNavigate} />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <TwoMethods />
        <TemplateShowcase />
        <AIFeature />
        <FinalCTA />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
