"use client";

import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader, useGuidedNav } from "@/components/builder/guided-builder";
import { Check, Circle, Pencil, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { preflight } from "@/lib/cv-data/checks";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

export function StepReview() {
  const cv = useCVStore((s) => s.current);
  const { goTo } = useGuidedNav();
  if (!cv) return null;

  const p = cv.personalInfo;
  const additionalCount =
    cv.certifications.length + cv.languages.length + cv.awards.length + cv.volunteer.length + cv.publications.length + cv.interests.length;

  const sections = [
    {
      step: 0,
      label: "Personal information",
      filled: !!p.fullName.trim(),
      detail: [p.fullName, p.professionalTitle, p.email || p.phone].filter(Boolean).join(" · ") || "Not added",
    },
    {
      step: 1,
      label: "Professional summary",
      filled: !!cv.summary.trim(),
      detail: cv.summary.trim() ? clip(cv.summary.trim(), 120) : "Not added",
    },
    {
      step: 2,
      label: "Experience",
      filled: cv.experience.length > 0,
      detail: cv.experience.length
        ? [plural(cv.experience.length, "role", "roles"), cv.experience[0]?.jobTitle].filter(Boolean).join(" · ")
        : "No experience added",
    },
    {
      step: 3,
      label: "Education",
      filled: cv.education.length > 0,
      detail: cv.education.length
        ? [plural(cv.education.length, "entry", "entries"), cv.education[0]?.degree].filter(Boolean).join(" · ")
        : "No education added",
    },
    {
      step: 4,
      label: "Skills",
      filled: cv.skills.length > 0,
      detail: cv.skills.length ? clip(cv.skills.map((s) => s.name).filter(Boolean).join(", "), 120) : "No skills added",
    },
    {
      step: 5,
      label: "Projects",
      optional: true,
      filled: cv.projects.length > 0,
      detail: cv.projects.length ? plural(cv.projects.length, "project", "projects") : "Skipped",
    },
    {
      step: 6,
      label: "Additional information",
      optional: true,
      filled: additionalCount > 0,
      detail:
        [
          cv.certifications.length && plural(cv.certifications.length, "certification", "certifications"),
          cv.languages.length && plural(cv.languages.length, "language", "languages"),
          cv.awards.length && plural(cv.awards.length, "award", "awards"),
          cv.volunteer.length && plural(cv.volunteer.length, "volunteer role", "volunteer roles"),
          cv.publications.length && plural(cv.publications.length, "publication", "publications"),
          cv.interests.length && plural(cv.interests.length, "interest", "interests"),
        ]
          .filter(Boolean)
          .join(" · ") || "Skipped",
    },
  ];

  const warnings = preflight(cv, null).filter((c) => c.level === "warn");

  return (
    <div>
      <StepHeader
        title="Your information is ready."
        subtitle="Check what you've added. Edit any section, or continue to pick a template."
      />

      {warnings.length > 0 && (
        <div className="mb-5 rounded-[12px] border border-amber-400/25 bg-amber-400/[0.06] px-5 py-4">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-amber-200">
            <AlertTriangle className="size-4" /> Worth fixing before you download
          </p>
          <ul className="mt-2 space-y-1 pl-6 text-[13px] text-white/65 list-disc marker:text-amber-300/60">
            {warnings.map((w) => (
              <li key={w.text}>{w.text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2.5">
        {sections.map((s) => (
          <div
            key={s.step}
            className={cn(
              "rounded-[12px] border bg-white/[0.02] px-5 py-4 flex items-center gap-4",
              s.filled ? "border-white/12" : "border-dashed border-white/10"
            )}
          >
            <span
              className={cn(
                "shrink-0 size-7 rounded-full flex items-center justify-center",
                s.filled ? "bg-nirvash-red/15 text-nirvash-red" : "bg-white/5 text-white/30"
              )}
            >
              {s.filled ? <Check className="size-4" /> : <Circle className="size-3.5" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-white">{s.label}</p>
                {s.optional && <span className="text-[11px] font-medium text-white/35">Optional</span>}
              </div>
              <p className="text-[12.5px] text-white/50 mt-0.5 truncate">{s.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => goTo(s.step)}
              aria-label={`Edit ${s.label.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-white/60 hover:bg-white/[0.05] hover:text-white transition-colors shrink-0"
            >
              <Pencil className="size-3.5" /> {s.filled ? "Edit" : "Add"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[13px] text-white/45">
        Next you'll pick a template. You can change the template, colours and section order at any time in the editor.
      </p>
    </div>
  );
}
