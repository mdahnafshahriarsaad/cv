"use client";

import * as React from "react";
import { Field, DarkInput, DarkTextarea, MonthInput } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { Plus, GraduationCap } from "lucide-react";
import { Education } from "@/lib/cv-data/types";
import { dateRange } from "@/lib/cv-data/format";
import { EntryCard } from "./entry-card";

export function StepEducation() {
  const cv = useCVStore((s) => s.current);
  const addEducation = useCVStore((s) => s.addEducation);
  const updateEducation = useCVStore((s) => s.updateEducation);
  const removeEducation = useCVStore((s) => s.removeEducation);
  const moveItem = useCVStore((s) => s.moveItem);
  const [openId, setOpenId] = React.useState<string | null>(null);

  if (!cv) return null;

  const add = () => setOpenId(addEducation());

  return (
    <div>
      <StepHeader
        title="Where did you study?"
        subtitle="Add your education history, starting with the most recent."
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-medium text-white/80">Education</p>
        {cv.education.length > 0 && (
          <button
            onClick={add}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
          >
            <Plus className="size-3.5" /> Add another education
          </button>
        )}
      </div>

      <div className="space-y-3">
        {cv.education.length === 0 && (
          <button
            onClick={add}
            className="w-full rounded-[12px] border border-dashed border-white/15 hover:border-nirvash-red/40 hover:bg-white/[0.02] transition-colors py-8 text-white/45 text-[14px] font-medium"
          >
            <Plus className="size-5 mx-auto mb-2 text-nirvash-red" />
            Add your education
          </button>
        )}
        {cv.education.map((edu, i) => (
          <EducationEntry
            key={edu.id}
            edu={edu}
            open={openId === edu.id}
            onToggle={() => setOpenId((o) => (o === edu.id ? null : edu.id))}
            onChange={(patch) => updateEducation(edu.id, patch)}
            onRemove={() => removeEducation(edu.id)}
            onMove={(d) => moveItem("education", edu.id, d)}
            first={i === 0}
            last={i === cv.education.length - 1}
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
  onMove,
  first,
  last,
}: {
  edu: Education;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Education>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  const dateLabel = dateRange(edu.startDate, edu.endDate);
  const title = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ") || "Untitled education";
  const empty = !edu.degree && !edu.institution && !edu.fieldOfStudy && !edu.description;

  return (
    <EntryCard
      icon={<GraduationCap className="size-4" />}
      title={title}
      subtitle={[edu.institution || "No institution", dateLabel].filter(Boolean).join(" · ")}
      open={open}
      onToggle={onToggle}
      onMove={onMove}
      onRemove={onRemove}
      first={first}
      last={last}
      empty={empty}
    >
      <div className="grid sm:grid-cols-2 gap-3 pt-4">
        <Field label="Degree">
          <DarkInput value={edu.degree} onChange={(e) => onChange({ degree: e.target.value })} placeholder="B.Sc." autoFocus={empty} />
        </Field>
        <Field label="Field of study">
          <DarkInput value={edu.fieldOfStudy} onChange={(e) => onChange({ fieldOfStudy: e.target.value })} placeholder="Computer Science and Engineering" />
        </Field>
        <Field label="Institution">
          <DarkInput value={edu.institution} onChange={(e) => onChange({ institution: e.target.value })} placeholder="University of Dhaka" />
        </Field>
        <Field label="Location">
          <DarkInput value={edu.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="Dhaka, Bangladesh" />
        </Field>
        <Field label="Start date">
          <MonthInput label="Start date" value={edu.startDate} onChange={(v) => onChange({ startDate: v })} />
        </Field>
        <Field label="End date" hint="Use the expected date if you're still studying.">
          <MonthInput label="End date" value={edu.endDate} onChange={(v) => onChange({ endDate: v })} />
        </Field>
      </div>
      <Field label="Achievements or details" hint="Optional: honours, relevant coursework, GPA.">
        <DarkTextarea
          value={edu.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="CGPA 3.72 / 4.00. Dean's list, 2022 and 2023."
          className="min-h-[90px]"
        />
      </Field>
    </EntryCard>
  );
}
