"use client";

import * as React from "react";
import { Field, DarkInput, DarkTextarea, MonthInput } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { Plus, Trash2, ChevronDown, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Education } from "@/lib/cv-data/types";
import { formatMonth } from "@/components/templates/cv-renderer";

export function StepEducation() {
  const cv = useCVStore((s) => s.current);
  const addEducation = useCVStore((s) => s.addEducation);
  const updateEducation = useCVStore((s) => s.updateEducation);
  const removeEducation = useCVStore((s) => s.removeEducation);
  const [openId, setOpenId] = React.useState<string | null>(null);

  if (!cv) return null;

  return (
    <div>
      <StepHeader
        title="Where did you study?"
        subtitle="Add your education history, starting with the most recent."
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-medium text-white/80">Education</p>
        <button
          onClick={() => {
            addEducation();
            const last = cv.education[cv.education.length - 1];
            if (last) setOpenId(last.id);
          }}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
        >
          <Plus className="size-3.5" /> Add Another Education
        </button>
      </div>

      <div className="space-y-3">
        {cv.education.length === 0 && (
          <button
            onClick={() => addEducation()}
            className="w-full rounded-[12px] border border-dashed border-white/15 hover:border-nirvash-red/40 hover:bg-white/[0.02] transition-colors py-8 text-white/45 text-[14px] font-medium"
          >
            <Plus className="size-5 mx-auto mb-2 text-nirvash-red" />
            Add your education
          </button>
        )}
        {cv.education.map((edu) => (
          <EducationEntry
            key={edu.id}
            edu={edu}
            open={openId === edu.id}
            onToggle={() => setOpenId((o) => (o === edu.id ? null : edu.id))}
            onChange={(patch) => updateEducation(edu.id, patch)}
            onRemove={() => removeEducation(edu.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EducationEntry({
  edu,
  open,
  onToggle,
  onChange,
  onRemove,
}: {
  edu: Education;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Education>) => void;
  onRemove: () => void;
}) {
  const dateLabel = [formatMonth(edu.startDate), formatMonth(edu.endDate)].filter(Boolean).join(" — ");
  const title = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ") || "Untitled education";

  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="size-9 rounded-[10px] bg-nirvash-red/12 border border-nirvash-red/25 flex items-center justify-center shrink-0">
          <GraduationCap className="size-4 text-nirvash-red" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white truncate">{title}</p>
          <p className="text-[12px] text-white/40 truncate">
            {edu.institution || "No institution"} {dateLabel && `· ${dateLabel}`}
          </p>
        </div>
        <ChevronDown className={cn("size-4 text-white/40 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/8">
          <div className="grid sm:grid-cols-2 gap-3 pt-4">
            <Field label="Degree">
              <DarkInput value={edu.degree} onChange={(e) => onChange({ degree: e.target.value })} placeholder="B.Sc. in Computer Science" />
            </Field>
            <Field label="Field of Study">
              <DarkInput value={edu.fieldOfStudy} onChange={(e) => onChange({ fieldOfStudy: e.target.value })} placeholder="Computer Science" />
            </Field>
            <Field label="Institution">
              <DarkInput value={edu.institution} onChange={(e) => onChange({ institution: e.target.value })} placeholder="University of..." />
            </Field>
            <Field label="Location">
              <DarkInput value={edu.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="City, Country" />
            </Field>
            <Field label="Start Date">
              <MonthInput value={edu.startDate} onChange={(v) => onChange({ startDate: v })} />
            </Field>
            <Field label="End Date">
              <MonthInput value={edu.endDate} onChange={(v) => onChange({ endDate: v })} />
            </Field>
          </div>
          <Field label="Achievements or Description" hint="Optional — honors, relevant coursework, GPA, etc.">
            <DarkTextarea
              value={edu.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Graduated with honors. Focus on..."
              className="min-h-[90px]"
            />
          </Field>
          <div className="flex justify-end">
            <button
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/45 hover:text-nirvash-red transition-colors"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
