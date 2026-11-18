"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronRight, Check, Pipette, RotateCcw } from "lucide-react";
import { useCVStore } from "@/lib/store/cv-store";
import { getTemplate, ACCENT_COLORS, FONT_PAIRS, archetypeLabel, type FontPair } from "@/components/templates/registry";
import { effectiveAccent } from "@/components/templates/cv-theme";
import { CVPreview } from "@/components/templates/cv-preview";
import { PhotoThumb, PhotoUploadModal } from "@/components/shared/photo-upload";
import type { TypographyChoice } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

const FONT_STACK: Record<FontPair, { heading: string; body: string }> = {
  sans: { heading: "'Geist', sans-serif", body: "'Geist', sans-serif" },
  display: { heading: "'Manrope', sans-serif", body: "'Geist', sans-serif" },
  serif: { heading: "'Source Serif 4', Georgia, serif", body: "'Source Serif 4', Georgia, serif" },
  mixed: { heading: "'Source Serif 4', Georgia, serif", body: "'Geist', sans-serif" },
};

function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase">{children}</p>
      {hint}
    </div>
  );
}

export function DesignPanel({ onChangeTemplate }: { onChangeTemplate: () => void }) {
  const cv = useCVStore((s) => s.current);
  const setDesign = useCVStore((s) => s.setDesign);
  const [showPhoto, setShowPhoto] = React.useState(false);
  if (!cv) return null;

  const t = getTemplate(cv.design.templateId);
  const photo = cv.personalInfo.photo;
  const overridden = !!cv.design.accentColor && cv.design.accentColor.toLowerCase() !== t.palette.accent.toLowerCase();
  const shown = effectiveAccent(cv.design).toLowerCase();
  const typography: TypographyChoice = cv.design.typography || "auto";
  const templateFont = FONT_PAIRS.find((f) => f.id === t.font);

  return (
    <div className="p-4 space-y-7">
      {/* Template */}
      <section>
        <SectionLabel>Template</SectionLabel>
        <button
          onClick={onChangeTemplate}
          className="group w-full flex items-center gap-3.5 rounded-[12px] border border-white/10 bg-white/[0.03] p-3 hover:border-nirvash-red/40 hover:bg-white/[0.05] transition-colors text-left"
        >
          <span className="shrink-0 overflow-hidden rounded-[4px] ring-1 ring-white/10 bg-white">
            <CVPreview cv={cv} scale={0.075} showShadow={false} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] font-semibold text-white">{t.name}</span>
            <span className="block text-[12px] text-white/45 truncate">
              {t.collection} · {archetypeLabel(t.archetype)}
            </span>
          </span>
          <span className="text-[12px] font-medium text-nirvash-red group-hover:text-white transition-colors">Change</span>
          <ChevronRight className="size-4 text-white/40" />
        </button>
      </section>

      {/* Photo */}
      <section>
        <SectionLabel>Profile photo</SectionLabel>
        <button
          onClick={() => setShowPhoto(true)}
          className="w-full flex items-center gap-3 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-nirvash-red/40 transition-colors text-left"
        >
          <PhotoThumb photo={photo} shape={t.photoShape === "none" ? "circle" : t.photoShape} className="w-10" />
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-medium text-white">{photo ? "Edit photo" : "Add a photo"}</span>
            <span className="block text-[11px] text-white/45">
              {t.photoShape === "none" ? `${t.name} leaves the photo out` : photo ? "Adjust the crop or replace it" : "Optional. Many employers prefer CVs without one."}
            </span>
          </span>
          <span className="text-[12px] font-medium text-nirvash-red">{photo ? "Edit" : "Add"}</span>
        </button>
      </section>

      {/* Accent */}
      <section>
        <SectionLabel
          hint={
            overridden && (
              <button
                onClick={() => setDesign({ accentColor: "" })}
                className="flex items-center gap-1 text-[11px] font-medium text-white/50 hover:text-white transition-colors"
              >
                <RotateCcw className="size-3" /> Template colours
              </button>
            )
          }
        >
          Accent colour
        </SectionLabel>
        <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-label="Accent colour">
          <Swatch
            color={t.palette.accent}
            label={`${t.name} default`}
            active={!overridden}
            onClick={() => setDesign({ accentColor: "" })}
            ring
          />
          {ACCENT_COLORS.filter((c) => c.value.toLowerCase() !== t.palette.accent.toLowerCase()).map((c) => (
            <Swatch
              key={c.value}
              color={c.value}
              label={c.name}
              active={overridden && shown === c.value.toLowerCase()}
              onClick={() => setDesign({ accentColor: c.value })}
            />
          ))}
          <label
            className={cn(
              "relative size-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
              overridden && !ACCENT_COLORS.some((c) => c.value.toLowerCase() === shown)
                ? "border-white scale-110"
                : "border-dashed border-white/25 hover:border-white/50"
            )}
            title="Custom colour"
            style={
              overridden && !ACCENT_COLORS.some((c) => c.value.toLowerCase() === shown) ? { background: shown } : undefined
            }
          >
            <Pipette className="size-3.5 text-white/70" />
            <input
              type="color"
              value={shown}
              onChange={(e) => setDesign({ accentColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Custom accent colour"
            />
          </label>
        </div>
        <p className="text-[11px] text-white/40 mt-2.5">
          {overridden
            ? "Headings, links and coloured panels follow this colour."
            : `Using ${t.name}'s own palette.`}
        </p>
      </section>

      {/* Typography */}
      <section>
        <SectionLabel>Typography</SectionLabel>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Typography">
          <FontOption
            active={typography === "auto"}
            onClick={() => setDesign({ typography: "auto" })}
            pair={t.font}
            name="Template default"
            desc={templateFont?.name ?? "As designed"}
          />
          {FONT_PAIRS.map((f) => (
            <FontOption
              key={f.id}
              active={typography === f.id}
              onClick={() => setDesign({ typography: f.id })}
              pair={f.id}
              name={f.name}
              desc={f.desc}
            />
          ))}
        </div>
      </section>

      <AnimatePresence>{showPhoto && <PhotoUploadModal onClose={() => setShowPhoto(false)} />}</AnimatePresence>
    </div>
  );
}

function Swatch({
  color,
  label,
  active,
  onClick,
  ring = false,
}: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
  ring?: boolean;
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="group flex items-center justify-center"
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          "relative size-8 rounded-full border-2 flex items-center justify-center transition-all",
          active ? "border-white scale-110" : "border-white/15 group-hover:border-white/40"
        )}
        style={{ background: color }}
      >
        {active && <Check className="size-3.5 text-white drop-shadow" strokeWidth={3} />}
        {ring && !active && <span className="absolute -inset-[5px] rounded-full border border-white/20" />}
      </span>
    </button>
  );
}

function FontOption({
  active,
  onClick,
  pair,
  name,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  pair: FontPair;
  name: string;
  desc: string;
}) {
  const stack = FONT_STACK[pair];
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "rounded-[10px] border px-3 py-2.5 text-left transition-all",
        active ? "border-nirvash-red/50 bg-nirvash-red/8" : "border-white/10 bg-white/[0.02] hover:border-white/25"
      )}
    >
      <span className="flex items-baseline gap-2">
        <span className={cn("text-[20px] leading-none font-semibold", active ? "text-white" : "text-white/75")} style={{ fontFamily: stack.heading }}>
          Aa
        </span>
        <span className="text-[11px] text-white/45" style={{ fontFamily: stack.body }}>
          Body text
        </span>
      </span>
      <span className={cn("mt-1.5 block text-[12px] font-semibold", active ? "text-white" : "text-white/80")}>{name}</span>
      <span className="block text-[10.5px] text-white/40 mt-0.5">{desc}</span>
    </button>
  );
}
