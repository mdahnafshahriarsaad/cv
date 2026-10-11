"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CVPreview } from "@/components/templates/cv-preview";
import { TEMPLATES, getTemplate } from "@/components/templates/registry";
import { createSampleCV } from "@/lib/cv-data/types";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore } from "@/lib/store/cv-store";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

// 8 diverse templates for the 3D carousel
const SLIDER_IDS = [
  "vertex", "apex", "crimson", "executive",
  "canvas", "nova", "timeline", "orbit",
];

/**
 * 3D perspective CV carousel.
 * Center card is full-frontal and largest; side cards are rotated on Y-axis
 * creating a fanned-out 3D effect (like the Noa Vale reference).
 * Auto-advances continuously. Click any card to use that template.
 */
export function CVSliderSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);
  const loadSample = useCVStore((s) => s.loadSample);
  const setTemplate = useCVStore((s) => s.setTemplate);

  const templates = SLIDER_IDS.map(getTemplate);

  // Auto-advance every 3.5s, pause on hover
  React.useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % templates.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, templates.length]);

  const selectTemplate = (templateId: string) => {
    loadSample();
    setTemplate(templateId);
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const browseAll = () => {
    setTemplatesOrigin("flow");
    setView("templates");
    window.scrollTo({ top: 0 });
  };

  // Calculate position for each card relative to active
  const getCardStyle = (index: number) => {
    const total = templates.length;
    let offset = index - activeIndex;
    // Normalize for wrapping
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);

    // Only show cards within range
    if (absOffset > 2) return { display: "none" as const };

    // 3D perspective transform
    const rotateY = offset * -35; // degrees
    const translateX = offset * 55; // percentage
    const translateZ = -absOffset * 120; // px (push back)
    const scale = 1 - absOffset * 0.15;
    const opacity = 1 - absOffset * 0.3;
    const zIndex = 10 - absOffset;

    return {
      transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      filter: absOffset > 0 ? `blur(${absOffset * 1.5}px)` : "none",
      transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
    };
  };

  return (
    <section className="relative bg-[#212121] text-white overflow-hidden">
      <div className="absolute inset-0 red-ambient opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            Template Gallery
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Explore real CV designs.
          </h2>
          <p className="mt-4 text-white/55 text-base sm:text-lg leading-relaxed">
            Every template works with your photo and information. Click any card to start.
          </p>
        </Reveal>

        {/* 3D Carousel */}
        <div
          className="relative h-[520px] flex items-center justify-center"
          style={{ perspective: "1400px" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cards */}
          <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {templates.map((t, i) => {
              const cv = createSampleCV();
              cv.design.templateId = t.id;
              const isActive = i === activeIndex;
              return (
                <div
                  key={t.id}
                  className="absolute"
                  style={{
                    ...getCardStyle(i),
                    transformStyle: "preserve-3d",
                  }}
                  onClick={() => {
                    if (isActive) {
                      selectTemplate(t.id);
                    } else {
                      setActiveIndex(i);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "relative rounded-[16px] overflow-hidden border bg-[#1a1a1a] cursor-pointer",
                      isActive
                        ? "border-nirvash-red/40 shadow-[0_25px_60px_-15px_rgba(255,67,54,0.3)]"
                        : "border-white/8 hover:border-white/20"
                    )}
                    style={{ width: 300 }}
                  >
                    {/* CV preview */}
                    <div className="flex items-center justify-center py-6 h-[400px] overflow-hidden">
                      <CVPreview cv={cv} scale={0.37} showShadow={false} />
                    </div>
                    {/* footer */}
                    <div className="p-4 flex items-center justify-between bg-white/[0.02] border-t border-white/5">
                      <div>
                        <h3 className="text-[14px] font-bold tracking-tight">{t.name}</h3>
                        <p className="text-[11px] text-white/40">{t.collection}</p>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-bold tracking-wide uppercase text-nirvash-red bg-nirvash-red/10 border border-nirvash-red/30 rounded-full px-2 py-0.5">
                          Use This
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setActiveIndex((i) => (i - 1 + templates.length) % templates.length)}
            className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-md hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setActiveIndex((i) => (i + 1) % templates.length)}
            className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-md hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {templates.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === activeIndex ? "w-6 h-1.5 bg-nirvash-red" : "size-1.5 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Template ${i + 1}`}
            />
          ))}
        </div>

        {/* Browse all */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={browseAll}
            className="text-[13px] font-semibold text-white/60 hover:text-white transition-colors link-underline"
          >
            Browse all 54 templates →
          </button>
        </div>
      </div>
    </section>
  );
}
