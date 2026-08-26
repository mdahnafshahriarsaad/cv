"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/shared/reveal";

const STEPS = [
  {
    n: "01",
    title: "Tell Us About Yourself",
    desc: "Answer simple questions or fill out your information.",
  },
  {
    n: "02",
    title: "Choose Your Style",
    desc: "Select a beautiful template and customize the design.",
  },
  {
    n: "03",
    title: "Download Your CV",
    desc: "Review your CV and download it when you're ready.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative bg-[#212121] text-white overflow-hidden">
      <div className="absolute inset-0 red-ambient opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <Reveal className="max-w-2xl">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Creating a CV shouldn't be difficult.
          </h2>
          <p className="mt-4 text-white/55 text-base sm:text-lg">
            Three simple steps. One professional result.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid md:grid-cols-3 gap-5 lg:gap-7">
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <div className="group relative h-full rounded-[12px] border border-white/8 bg-white/[0.02] p-7 sm:p-8 transition-all hover:border-nirvash-red/30 hover:bg-white/[0.04]">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl sm:text-6xl font-extrabold text-white/8 group-hover:text-nirvash-red/25 transition-colors tracking-tight">
                    {s.n}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-nirvash-red/40 to-transparent" />
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-sm text-white/55 leading-relaxed">{s.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
