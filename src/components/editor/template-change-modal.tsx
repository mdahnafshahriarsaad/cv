"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { TEMPLATES, getTemplate } from "@/components/templates/registry";
import { useCVStore } from "@/lib/store/cv-store";
import { createSampleCV } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

export function TemplateChangeModal({ onClose }: { onClose: () => void }) {
  const cv = useCVStore((s) => s.current);
  const setTemplate = useCVStore((s) => s.setTemplate);
  const [selected, setSelected] = React.useState(cv?.design.templateId ?? "vertex");
  if (!cv) return null;

  const current = getTemplate(cv.design.templateId);
  const newT = getTemplate(selected);
  const isSame = selected === cv.design.templateId;

  const previewCV = (id: string) => {
    const base = createSampleCV();
    base.design.templateId = id;
    base.design.accentColor = cv.design.accentColor;
    return base;
  };

  const apply = () => {
    setTemplate(selected);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#212121]/90 backdrop-blur-md flex flex-col"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="m-auto w-full max-w-4xl max-h-[92vh] rounded-[14px] border border-white/10 bg-[#1f1f1f] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Try a new look.</h3>
            <p className="text-[13px] text-white/50">Your information stays exactly the same.</p>
          </div>
          <button onClick={onClose} className="size-8 rounded-[8px] hover:bg-white/10 flex items-center justify-center text-white/60" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {/* body: current vs new */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* current */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Current</p>
              <div className="rounded-[10px] border border-white/10 overflow-hidden bg-[#1a1a1a]">
                <div className="flex items-center justify-center overflow-hidden" style={{ height: 340 }}>
                  <div className="origin-top" style={{ transform: "scale(0.4)" }}>
                    <CVRenderer cv={previewCV(current.id)} width={794} showShadow={false} />
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between">
                  <span className="text-[14px] font-semibold">{current.name}</span>
                  <span className="text-[11px] text-white/40">{current.category}</span>
                </div>
              </div>
            </div>
            {/* new */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-nirvash-red uppercase mb-3">New</p>
              <div className={cn("rounded-[10px] border overflow-hidden bg-[#1a1a1a]", isSame ? "border-white/10" : "border-nirvash-red/40")}>
                <div className="flex items-center justify-center overflow-hidden" style={{ height: 340 }}>
                  <div className="origin-top" style={{ transform: "scale(0.4)" }}>
                    <CVRenderer cv={previewCV(newT.id)} width={794} showShadow={false} />
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between">
                  <span className="text-[14px] font-semibold">{newT.name}</span>
                  <span className="text-[11px] text-white/40">{newT.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* template picker */}
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Choose a template</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TEMPLATES.map((t) => {
                const active = selected === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className={cn(
                      "rounded-[8px] border px-2 py-2.5 text-center transition-all",
                      active ? "border-nirvash-red/50 bg-nirvash-red/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"
                    )}
                  >
                    <span className={cn("text-[12px] font-bold", active ? "text-white" : "text-white/70")}>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-white/8 bg-[#1a1a1a]">
          <BrandButton variant="ghost" size="md" onClick={onClose}>Keep Current</BrandButton>
          <BrandButton variant="primary" size="md" onClick={apply} disabled={isSame}>
            Apply New Template <ArrowRight className="size-4" />
          </BrandButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
