"use client";

import { Reveal } from "@/components/shared/reveal";
import { MagneticCTA, MagneticButton } from "@/components/shared/magnetic-button";
import { useAppStore } from "@/lib/store/app-store";
import { MessageSquareText, FileText, Sparkles } from "lucide-react";

export function TwoMethods() {
  const setView = useAppStore((s) => s.setView);
  const setBuilderMethod = useAppStore((s) => s.setBuilderMethod);

  const startGuided = () => {
    setBuilderMethod("guided");
    setView("create-start");
    window.scrollTo({ top: 0 });
  };
  const startForm = () => {
    setBuilderMethod("form");
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <section id="features" className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <Reveal className="max-w-2xl">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            Two Ways to Create
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#212121] leading-[1.05]">
            Create your CV your way.
          </h2>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-2 gap-5 lg:gap-7 items-stretch">
          {/* OPTION 01 — Guided (dark, recommended) */}
          <Reveal>
            <div className="relative h-full rounded-[14px] bg-[#212121] text-white p-8 sm:p-10 overflow-hidden group">
              <div className="absolute inset-0 red-ambient opacity-70" />
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-nirvash-red/10 blur-3xl ambient-pulse" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-nirvash-red/15 border border-nirvash-red/30 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase text-nirvash-red">
                    <Sparkles className="size-3" /> Recommended
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-white/40 uppercase">
                    Guided Experience
                  </span>
                </div>

                <h3 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Answer Simple Questions
                </h3>
                <p className="mt-3 text-white/55 text-sm sm:text-base leading-relaxed max-w-md">
                  We'll guide you step by step and turn your answers into a
                  professional CV.
                </p>

                {/* mini conversation preview */}
                <div className="mt-7 space-y-2.5 max-w-sm">
                  <div className="flex items-start gap-2.5">
                    <div className="size-7 rounded-full bg-nirvash-red/20 border border-nirvash-red/40 flex items-center justify-center shrink-0">
                      <MessageSquareText className="size-3.5 text-nirvash-red" />
                    </div>
                    <div className="rounded-lg rounded-tl-none bg-white/8 border border-white/10 px-3.5 py-2 text-[13px] text-white/85">
                      Let's start with your name and title.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="rounded-lg rounded-tr-none bg-nirvash-red/90 px-3.5 py-2 text-[13px] text-white">
                      Alex Johnson · Frontend Developer
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <MagneticCTA variant="primary" size="lg" onClick={startGuided}>
                    Start Guided
                  </MagneticCTA>
                </div>
              </div>
            </div>
          </Reveal>

          {/* OPTION 02 — Form (light) */}
          <Reveal delay={0.1}>
            <div className="relative h-full rounded-[14px] bg-white text-[#212121] p-8 sm:p-10 overflow-hidden border border-black/5 group">
              <div className="absolute -right-16 -bottom-16 size-56 rounded-full bg-nirvash-red/5 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-[#212121]/40 uppercase">
                    Full Control
                  </span>
                </div>

                <h3 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Fill Out a Form
                </h3>
                <p className="mt-3 text-[#6b6b6b] text-sm sm:text-base leading-relaxed max-w-md">
                  Prefer to manage everything yourself? Add your information
                  directly and build your CV your way.
                </p>

                {/* mini form preview */}
                <div className="mt-7 space-y-2.5 max-w-sm">
                  <div className="flex items-center gap-2.5 rounded-lg border border-black/8 bg-[#F5F5F5] px-3.5 py-2.5">
                    <FileText className="size-4 text-nirvash-red shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-[#9a9a9a] uppercase tracking-wide">Full Name</div>
                      <div className="text-[13px] text-[#212121]">Alex Johnson</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-lg border border-black/8 bg-[#F5F5F5] px-3.5 py-2.5">
                      <div className="text-[10px] font-semibold text-[#9a9a9a] uppercase tracking-wide">Email</div>
                      <div className="text-[12px] text-[#212121] truncate">alex@email.com</div>
                    </div>
                    <div className="rounded-lg border border-black/8 bg-[#F5F5F5] px-3.5 py-2.5">
                      <div className="text-[10px] font-semibold text-[#9a9a9a] uppercase tracking-wide">Phone</div>
                      <div className="text-[12px] text-[#212121] truncate">+1 555 248</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <MagneticButton variant="light" size="lg" onClick={startForm}>
                    Open Form
                  </MagneticButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
