"use client";

import { Reveal } from "@/components/shared/reveal";
import { MousePointerClick, Palette, Eye, Sparkles } from "lucide-react";

const ITEMS = [
  {
    icon: MousePointerClick,
    title: "Easy to Use",
    desc: "Create your CV step by step.",
  },
  {
    icon: Palette,
    title: "Beautiful Templates",
    desc: "Choose from multiple professional designs.",
  },
  {
    icon: Eye,
    title: "Live Preview",
    desc: "See your CV update instantly.",
  },
  {
    icon: Sparkles,
    title: "AI Assistance",
    desc: "Get help improving your content.",
  },
];

export function TrustStrip() {
  return (
    <section className="bg-[#F5F5F5] border-y border-black/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.08} className="flex items-start gap-3.5">
              <div className="shrink-0 size-10 rounded-[10px] bg-white border border-black/5 flex items-center justify-center shadow-sm">
                <it.icon className="size-5 text-nirvash-red" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#212121]">{it.title}</h3>
                <p className="text-xs text-[#6b6b6b] mt-0.5 leading-relaxed">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
