"use client";

import { useCVStore } from "@/lib/store/cv-store";
import { getTemplate } from "@/components/templates/registry";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Red", value: "#FF4336" },
  { name: "Ruby", value: "#B71C1C" },
  { name: "Black", value: "#212121" },
  { name: "Blue", value: "#1E40AF" },
  { name: "Green", value: "#15803D" },
  { name: "Purple", value: "#7C3AED" },
];

const TYPOGRAPHIES = [
  { id: "modern", name: "Modern Sans", desc: "Clean & neutral" },
  { id: "serif", name: "Classic Serif", desc: "Traditional & formal" },
  { id: "minimal", name: "Minimal", desc: "Light & spacious" },
  { id: "elegant", name: "Elegant", desc: "Refined serif" },
];

export function DesignPanel({
  onChangeTemplate,
}: {
  onChangeTemplate: () => void;
  onBrowse: () => void;
}) {
  const cv = useCVStore((s) => s.current);
  const setDesign = useCVStore((s) => s.setDesign);
  if (!cv) return null;

  const t = getTemplate(cv.design.templateId);

  return (
    <div className="p-4 space-y-7">
      {/* Template */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Template</p>
        <button
          onClick={onChangeTemplate}
          className="w-full flex items-center gap-3 rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-nirvash-red/40 hover:bg-white/[0.05] transition-colors text-left"
        >
          <div className="size-10 rounded-[8px] bg-nirvash-red/15 border border-nirvash-red/30 flex items-center justify-center">
            <span className="text-nirvash-red font-bold text-[13px]">{t.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-white">{t.name}</p>
            <p className="text-[12px] text-white/45">{t.category}</p>
          </div>
          <span className="text-[12px] font-medium text-nirvash-red">Change</span>
          <ChevronRight className="size-4 text-white/40" />
        </button>
      </div>

      {/* Color */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Accent Color</p>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => {
            const active = cv.design.accentColor.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                onClick={() => setDesign({ accentColor: c.value })}
                className="group flex flex-col items-center gap-1.5"
                aria-label={c.name}
              >
                <span
                  className={cn(
                    "size-10 rounded-full border-2 flex items-center justify-center transition-all",
                    active ? "border-white scale-105" : "border-white/20 group-hover:border-white/50"
                  )}
                  style={{ background: c.value }}
                >
                  {active && <span className="size-2 rounded-full bg-white" />}
                </span>
                <span className={cn("text-[10px] font-medium", active ? "text-white" : "text-white/40")}>{c.name}</span>
              </button>
            );
          })}
        </div>
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
                className={cn(
                  "rounded-[10px] border px-3 py-2.5 text-left transition-all",
                  active
                    ? "border-nirvash-red/50 bg-nirvash-red/8"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                )}
              >
                <p className={cn("text-[13px] font-semibold", ty.id === "serif" || ty.id === "elegant" ? "font-serif" : "font-sans", active ? "text-white" : "text-white/80")}>
                  {ty.name}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">{ty.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
