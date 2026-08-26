"use client";

import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { BrandButton } from "@/components/shared/brand-button";
import { Check, Circle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app-store";
import { formatMonth } from "@/components/templates/cv-renderer";

export function StepReview() {
  const cv = useCVStore((s) => s.current);
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);
  if (!cv) return null;

  const sections = [
    {
      key: "personal",
      label: "Personal Information",
      filled: !!cv.personalInfo.fullName,
      detail: [cv.personalInfo.fullName, cv.personalInfo.professionalTitle, cv.personalInfo.email].filter(Boolean).join(" · "),
    },
    {
      key: "summary",
      label: "Professional Summary",
      filled: !!cv.summary,
      detail: cv.summary ? cv.summary.slice(0, 120) + (cv.summary.length > 120 ? "…" : "") : "Not added",
    },
    {
      key: "experience",
      label: "Experience",
      filled: cv.experience.length > 0,
      detail: cv.experience.length
        ? `${cv.experience.length} ${cv.experience.length === 1 ? "role" : "roles"} · ${cv.experience[0]?.jobTitle || ""}`
        : "No experience added",
    },
    {
      key: "education",
      label: "Education",
      filled: cv.education.length > 0,
      detail: cv.education.length
        ? `${cv.education.length} ${cv.education.length === 1 ? "entry" : "entries"} · ${cv.education[0]?.degree || ""}`
        : "No education added",
    },
    {
      key: "skills",
      label: "Skills",
      filled: cv.skills.length > 0,
      detail: cv.skills.length ? `${cv.skills.length} skills` : "No skills added",
    },
    {
      key: "projects",
      label: "Projects",
      filled: cv.projects.length > 0,
      detail: cv.projects.length ? `${cv.projects.length} ${cv.projects.length === 1 ? "project" : "projects"}` : "Optional — skipped",
      optional: true,
    },
    {
      key: "additional",
      label: "Additional Information",
      filled:
        cv.certifications.length + cv.languages.length + cv.awards.length + cv.volunteer.length + cv.publications.length + cv.interests.length > 0,
      detail:
        [
          cv.certifications.length && `${cv.certifications.length} certifications`,
          cv.languages.length && `${cv.languages.length} languages`,
          cv.awards.length && `${cv.awards.length} awards`,
          cv.interests.length && `${cv.interests.length} interests`,
        ]
          .filter(Boolean)
          .join(" · ") || "Optional — skipped",
      optional: true,
    },
  ];

  const goToTemplates = () => {
    setTemplatesOrigin("flow");
    setView("templates");
    window.scrollTo({ top: 0 });
  };

  return (
    <div>
      <StepHeader
        title="Your information is ready."
        subtitle="Take a look at everything you've added. You can edit any section, or continue to pick a template."
      />

      <div className="space-y-2.5">
        {sections.map((s) => (
          <div
            key={s.key}
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
                {s.optional && <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wide">Optional</span>}
              </div>
              <p className="text-[12.5px] text-white/50 mt-0.5 truncate">{s.detail}</p>
            </div>
            <button
              onClick={() => {
                // For guided builder, edit jumps to form builder section
                setView("form-builder");
                window.scrollTo({ top: 0 });
              }}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/60 hover:text-nirvash-red transition-colors shrink-0"
            >
              <Pencil className="size-3.5" /> Edit
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[12px] border border-nirvash-red/25 bg-nirvash-red/8 px-6 py-6 text-center">
        <p className="text-[15px] font-semibold text-white">Everything looks good?</p>
        <p className="text-[13px] text-white/55 mt-1">Pick a template and your CV comes to life.</p>
        <BrandButton variant="primary" size="lg" className="mt-5" onClick={goToTemplates}>
          Choose Your Template →
        </BrandButton>
      </div>
    </div>
  );
}
