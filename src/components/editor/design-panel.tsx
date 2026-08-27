"use client";

import { useCVStore } from "@/lib/store/cv-store";
import { getTemplate, ACCENT_COLORS } from "@/components/templates/registry";
import { ChevronRight, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { PhotoUploadModal } from "@/components/shared/photo-upload";

const TYPOGRAPHIES = [
  { id: "inter", name: "Inter", desc: "Clean & neutral", font: "font-sans" },
  { id: "manrope", name: "Manrope", desc: "Bold & modern", font: "font-display" },
  { id: "serif", name: "Serif", desc: "Traditional & formal", font: "font-serif" },
  { id: "mixed", name: "Mixed", desc: "Display + serif body", font: "font-sans" },
] as const;

export function DesignPanel({
  onChangeTemplate,
}: {
  onChangeTemplate: () => void;
  onBrowse: () => void;
}) {
  const cv = useCVStore((s) => s.current);
  const setDesign = useCVStore((s) => s.setDesign);
  const [showPhoto, setShowPhoto] = React.useState(false);
  if (!cv) return null;

  const t = getTemplate(cv.design.templateId);
  const photo = cv.personalInfo.photo;

  return (
    <div className="p-4 space-y-6">
      {/* Template */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Template</p>
        <button
          onClick={onChangeTemplate}
          className="w-full flex items-center gap-3 rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-nirvash-red/40 hover:bg-white/[0.05] transition-colors text-left"
        >
          <div className="size-10 rounded-[8px] flex items-center justify-center text-white text-[13px] font-bold" style={{ background: t.palette.accent }}>
            {t.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-white">{t.name}</p>
            <p className="text-[12px] text-white/45">{t.collection} · {t.archetype.replace("-", " ")}</p>
          </div>
          <span className="text-[12px] font-medium text-nirvash-red">Change</span>
          <ChevronRight className="size-4 text-white/40" />
        </button>
      </div>

      {/* Photo (only if template supports it) */}
      {t.photoShape !== "none" && (
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Profile Photo</p>
          <button
            onClick={() => setShowPhoto(true)}
            className="w-full flex items-center gap-3 rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-nirvash-red/40 transition-colors text-left"
          >
            <div className="size-10 rounded-full overflow-hidden bg-white/[0.04] border border-white/12 flex items-center justify-center shrink-0">
              {photo?.dataUrl ? (
                <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${50 + (photo.offsetX || 0) * 0.3}% ${50 + (photo.offsetY || 0) * 0.3}%`, transform: `scale(${photo.zoom || 1})` }} />
              ) : (
                <Camera className="size-4 text-white/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white">{photo ? "Edit photo" : "Upload photo"}</p>
              <p className="text-[11px] text-white/45">{t.photoShape} shape · {t.name}</p>
            </div>
            <span className="text-[12px] font-medium text-nirvash-red">{photo ? "Edit" : "Add"}</span>
          </button>
        </div>
      )}

      {/* Accent Color */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Accent Color</p>
        <div className="grid grid-cols-7 gap-2">
          {ACCENT_COLORS.map((c) => {
            const active = cv.design.accentColor.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                onClick={() => setDesign({ accentColor: c.value })}
                className="group flex flex-col items-center gap-1"
                aria-label={c.name}
                title={c.name}
              >
                <span
                  className={cn("size-8 rounded-full border-2 flex items-center justify-center transition-all", active ? "border-white scale-110" : "border-white/15 group-hover:border-white/40")}
                  style={{ background: c.value }}
                >
                  {active && <span className="size-1.5 rounded-full bg-white" />}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-white/40 mt-2">Current: {ACCENT_COLORS.find(c => c.value.toLowerCase() === cv.design.accentColor.toLowerCase())?.name ?? "Custom"}</p>
      </div>

      {/* Typography */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Typography</p>
        <div className="grid grid-cols-2 gap-2">
          {TYPOGRAPHIES.map((ty) => {
            const active = cv.design.typography === ty.id;
            return (
              <button
                key={ty.id}
                onClick={() => setDesign({ typography: ty.id as any })}
                className={cn("rounded-[10px] border px-3 py-2.5 text-left transition-all", active ? "border-nirvash-red/50 bg-nirvash-red/8" : "border-white/10 bg-white/[0.02] hover:border-white/25")}
              >
                <p className={cn("text-[13px] font-semibold", ty.font, active ? "text-white" : "text-white/80")}>{ty.name}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{ty.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {showPhoto && <PhotoUploadModal onClose={() => setShowPhoto(false)} />}
    </div>
  );
}
