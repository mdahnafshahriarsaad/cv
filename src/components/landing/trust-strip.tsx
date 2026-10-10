"use client";

import { Reveal } from "@/components/shared/reveal";
import { MousePointerClick, Palette, Eye, Sparkles } from "lucide-react";

const ITEMS = [
  { icon: MousePointerClick, title: "Easy to Use", desc: "Create your CV step by step." },
  { icon: Palette, title: "Beautiful Templates", desc: "Choose from multiple professional designs." },
  { icon: Eye, title: "Live Preview", desc: "See your CV update instantly." },
  { icon: Sparkles, title: "AI Assistance", desc: "Get help improving your content." },
];

export function TrustStrip() {
  return (
    <section className="bg-[#F5F5F5] border-y border-black/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.08} blur={false} className="flex items-start gap-3.5 group">
              <div className="shrink-0 size-10 rounded-[10px] bg-white border border-black/5 flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(33,33,33,0.08)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-[0_8px_20px_-4px_rgba(255,67,54,0.2)] group-hover:-translate-y-0.5">
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
