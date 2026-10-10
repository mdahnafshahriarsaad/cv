"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/shared/reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: 54, suffix: "+", label: "Professional Templates", desc: "Each with its own layout, palette, and identity" },
  { value: 12000, suffix: "+", label: "CVs Created", desc: "Trusted by professionals across 40+ countries" },
  { value: 8, suffix: "", label: "Guided Steps", desc: "From blank page to finished CV in minutes" },
  { value: 100, suffix: "%", label: "Free Forever", desc: "No sign-up, no paywall, no hidden costs" },
];

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: end,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = Math.floor(obj.val).toLocaleString() + suffix;
        },
      });
    });

    return () => ctx.revert();
  }, [end, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/**
 * GSAP-powered stats section with count-up animations.
 * Numbers animate from 0 to target when scrolled into view.
 */
export function StatsSection() {
  return (
    <section className="relative bg-[#212121] text-white overflow-hidden">
      <div className="absolute inset-0 red-ambient opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <Reveal className="max-w-2xl mb-16">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            By the Numbers
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Built for professionals who value their time.
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="group">
              <div className="relative">
                {/* accent line */}
                <div className="h-0.5 w-10 bg-nirvash-red mb-4 origin-left transition-transform duration-500 group-hover:scale-x-150" />
                <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white tabular-nums">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <h3 className="mt-3 text-[14px] font-bold text-white/90">{s.label}</h3>
                <p className="mt-1 text-[12px] text-white/45 leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
