"use client";

import * as React from "react";
import { Reveal } from "@/components/shared/reveal";
import { BrandButton, ButtonArrow } from "@/components/shared/brand-button";
import { CVPreview } from "@/components/templates/cv-preview";
import { createSampleCV } from "@/lib/cv-data/types";
import { TEMPLATES, getTemplate } from "@/components/templates/registry";
import { useAppStore } from "@/lib/store/app-store";

// showcase a diverse set: Vertex (modern, large), Apex (minimal), Crimson (bold)
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <Reveal className="max-w-2xl">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            {TEMPLATES.length} Professional Templates
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#212121] leading-[1.05]">
            Designed to Make You Stand Out.
          </h2>
          <p className="mt-4 text-[#6b6b6b] text-base sm:text-lg leading-relaxed max-w-[65ch]">
            Choose from professional, modern, minimal, creative, tech, editorial,
            and bold CV templates — each with its own identity.
          </p>
        </Reveal>

        {/* Asymmetric bento grid — NOT 3 equal columns */}
        <div className="mt-16 grid md:grid-cols-5 gap-4 lg:gap-6">
          {/* Large featured template (Vertex) — spans 3 columns */}
          <Reveal className="md:col-span-3 md:row-span-2">
            <button
              onClick={browse}
              className="group relative block w-full h-full text-left rounded-[16px] overflow-hidden border border-black/8 bg-[#F5F5F5] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-nirvash-red/30 hover:shadow-[0_20px_40px_-15px_rgba(33,33,33,0.15)] hover:-translate-y-1"
            >
              <div className="relative overflow-hidden bg-[#F5F5F5] flex items-center justify-center py-8 h-[440px]">
                <div className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
                  <CVPreview cv={(() => { const c = createSampleCV(featured[0].photoShape !== "none"); c.design.templateId = featured[0].id; return c; })()} scale={0.48} showShadow={false} />
                </div>
                <div className="absolute inset-0 bg-[#212121]/0 group-hover:bg-[#212121]/30 transition-all duration-500 flex items-center justify-center pointer-events-none">
                  <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] inline-flex items-center gap-2 rounded-[10px] bg-nirvash-red px-5 py-2.5 text-sm font-semibold text-white">
                    Use Template
                  </span>
                </div>
                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-nirvash-red scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
              <div className="p-5 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-[#212121]">{featured[0].name}</h3>
                  <p className="text-xs text-[#6b6b6b] mt-0.5">{featured[0].collection}</p>
                </div>
                {featured[0].badges?.[0] && (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-nirvash-red border border-nirvash-red/30 rounded-full px-2 py-0.5">
                    {featured[0].badges[0]}
                  </span>
                )}
              </div>
            </button>
          </Reveal>

          {/* Two smaller templates stacked — each spans 2 columns */}
          {featured.slice(1).map((t, i) => {
            const cv = createSampleCV(t.photoShape !== "none");
            cv.design.templateId = t.id;
            return (
              <Reveal key={t.id} delay={0.1 + i * 0.1} className="md:col-span-2">
                <button
                  onClick={browse}
                  className="group relative block w-full text-left rounded-[16px] overflow-hidden border border-black/8 bg-[#F5F5F5] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-nirvash-red/30 hover:shadow-[0_20px_40px_-15px_rgba(33,33,33,0.15)] hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden bg-[#F5F5F5] flex items-center justify-center py-4 h-[208px]">
                    <div className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
                      <CVPreview cv={cv} scale={0.22} showShadow={false} />
                    </div>
                    <div className="absolute inset-0 bg-[#212121]/0 group-hover:bg-[#212121]/30 transition-all duration-500 flex items-center justify-center pointer-events-none">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] inline-flex items-center gap-2 rounded-[10px] bg-nirvash-red px-4 py-2 text-[13px] font-semibold text-white">
                        Use Template
                      </span>
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-nirvash-red scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                  <div className="p-4 flex items-center justify-between bg-white">
                    <div>
                      <h3 className="text-[15px] font-extrabold tracking-tight text-[#212121]">{t.name}</h3>
                      <p className="text-[11px] text-[#6b6b6b] mt-0.5">{t.collection}</p>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-14 flex justify-center" delay={0.2}>
          <BrandButton variant="secondaryLight" size="lg" onClick={browse} className="group">
            Explore All Templates <ButtonArrow />
          </BrandButton>
        </Reveal>
      </div>
    </section>
  );
}
