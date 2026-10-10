"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MagneticButton, MagneticCTA } from "@/components/shared/magnetic-button";
import { HeroCVStack } from "@/components/landing/hero-cv-stack";
import { createSampleCV } from "@/lib/cv-data/types";
import { useAppStore } from "@/lib/store/app-store";

const sampleCV = createSampleCV();

export function Hero() {
  const setView = useAppStore((s) => s.setView);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // parallax on scroll
  const { scrollY } = useScroll();
  const yBack = useTransform(scrollY, [0, 600], [0, 80]);
  const yMid = useTransform(scrollY, [0, 600], [0, 50]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const startCreate = () => {
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <section id="home" ref={containerRef} className="relative min-h-[100dvh] w-full overflow-hidden bg-[#212121]">
      {/* Layer 1: background video — 6px blur, desaturated so it's atmospheric not loud */}
      <motion.video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay muted loop playsInline preload="auto"
        style={{ filter: "blur(6px) saturate(0.55) brightness(0.7)", y: yBack }}
        aria-hidden="true"
      >
        <source src="/hero-video/background.mp4" type="video/mp4" />
      </motion.video>

      {/* Layer 2: dark overlay for text contrast */}
      <div className="absolute inset-0 bg-[#212121]/55" />
      {/* Layer 3: subtle red gradient atmosphere */}
      <div className="absolute inset-0 hero-atmosphere" />
      {/* Layer 3b: radial darkening behind left text block for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 25% 50%, rgba(10,10,10,0.55) 0%, transparent 65%)",
        }}
      />
      {/* Layer 3c: subtle dot grid pattern for sophistication */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Layer 4: content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
          {/* Left content — layered entrance */}
          <motion.div style={{ y: yMid, opacity }}>
            {/* eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-md"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-nirvash-red opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full size-1.5 bg-nirvash-red" />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/75 uppercase">
                Nirvash CV Maker
              </span>
            </motion.div>

            {/* Headline lines */}
            <h1 className="mt-6 text-white font-extrabold tracking-tight leading-[0.98] text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem]">
              {["Your Story", "Deserves"].map((line, i) => (
                <motion.span
                  key={line}
                  className="block"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.span>
              ))}
              <motion.span
                className="block text-nirvash-red"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                A Better CV.
              </motion.span>
            </h1>

            {/* Animated red accent line beneath headline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 h-[3px] w-16 rounded-full bg-nirvash-red origin-left"
            />

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Create a professional CV without struggling with complicated forms, layouts, or design. Nirvash makes the process simple, guided, and effortless.
            </motion.p>

            {/* Buttons — magnetic CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <MagneticCTA variant="primary" size="xl" onClick={startCreate}>
                Create My CV
              </MagneticCTA>
              <MagneticButton
                variant="secondary"
                size="xl"
                onClick={() => document.getElementById("templates-showcase")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Templates
              </MagneticButton>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex items-center gap-3 justify-center lg:justify-start"
            >
              {/* avatar stack */}
              <div className="flex -space-x-2">
                {["#FF4336", "#B71C1C", "#212121", "#475569"].map((c, i) => (
                  <div
                    key={i}
                    className="size-7 rounded-full border-2 border-[#212121] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: c }}
                  >
                    {["A", "M", "J", "S"][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-[12px] font-semibold text-white/85">Loved by 12,000+ professionals</p>
                <p className="text-[11px] text-white/45">54 templates · Free forever · No sign-up</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: animated CV preview stack */}
          <HeroCVStack cv={sampleCV} />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div style={{ opacity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.25em] text-white/45 uppercase">
          Scroll to Explore
        </span>
        <div className="relative h-10 w-px bg-white/15 overflow-hidden">
          <div className="absolute inset-0 bg-nirvash-red scroll-line-anim" />
        </div>
        <ChevronDown className="size-3.5 text-white/40 -mt-1" />
      </motion.div>
    </section>
  );
}
