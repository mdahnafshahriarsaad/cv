"use client";

import * as React from "react";
import { useCVStore } from "@/lib/store/cv-store";
import { CVPreview } from "@/components/templates/cv-preview";
import { getTemplate } from "@/components/templates/registry";
import { cn } from "@/lib/utils";

/** Sticky first-page preview shown next to the builders on wide screens. */
export function BuilderLivePreview({ className, scale = 0.42 }: { className?: string; scale?: number }) {
  const current = useCVStore((s) => s.current);
  // Typing stays responsive; the preview catches up a moment later.
  const cv = React.useDeferredValue(current);
  if (!cv) return null;
  const template = getTemplate(cv.design.templateId);

  const width = Math.round(794 * scale);

  return (
    <aside aria-label="Live CV preview" className={cn("hidden xl:block shrink-0", className)} style={{ width }}>
      <div className="sticky top-24">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-[12px] font-semibold text-white/70">Live preview</p>
          <p className="text-[11.5px] text-white/40 truncate">{template.name} · page 1</p>
        </div>
        <div className="w-fit rounded-[6px] ring-1 ring-white/10 overflow-hidden bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
          <CVPreview cv={cv} scale={scale} showShadow={false} />
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/35">
          You'll choose the final template next. Colours and fonts can be changed in the editor.
        </p>
      </div>
    </aside>
  );
}
