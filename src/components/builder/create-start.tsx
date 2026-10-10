"use client";

import { Reveal } from "@/components/shared/reveal";
import { BrandButton } from "@/components/shared/brand-button";
import { NirvashBrand, LogoIcon } from "@/components/brand/logo";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Sparkles, FileText, MessageSquareText, Check } from "lucide-react";

export function CreateStartPage() {
  const setView = useAppStore((s) => s.setView);
  const setBuilderMethod = useAppStore((s) => s.setBuilderMethod);
  const newCV = useCVStore((s) => s.newCV);
  const docs = useCVStore((s) => s.docs);
  const loadCV = useCVStore((s) => s.loadCV);

  const goHome = () => {
    setView("landing");
    window.scrollTo({ top: 0 });
  };

  const startGuided = () => {
    newCV();
    setBuilderMethod("guided");
    setView("guided-builder");
    window.scrollTo({ top: 0 });
  };

  const startForm = () => {
    newCV();
    setBuilderMethod("form");
    setView("form-builder");
    window.scrollTo({ top: 0 });
  };

  const openCV = (id: string) => {
    loadCV(id);
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#212121] text-white flex flex-col">
      <div className="absolute inset-0 red-ambient opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-nirvash-red/8 blur-3xl" />

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="size-4" /> Home
          </button>
          <NirvashBrand variant="dark" size="sm" showSub={false} />
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
        <div className="w-full max-w-5xl">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
              Create Your CV
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05] max-w-2xl mx-auto">
              How would you like to create your CV?
            </h1>
            <p className="mt-4 text-white/55 text-base max-w-xl mx-auto leading-relaxed">
              Choose the method that feels most comfortable. You can create a
              professional CV either way.
            </p>
          </Reveal>

          <div className="mt-12 grid lg:grid-cols-2 gap-5 lg:gap-7">
            {/* Guide Me */}
            <Reveal>
              <div
                onClick={startGuided}
                className="group relative w-full text-left rounded-[14px] bg-white/[0.03] border border-white/10 p-8 sm:p-10 overflow-hidden transition-all hover:border-nirvash-red/40 hover:bg-white/[0.05] cursor-pointer"
              >
                <div className="absolute -right-16 -top-16 size-48 rounded-full bg-nirvash-red/10 blur-3xl group-hover:bg-nirvash-red/20 transition-colors" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-nirvash-red/15 border border-nirvash-red/30 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase text-nirvash-red">
                      <Sparkles className="size-3" /> Recommended
                    </span>
                  </div>

                  <div className="mt-6 flex items-start gap-4">
                    <span className="size-12 rounded-[12px] bg-nirvash-red/15 border border-nirvash-red/30 flex items-center justify-center shrink-0">
                      <MessageSquareText className="size-6 text-nirvash-red" />
                    </span>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Guide Me
                      </h2>
                      <p className="mt-2 text-sm text-white/55 leading-relaxed">
                        Answer simple questions step by step. We'll guide you
                        through everything you need for a professional CV.
                      </p>
                    </div>
                  </div>

                  {/* step dots preview */}
                  <div className="mt-7 flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === 0 ? "w-6 bg-nirvash-red" : "w-1.5 bg-white/15"
                        )}
                      />
                    ))}
                    <span className="ml-2 text-[11px] text-white/40 font-medium">8 steps</span>
                  </div>

                  <div className="mt-8">
                    <BrandButton variant="primary" size="lg" className="w-full sm:w-auto">
                      Start Guided <ArrowRight className="size-4" />
                    </BrandButton>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Fill It Myself */}
            <Reveal delay={0.1}>
              <div
                onClick={startForm}
                className="group relative w-full text-left rounded-[14px] bg-[#F5F5F5] text-[#212121] p-8 sm:p-10 overflow-hidden border border-black/5 transition-all hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute -right-16 -bottom-16 size-48 rounded-full bg-nirvash-red/8 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#212121]/40">
                      Full Control
                    </span>
                  </div>

                  <div className="mt-6 flex items-start gap-4">
                    <span className="size-12 rounded-[12px] bg-[#212121]/5 border border-black/8 flex items-center justify-center shrink-0">
                      <FileText className="size-6 text-nirvash-red" />
                    </span>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        I'll Fill It Myself
                      </h2>
                      <p className="mt-2 text-sm text-[#6b6b6b] leading-relaxed">
                        Prefer full control? Fill out your information directly
                        and build your CV at your own pace.
                      </p>
                    </div>
                  </div>

                  {/* form preview */}
                  <div className="mt-7 space-y-2 max-w-xs">
                    <div className="h-9 rounded-[8px] bg-white border border-black/8 flex items-center px-3">
                      <span className="text-[11px] text-[#9a9a9a]">Full Name</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-9 rounded-[8px] bg-white border border-black/8" />
                      <div className="h-9 rounded-[8px] bg-white border border-black/8" />
                    </div>
                  </div>

                  <div className="mt-8">
                    <BrandButton variant="light" size="lg" className="w-full sm:w-auto">
                      Open CV Form <ArrowRight className="size-4" />
                    </BrandButton>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Saved CVs / empty state */}
          <Reveal delay={0.15} className="mt-14">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold tracking-[0.16em] text-white/45 uppercase">
                {docs.length > 0 ? "Continue Working" : "Your CVs"}
              </h2>
              {docs.length > 0 && (
                <span className="text-[12px] text-white/35">{docs.length} saved</span>
              )}
            </div>

            {docs.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-white/12 bg-white/[0.015] px-6 py-10 text-center">
                <LogoIcon barColor="rgba(255,255,255,0.25)" className="size-10 mx-auto" />
                <h3 className="mt-4 text-lg font-bold tracking-tight text-white">Your first CV starts here.</h3>
                <p className="mt-1.5 text-[13px] text-white/45 max-w-xs mx-auto">
                  It only takes a few minutes to get started. Pick a method above.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {docs
                  .slice()
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .slice(0, 6)
                  .map((d) => (
                    <button
                      key={d.id}
                      onClick={() => openCV(d.id)}
                      className="group text-left rounded-[12px] border border-white/10 bg-white/[0.03] hover:border-nirvash-red/40 hover:bg-white/[0.05] transition-all p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-white truncate">{d.name || "Untitled CV"}</p>
                          <p className="text-[12px] text-white/45 truncate mt-0.5">
                            {d.personalInfo.professionalTitle || d.personalInfo.fullName || "No details yet"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-nirvash-red bg-nirvash-red/10 border border-nirvash-red/25 rounded px-1.5 py-0.5 uppercase shrink-0">
                          {d.design.templateId}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/35 mt-3">
                        Updated {new Date(d.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </button>
                  ))}
              </div>
            )}
          </Reveal>

          {/* reassurance row */}
          <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-white/40">
            <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-nirvash-red" /> No sign-up required</span>
            <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-nirvash-red" /> Auto-saves as you go</span>
            <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-nirvash-red" /> Switch methods anytime</span>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
