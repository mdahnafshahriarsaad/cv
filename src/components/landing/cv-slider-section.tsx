"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CVPreview } from "@/components/templates/cv-preview";
import { TEMPLATES, getTemplate } from "@/components/templates/registry";
import { createSampleCV } from "@/lib/cv-data/types";
import { useAppStore } from "@/lib/store/app-store";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

// Pick a diverse set of 12 templates for the slider
const SLIDER_TEMPLATE_IDS = [
  "vertex", "apex", "crimson", "executive", "canvas", "nova",
  "timeline", "prism", "stack", "launch", "journal", "orbit",
];

/**
 * Infinite CV template slider.
 * Uses Embla Carousel with loop:true for infinite scrolling.
 * Each slide shows a real CV preview with the sample photo.
 * Auto-advances every 4s, pauses on hover.
 */
export function CVSliderSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);

  const templates = SLIDER_TEMPLATE_IDS.map(getTemplate);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-advance
  React.useEffect(() => {
    if (!isPlaying || !emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, emblaApi]);

  const browse = () => {
    setTemplatesOrigin("flow");
    setView("templates");
    window.scrollTo({ top: 0 });
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
            Every template works with your photo and information. Swipe through to find your style.
          </p>
        </Reveal>

        {/* Embla viewport */}
        <div
          className="overflow-hidden"
          ref={emblaRef}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          <div className="flex gap-5" style={{ touchAction: "pan-y" }}>
            {templates.map((t, i) => {
              const cv = createSampleCV();
              cv.design.templateId = t.id;
              return (
                <div
                  key={t.id}
                  className="relative shrink-0 grow-0 basis-[280px] sm:basis-[340px]"
                >
                  <div
                    className={cn(
                      "relative rounded-[14px] overflow-hidden border bg-[#1a1a1a] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer",
                      selectedIndex === i
                        ? "border-nirvash-red/40 shadow-[0_20px_50px_-15px_rgba(255,67,54,0.25)] scale-100"
                        : "border-white/8 scale-95 opacity-70"
                    )}
                    onClick={browse}
                  >
                    {/* CV preview */}
                    <div className="flex items-center justify-center py-6 h-[420px] overflow-hidden">
                      <CVPreview cv={cv} scale={0.36} showShadow={false} />
                    </div>
                    {/* footer */}
                    <div className="p-4 flex items-center justify-between bg-white/[0.02] border-t border-white/5">
                      <div>
                        <h3 className="text-[14px] font-bold tracking-tight">{t.name}</h3>
                        <p className="text-[11px] text-white/40">{t.collection}</p>
                      </div>
                      {t.badges?.[0] && (
                        <span className="text-[9px] font-bold tracking-wide uppercase text-nirvash-red border border-nirvash-red/30 rounded-full px-1.5 py-0.5">
                          {t.badges[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="size-11 rounded-full border border-white/12 bg-white/[0.03] hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            aria-label="Previous"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* dot indicators */}
          <div className="flex items-center gap-1.5">
            {templates.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  selectedIndex === i
                    ? "w-6 h-1.5 bg-nirvash-red"
                    : "size-1.5 bg-white/20 hover:bg-white/40"
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="size-11 rounded-full border border-white/12 bg-white/[0.03] hover:bg-white/10 hover:border-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            aria-label="Next"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
