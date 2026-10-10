"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Reveal } from "@/components/shared/reveal";

const STEPS = [
  { n: "01", title: "Tell Us About Yourself", desc: "Answer simple questions or fill out your information." },
  { n: "02", title: "Choose Your Style", desc: "Select a beautiful template and customize the design." },
  { n: "03", title: "Download Your CV", desc: "Review your CV and download it when you're ready." },
];

export function HowItWorks() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how" className="relative bg-[#212121] text-white overflow-hidden">
      <div className="absolute inset-0 red-ambient opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <Reveal className="max-w-2xl">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Creating a CV should be simple.
          </h2>
          <p className="mt-4 text-white/55 text-base sm:text-lg">
            Three steps. One professional result.
          </p>
        </Reveal>

        {/* Horizontal timeline */}
        <div ref={ref} className="mt-16 relative">
          <div className="grid md:grid-cols-3 gap-10 md:gap-6 relative">
            {/* connecting line (desktop) */}
            <div className="hidden md:block absolute top-[34px] left-[16%] right-[16%] h-px">
              <motion.div
                className="h-full bg-gradient-to-r from-nirvash-red/60 via-nirvash-red/40 to-transparent origin-left"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>

            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-start"
              >
                {/* dot + number row */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="relative size-3 rounded-full bg-nirvash-red ring-4 ring-nirvash-red/15">
                    <span className="absolute inset-0 rounded-full bg-nirvash-red animate-ping opacity-30" />
                  </span>
                  <span className="text-[44px] sm:text-[56px] font-extrabold tracking-tight text-white/8 leading-none">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-sm sm:text-[15px] text-white/55 leading-relaxed max-w-xs">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
