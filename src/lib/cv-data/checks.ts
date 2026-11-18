// Content checks shared by the builders and the download panel. Pure, so they can be unit tested.

import type { CVDocument } from "@/lib/cv-data/types";
import { isValidEmail } from "@/lib/cv-data/format";

export type Check = { level: "warn" | "ok"; text: string };

/** Inline errors for the personal step. Name is required; email is optional but must be valid. */
export function personalErrors(p: { fullName: string; email: string }): { fullName?: string; email?: string } {
  const errors: { fullName?: string; email?: string } = {};
  if (!p.fullName.trim()) errors.fullName = "Add your name. It's the first thing on your CV.";
  if (p.email.trim() && !isValidEmail(p.email)) errors.email = "This email doesn't look right.";
  return errors;
}

/** Content checks shown before export. Warnings never block the download. */
export function preflight(cv: CVDocument, pages: number | null): Check[] {
  const p = cv.personalInfo;
  const out: Check[] = [];
  if (!p.fullName.trim()) out.push({ level: "warn", text: "Add your full name so it appears at the top of the CV." });
  if (!p.email.trim() && !p.phone.trim()) out.push({ level: "warn", text: "Add an email or phone number so employers can reach you." });
  else if (p.email.trim() && !isValidEmail(p.email))
    out.push({ level: "warn", text: `"${p.email.trim()}" doesn't look like a valid email address.` });
  if (!p.professionalTitle.trim()) out.push({ level: "warn", text: "A professional title helps recruiters place you quickly." });
  if (cv.experience.length === 0 && cv.education.length === 0)
    out.push({ level: "warn", text: "Add at least one experience or education entry." });
  if (pages !== null && pages > 2)
    out.push({ level: "warn", text: `Your CV runs to ${pages} pages. Most recruiters expect one or two.` });
  if (out.length === 0) out.push({ level: "ok", text: "Everything essential is filled in." });
  return out;
}

/** Download name without characters Windows/macOS reject in file names. */
export function pdfFileName(cv: CVDocument): string {
  const name = cv.personalInfo.fullName.trim() || cv.name.trim();
  const clean = name.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim();
  return clean ? `${clean} - CV` : "CV";
}
