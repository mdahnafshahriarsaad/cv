"use client";

import * as React from "react";
import { Field, DarkInput, DarkTextarea, MonthInput } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { Plus, Trash2, ChevronDown, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Experience } from "@/lib/cv-data/types";
import { formatMonth } from "@/components/templates/cv-renderer";

const SITUATIONS = [
  { id: "experienced", label: "I have work experience" },
  { id: "fresher", label: "I am a fresher" },
  { id: "student", label: "I am a student" },
  { id: "internship", label: "I have internship experience" },
  { id: "freelance", label: "I have freelance experience" },
];

export function StepExperience() {
  const cv = useCVStore((s) => s.current);
  const addExperience = useCVStore((s) => s.addExperience);
  const updateExperience = useCVStore((s) => s.updateExperience);
  const removeExperience = useCVStore((s) => s.removeExperience);
  const [situation, setSituation] = React.useState<string>("");
  const [openId, setOpenId] = React.useState<string | null>(null);

  if (!cv) return null;

  const noExp = situation === "fresher" || situation === "student";

  return (
    <div>
      <StepHeader
        title="Let's talk about your experience."
        subtitle="Add your work history, internships, or freelance work."
      />

      <p className="text-[14px] font-medium text-white/80 mb-3">
        What best describes your situation?
      </p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {SITUATIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSituation(s.id)}
            className={cn(
              "text-left rounded-[10px] border px-4 py-3 text-[14px] font-medium transition-all",
              situation === s.id
                ? "bg-nirvash-red/10 border-nirvash-red/50 text-white"
                : "bg-white/[0.03] border-white/12 text-white/65 hover:border-white/25"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {noExp && (
        <div className="mt-6 rounded-[12px] bg-white/[0.03] border border-white/8 px-5 py-4">
          <p className="text-[14px] text-white/70 leading-relaxed">
            That's completely fine.{" "}
            <span className="text-white">
              Projects, internships, education, and skills can also make a strong CV.
            </span>{" "}
            You can skip ahead or add any experience you do have below.
          </p>
        </div>
      )}

      {(situation && !noExp) || (situation && cv.experience.length > 0) ? (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-medium text-white/80">Your experience</p>
            <button
              onClick={() => {
                addExperience();
                setOpenId(cv.experience[cv.experience.length - 1]?.id ?? null);
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
            >
              <Plus className="size-3.5" /> Add Another Experience
            </button>
          </div>

          <div className="space-y-3">
            {cv.experience.length === 0 && (
              <button
                onClick={() => addExperience()}
                className="w-full rounded-[12px] border border-dashed border-white/15 hover:border-nirvash-red/40 hover:bg-white/[0.02] transition-colors py-8 text-white/45 text-[14px] font-medium"
              >
                <Plus className="size-5 mx-auto mb-2 text-nirvash-red" />
                Add your first experience
              </button>
            )}
            {cv.experience.map((exp) => (
              <ExperienceEntry
                key={exp.id}
                exp={exp}
                open={openId === exp.id}
                onToggle={() => setOpenId((o) => (o === exp.id ? null : exp.id))}
                onChange={(patch) => updateExperience(exp.id, patch)}
                onRemove={() => removeExperience(exp.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExperienceEntry({
  exp,
  open,
  onToggle,
  onChange,
  onRemove,
}: {
  exp: Experience;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Experience>) => void;
  onRemove: () => void;
}) {
  const dateLabel = [formatMonth(exp.startDate), exp.current ? "Present" : formatMonth(exp.endDate)]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="size-9 rounded-[10px] bg-nirvash-red/12 border border-nirvash-red/25 flex items-center justify-center shrink-0">
          <Briefcase className="size-4 text-nirvash-red" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white truncate">
            {exp.jobTitle || "Untitled role"}
            {exp.company && <span className="text-white/45 font-normal"> · {exp.company}</span>}
          </p>
          <p className="text-[12px] text-white/40">{dateLabel || "No dates set"}</p>
        </div>
        <ChevronDown className={cn("size-4 text-white/40 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/8">
          <div className="grid sm:grid-cols-2 gap-3 pt-4">
            <Field label="Job Title">
              <DarkInput value={exp.jobTitle} onChange={(e) => onChange({ jobTitle: e.target.value })} placeholder="Frontend Developer" />
            </Field>
            <Field label="Company / Organization">
              <DarkInput value={exp.company} onChange={(e) => onChange({ company: e.target.value })} placeholder="Nirvash" />
            </Field>
            <Field label="Location">
              <DarkInput value={exp.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="San Francisco, CA" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <MonthInput value={exp.startDate} onChange={(v) => onChange({ startDate: v })} />
              </Field>
              <Field label="End Date">
                <MonthInput
                  value={exp.endDate}
                  onChange={(v) => onChange({ endDate: v })}
                  placeholder={exp.current ? "Present" : undefined}
                />
              </Field>
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => onChange({ current: e.target.checked })}
              className="size-4 rounded border-white/20 bg-white/5 accent-nirvash-red"
            />
            <span className="text-[13px] text-white/70">I currently work here</span>
          </label>
          <Field label="Responsibilities" hint="Describe what you worked on, what you were responsible for, and what you achieved.">
            <DarkTextarea
              value={exp.responsibilities}
              onChange={(e) => onChange({ responsibilities: e.target.value })}
              placeholder={"Led the rebuild of...\nMentored 4 junior developers...\nDrove migration to..."}
              className="min-h-[120px]"
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
