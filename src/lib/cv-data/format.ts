// Pure formatting helpers shared by the CV renderer and the builder forms.

import type { Education } from "@/lib/cv-data/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-03" -> "Mar 2024", "2024" -> "2024". Anything else is returned untouched. */
export function formatMonth(iso: string): string {
  if (!iso) return "";
  const [y, m] = iso.split("-");
  if (!y) return iso;
  if (!m) return y;
  const idx = parseInt(m, 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return y;
  return `${MONTHS[idx]} ${y}`;
}

export function dateRange(start: string, end: string, current?: boolean): string {
  const s = formatMonth(start);
  const e = current ? "Present" : formatMonth(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

/** Split free text into bullet lines, dropping blank lines and any leading bullet glyph the user typed. */
export function splitLines(text: string): string[] {
  return (text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-–—•·*▪◦‣]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
}

/** Human-friendly URL for print: no protocol, no "www.", no trailing slash. */
export function displayUrl(url: string): string {
  return (url || "")
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

/** Absolute href so links stay clickable in the exported PDF. */
export function linkHref(url: string): string {
  const v = (url || "").trim();
  if (!v) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  return `https://${v.replace(/^\/+/, "")}`;
}

export function mailHref(email: string): string {
  const v = (email || "").trim();
  return v ? `mailto:${v}` : "";
}

export function telHref(phone: string): string {
  const v = (phone || "").replace(/[^\d+]/g, "");
  return v ? `tel:${v}` : "";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || "").trim());
}

/** "B.Sc., Computer Science" without repeating the field when the degree already names it. */
export function degreeTitle(edu: Pick<Education, "degree" | "fieldOfStudy">): string {
  const degree = (edu.degree || "").trim();
  const field = (edu.fieldOfStudy || "").trim();
  if (!degree) return field;
  if (!field || degree.toLowerCase().includes(field.toLowerCase())) return degree;
  return `${degree}, ${field}`;
}
