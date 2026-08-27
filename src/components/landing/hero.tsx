"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer } from "@/components/templates/cv-renderer";
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
  const yFront = useTransform(scrollY, [0, 600], [0, 20]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // mouse parallax for CV stack
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 20 });
  const translateX = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 20 });
  const translateY = useSpring(useTransform(my, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { mx.set(0); my.set(0); };

  const startCreate = () => {
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <section id="home" ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-[#212121]">
      {/* Layer 1: background video — 6px blur, visible */}
      <motion.video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay muted loop playsInline preload="auto"
        style={{ filter: "blur(6px)", y: yBack }}
        aria-hidden="true"
      >
        <source src="/hero-video/background.mp4" type="video/mp4" />
      </motion.video>

      {/* Layer 2: lighter dark overlay so video stays visible */}
      <div className="absolute inset-0 bg-[#212121]/45" />
      {/* Layer 3: subtle red gradient atmosphere */}
      <div className="absolute inset-0 hero-atmosphere" />

      {/* Layer 4: content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
          {/* Left content — layered entrance */}
          <motion.div style={{ y: yMid, opacity }}>
            {/* badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm"
            >
              <span className="size-1.5 rounded-full bg-nirvash-red animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                Nirvash CV Maker
              </span>
            </motion.div>

            {/* Headline lines */}
            <h1 className="mt-6 text-white font-extrabold tracking-tight leading-[0.98] text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {["Your Story", "Deserves"].map((line, i) => (
                <motion.span
                  key={line}
                  className="block"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.span>
              ))}
              <motion.span
                className="block text-nirvash-red"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                A Better CV.
              </motion.span>
            </h1>

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-6 text-base sm:text-lg text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Create a professional CV without struggling with complicated forms, layouts, or design. Nirvash makes the process simple, guided, and effortless.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <BrandButton variant="primary" size="xl" onClick={startCreate} className="group">
                Create My CV
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="xl"
                onClick={() => document.getElementById("templates-showcase")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Templates
              </BrandButton>
            </motion.div>
          </motion.div>

          {/* Right: floating CV preview stack with mouse parallax */}
          <motion.div
            style={{ y: yFront, opacity }}
            className="hidden lg:flex justify-center"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 1200 }}
              className="relative"
            >
              <motion.div style={{ rotateX, rotateY, translateX, translateY, transformStyle: "preserve-3d" }}>
                <div className="relative" style={{ width: 420, height: 560 }}>
                  {/* back pages */}
                  <motion.div
                    className="absolute paper-shadow-sm bg-white rounded-md"
                    style={{ width: 360, height: 480, top: 50, left: 70, rotate: "6deg", opacity: 0.4, transform: "translateZ(-40px)" }}
                  />
                  <motion.div
                    className="absolute paper-shadow-sm bg-white rounded-md"
                    style={{ width: 360, height: 480, top: 35, left: 55, rotate: "-4deg", opacity: 0.6, transform: "translateZ(-20px)" }}
                  />
                  {/* main CV */}
                  <motion.div
                    className="absolute float-y-slow"
                    style={{ top: 0, left: 10, transform: "translateZ(0px)" }}
                  >
                    <div className="origin-top-left" style={{ transform: "scale(0.48)" }}>
                      <CVRenderer cv={sampleCV} width={794} showShadow />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
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
