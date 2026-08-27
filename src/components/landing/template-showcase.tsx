"use client";

import * as React from "react";
import { Reveal } from "@/components/shared/reveal";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { createSampleCV } from "@/lib/cv-data/types";
import { TEMPLATES, getTemplate } from "@/components/templates/registry";
import { useAppStore } from "@/lib/store/app-store";
import { ArrowRight } from "lucide-react";

// showcase a diverse set: Vertex (modern), Apex (minimal), Crimson (bold)
const featured = ["vertex", "apex", "crimson"].map((id) => getTemplate(id));

export function TemplateShowcase() {
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);

  const browse = () => {
    setTemplatesOrigin("flow");
    setView("templates");
    window.scrollTo({ top: 0 });
  };

  return (
    <section id="templates-showcase" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <Reveal className="max-w-2xl">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            {TEMPLATES.length} Professional Templates
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#212121] leading-[1.05]">
            Designed to Make You Stand Out.
          </h2>
          <p className="mt-4 text-[#6b6b6b] text-base sm:text-lg">
            Choose from professional, modern, minimal, creative, tech, editorial,
            and bold CV templates — each with its own identity.
          </p>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-5 lg:gap-7">
          {featured.map((t, i) => {
            const cv = createSampleCV();
            cv.design.templateId = t.id;
            return (
              <Reveal key={t.id} delay={i * 0.1}>
                <button
                  onClick={browse}
                  className="group relative block w-full text-left rounded-[14px] overflow-hidden border border-black/8 bg-[#F5F5F5] transition-all hover:border-nirvash-red/30 hover:shadow-xl"
                >
                  {/* preview */}
                  <div className="relative overflow-hidden bg-[#F5F5F5] flex items-center justify-center" style={{ height: 420 }}>
                    <div className="origin-top transition-transform duration-500 group-hover:scale-105" style={{ transform: "scale(0.42)" }}>
                      <CVRenderer cv={cv} width={794} showShadow={false} />
                    </div>
                    {/* hover overlay */}
                    <div className="absolute inset-0 bg-[#212121]/0 group-hover:bg-[#212121]/35 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-2 rounded-[10px] bg-nirvash-red px-5 py-2.5 text-sm font-semibold text-white">
                        Use Template <ArrowRight className="size-4" />
                      </span>
                    </div>
                    {/* red accent line */}
                    <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-nirvash-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>
                  {/* meta */}
                  <div className="p-5 flex items-center justify-between bg-white">
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-[#212121]">
                        {t.name}
                      </h3>
                      <p className="text-xs text-[#6b6b6b] mt-0.5">{t.collection}</p>
                    </div>
                    {t.badges?.[0] && (
                      <span className="text-[10px] font-bold tracking-wide uppercase text-nirvash-red border border-nirvash-red/30 rounded-full px-2 py-0.5">
                        {t.badges[0]}
                      </span>
                    )}
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-12 flex justify-center" delay={0.2}>
          <BrandButton variant="secondaryLight" size="lg" onClick={browse}>
            Explore All Templates <ArrowRight className="size-4" />
          </BrandButton>
        </Reveal>
      </div>
    </section>
  );
}
