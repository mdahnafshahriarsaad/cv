"use client";

import { Reveal } from "@/components/shared/reveal";
import { BrandButton } from "@/components/shared/brand-button";
import { useAppStore } from "@/lib/store/app-store";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  const setView = useAppStore((s) => s.setView);
  const start = () => {
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <section className="relative overflow-hidden bg-[#212121]">
      {/* blurred video background */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ filter: "blur(6px)" }}
        aria-hidden="true"
      >
        <source src="/hero-video/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#212121]/55" />
      <div className="absolute inset-0 hero-atmosphere" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.02]">
            Your Next Opportunity
            <br />
            <span className="text-nirvash-red">Starts Here.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Create a CV that represents your skills, experience, and potential.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-10 flex justify-center">
          {/* ambient glow behind button */}
          <div className="relative">
            <div className="absolute inset-0 -m-8 rounded-full bg-nirvash-red/25 blur-2xl ambient-pulse" />
            <BrandButton
              variant="primary"
              size="xl"
              className="relative px-10"
              onClick={start}
            >
              Create My CV for Free <ArrowRight className="size-4" />
            </BrandButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
