// Resolves a CV's design settings into concrete colours, fonts and spacing.
// Everything the stylesheet needs is exposed as CSS custom properties.

import type * as React from "react";
import type { DesignSettings } from "@/lib/cv-data/types";
import { getTemplate, type FontPair, type TemplateDef } from "@/components/templates/registry";

/** A4 at 96 dpi. The height is floored so a page box always fits one printed sheet. */
export const PAGE_W = 794;
export const PAGE_H = 1122;

type RGB = [number, number, number];

function parseHex(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** t = 0 returns a, t = 1 returns b. */
export function mix(a: string, b: string, t: number): string {
  const x = parseHex(a);
  const y = parseHex(b);
  if (!x || !y) return a;
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function toHsl(hex: string): [number, number, number] {
  const rgb = parseHex(hex) ?? [0, 0, 0];
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: RGB = [0, 0, 0];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = l - c / 2;
  return toHex([(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255]);
}

function darken(hex: string, factor: number): string {
  const [h, s, l] = toHsl(hex);
  return fromHsl(h, s, l * factor);
}

/** Give `source` the hue of `target` while keeping its own lightness. */
function recolor(source: string, target: string): string {
  const [, ss, sl] = toHsl(source);
  const [th, ts] = toHsl(target);
  return fromHsl(th, Math.min(ts, ss + 0.15), sl);
}

/** Darken a colour until it is readable as text on `bg`. */
function readableOn(color: string, bg: string, min = 4.2): string {
  let out = color;
  for (let i = 0; i < 14 && contrast(out, bg) < min; i++) out = darken(out, 0.88);
  return out;
}

const SANS = "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const DISPLAY = "'Manrope', 'Geist', ui-sans-serif, system-ui, sans-serif";
const SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif";

const FONT_SETUP: Record<FontPair, { heading: string; body: string; nameWeight: number; nameTrack: string; scale: number }> = {
  sans: { heading: SANS, body: SANS, nameWeight: 700, nameTrack: "-0.028em", scale: 1 },
  display: { heading: DISPLAY, body: SANS, nameWeight: 800, nameTrack: "-0.035em", scale: 1 },
  serif: { heading: SERIF, body: SERIF, nameWeight: 700, nameTrack: "-0.015em", scale: 1.035 },
  mixed: { heading: SERIF, body: SANS, nameWeight: 700, nameTrack: "-0.015em", scale: 1 },
};

const DENSITY = {
  compact: { fs: 11.75, lh: 1.4, section: 14, item: 8, title: 5.5, bullet: 1.5, header: 16 },
  balanced: { fs: 12.5, lh: 1.47, section: 19, item: 11, title: 7, bullet: 2.5, header: 22 },
  spacious: { fs: 13.25, lh: 1.56, section: 26, item: 14.5, title: 9.5, bullet: 4, header: 28 },
} as const;

const MARGINS = {
  narrow: { x: 40, y: 38 },
  standard: { x: 54, y: 48 },
  wide: { x: 68, y: 60 },
} as const;

export interface CVTheme {
  def: TemplateDef;
  font: FontPair;
  padX: number;
  padY: number;
  gapSection: number;
  gapHeader: number;
  /** CSS custom properties for the page root */
  vars: React.CSSProperties;
}

/**
 * `fit` (0–1) tightens vertical spacing and, slightly, line height. The
 * paginated renderer lowers it only to pull a few spilled lines back onto
 * the previous page; type sizes and margins are never changed.
 */
export function resolveTheme(design: DesignSettings, fit = 1): CVTheme {
  const def = getTemplate(design.templateId);
  const pal = def.palette;

  const override = parseHex(design.accentColor) ? design.accentColor : "";
  const custom = !!override && override.toLowerCase() !== pal.accent.toLowerCase();
  const accent = custom ? override : pal.accent;
  const accentDark = custom ? darken(accent, 0.72) : pal.accentDark;

  // A coloured band or sidebar follows a custom accent; a neutral one stays put.
  const chromaticSurface = toHsl(pal.surface)[1] > 0.2;
  const surface = custom && chromaticSurface ? recolor(pal.surface, accent) : pal.surface;
  const surfaceInk = custom && chromaticSurface && toHsl(pal.surfaceText)[1] > 0.2 ? recolor(pal.surfaceText, accent) : pal.surfaceText;

  const accentInk = readableOn(contrast(accent, pal.paper) >= 4.2 ? accent : accentDark, pal.paper);
  const onAccent = contrast("#ffffff", accent) >= 2.6 ? "#ffffff" : "#1a1a1a";

  let surfaceAccent = accent;
  if (contrast(surfaceAccent, surface) < 2.8) surfaceAccent = mix(accent, surfaceInk, 0.6);
  if (contrast(surfaceAccent, surface) < 2.8) surfaceAccent = surfaceInk;

  const fontKey: FontPair = design.typography && design.typography !== "auto" ? design.typography : def.font;
  const font = FONT_SETUP[fontKey] ?? FONT_SETUP.sans;

  const d = DENSITY[design.density] ?? DENSITY.balanced;
  const m = MARGINS[design.margins] ?? MARGINS.standard;
  const tight = def.archetype === "dense-compact";
  const fs = d.fs * font.scale * (tight ? 0.95 : 1);
  const g = (v: number) => Math.round(v * (tight ? 0.86 : 1) * fit * 10) / 10;
  const lh = Math.round(d.lh * (1 - (1 - fit) * 0.12) * 1000) / 1000;

  const vars: Record<string, string | number> = {
    "--cv-accent": accent,
    "--cv-accent-ink": accentInk,
    "--cv-on-accent": onAccent,
    "--cv-ink": pal.ink,
    "--cv-ink-soft": mix(pal.ink, pal.paper, 0.16),
    "--cv-muted": pal.muted,
    "--cv-line": mix(pal.ink, pal.paper, 0.87),
    "--cv-line-strong": mix(pal.ink, pal.paper, 0.72),
    "--cv-tint": mix(accent, pal.paper, 0.91),
    "--cv-paper": pal.paper,
    "--cv-surface": surface,
    "--cv-surface-ink": surfaceInk,
    "--cv-surface-ink-soft": mix(surfaceInk, surface, 0.12),
    "--cv-surface-muted": mix(surfaceInk, surface, 0.34),
    "--cv-surface-line": mix(surfaceInk, surface, 0.82),
    "--cv-surface-line-strong": mix(surfaceInk, surface, 0.64),
    "--cv-surface-tint": mix(surfaceInk, surface, 0.9),
    "--cv-surface-accent": surfaceAccent,
    "--cv-font-heading": font.heading,
    "--cv-font-body": font.body,
    "--cv-name-weight": font.nameWeight,
    "--cv-name-track": font.nameTrack,
    "--cv-fs": `${fs}px`,
    "--cv-lh": lh,
    "--cv-pad-x": `${m.x}px`,
    "--cv-pad-y": `${m.y}px`,
    "--cv-gap-section": `${g(d.section)}px`,
    "--cv-gap-item": `${g(d.item)}px`,
    "--cv-gap-title": `${g(d.title)}px`,
    "--cv-gap-bullet": `${g(d.bullet)}px`,
    "--cv-gap-header": `${g(d.header)}px`,
  };

  return {
    def,
    font: fontKey,
    padX: m.x,
    padY: m.y,
    gapSection: g(d.section),
    gapHeader: g(d.header),
    vars: vars as React.CSSProperties,
  };
}

/** Accent actually shown for a design (template default unless overridden). */
export function effectiveAccent(design: DesignSettings): string {
  const def = getTemplate(design.templateId);
  return parseHex(design.accentColor) ? design.accentColor : def.palette.accent;
}
