"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { createSampleCV } from "@/lib/cv-data/types";
import { useAppStore } from "@/lib/store/app-store";

const sampleCV = createSampleCV();

export function Hero() {
  const setView = useAppStore((s) => s.setView);

  const startCreate = () => {
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-[#212121]">
      {/* Layer 1: background video */}
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

      {/* Layer 2: dark overlay */}
      <div className="absolute inset-0 bg-[#212121]/70" />

      {/* Layer 3: subtle red gradient */}
      <div className="absolute inset-0 hero-atmosphere" />

      {/* Layer 4: content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center lg:text-left"
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-nirvash-red animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                Nirvash CV Maker
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-white font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Your Story Deserves
              <br />
              <span className="text-nirvash-red">A Better CV.</span>
            </h1>

            {/* Supporting text */}
            <p className="mt-6 text-base sm:text-lg text-white/65 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Create a professional CV without struggling with complicated
              forms, layouts, or design. Nirvash makes the process simple,
              guided, and effortless.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <BrandButton variant="primary" size="xl" onClick={startCreate}>
                Create My CV
                <ArrowRight className="size-4" />
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="xl"
                onClick={() =>
                  document.getElementById("templates-showcase")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Templates
              </BrandButton>
            </div>
          </motion.div>

          {/* Right: floating CV preview stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto" style={{ width: 460, height: 600 }}>
              {/* Back CV pages */}
              <div
                className="absolute paper-shadow-sm bg-white rounded-md"
                style={{
                  width: 380,
                  height: 500,
                  top: 60,
                  left: 90,
                  transform: "rotate(6deg)",
                  opacity: 0.55,
                }}
              />
              <div
                className="absolute paper-shadow-sm bg-white rounded-md"
                style={{
                  width: 380,
                  height: 500,
                  top: 40,
                  left: 70,
                  transform: "rotate(-4deg)",
                  opacity: 0.75,
                }}
              />
              {/* Main CV */}
              <div
                className="absolute float-y-slow"
                style={{ top: 0, left: 20, transformOrigin: "center" }}
              >
                <div className="origin-top-left" style={{ transform: "scale(0.5)" }}>
                  <CVRenderer cv={sampleCV} width={794} showShadow />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.25em] text-white/45 uppercase">
          Scroll to Explore
        </span>
        <div className="relative h-10 w-px bg-white/15 overflow-hidden">
          <div className="absolute inset-0 bg-nirvash-red scroll-line-anim" />
        </div>
        <ChevronDown className="size-3.5 text-white/40 -mt-1" />
      </div>
    </section>
  );
}
