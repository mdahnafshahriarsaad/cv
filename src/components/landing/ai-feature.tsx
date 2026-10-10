"use client";

import { Reveal } from "@/components/shared/reveal";
import { BrandButton } from "@/components/shared/brand-button";
import { useAppStore } from "@/lib/store/app-store";
import { Sparkles, FileText, Briefcase, Wrench, ScanLine, Check, RefreshCw } from "lucide-react";

const CAPS = [
  { icon: Sparkles, label: "Improve Your Summary" },
  { icon: Briefcase, label: "Write Better Experience Bullet Points" },
  { icon: Wrench, label: "Suggest Relevant Skills" },
  { icon: ScanLine, label: "Analyze Your CV" },
];

export function AIFeature() {
  const setView = useAppStore((s) => s.setView);
  const startCreate = () => {
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <section className="relative bg-[#212121] text-white overflow-hidden">
      <div className="absolute inset-0 red-ambient-strong opacity-80" />
      <div className="absolute top-1/3 -left-32 size-96 rounded-full bg-nirvash-red/10 blur-3xl ambient-pulse" />
      <div className="absolute bottom-1/4 -right-24 size-80 rounded-full bg-nirvash-ruby/10 blur-3xl ambient-pulse" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy + capabilities */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-nirvash-red/30 bg-nirvash-red/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-nirvash-red">
                <Sparkles className="size-3" /> Powered by Nirvash AI
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
                A Little Help.
                <br />
                <span className="text-nirvash-red">A Much Better CV.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-white/55 text-base leading-relaxed max-w-md">
                Nirvash AI is woven into the editor — improving your words,
                suggesting skills, and analyzing your CV as you write.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <ul className="mt-8 space-y-3">
                {CAPS.map((c) => (
                  <li key={c.label} className="flex items-center gap-3.5">
                    <span className="size-9 rounded-[10px] border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                      <c.icon className="size-4 text-nirvash-red" />
                    </span>
                    <span className="text-[15px] text-white/85 font-medium">{c.label}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Right: AI interaction preview */}
          <Reveal delay={0.2}>
            <div className="relative rounded-[14px] border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="size-7 rounded-lg bg-nirvash-red/20 border border-nirvash-red/40 flex items-center justify-center">
                    <Sparkles className="size-3.5 text-nirvash-red" />
                  </span>
                  <span className="text-sm font-semibold text-white/90">Nirvash AI</span>
                </div>
                <span className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                  Suggestion
                </span>
              </div>

              {/* user text */}
              <div className="mb-4">
                <div className="text-[10px] font-semibold tracking-wide text-white/40 uppercase mb-1.5">
                  Your text
                </div>
                <div className="rounded-lg rounded-tl-none border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/70 leading-relaxed">
                  I worked on websites and fixed bugs.
                </div>
              </div>

              {/* arrow */}
              <div className="flex justify-center my-2">
                <RefreshCw className="size-4 text-nirvash-red/60" />
              </div>

              {/* suggestion */}
              <div>
                <div className="text-[10px] font-semibold tracking-wide text-nirvash-red uppercase mb-1.5">
                  Nirvash AI suggestion
                </div>
                <div className="rounded-lg rounded-tl-none border border-nirvash-red/30 bg-nirvash-red/8 px-4 py-3 text-[13px] text-white leading-relaxed">
                  Developed and maintained responsive web components while
                  identifying and resolving issues to improve overall product
                  reliability.
                </div>
              </div>

              {/* actions */}
              <div className="mt-5 flex gap-2.5">
                <BrandButton variant="primary" size="sm">
                  <Check className="size-3.5" /> Use Suggestion
                </BrandButton>
                <BrandButton variant="secondary" size="sm">
                  <RefreshCw className="size-3.5" /> Try Again
                </BrandButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
