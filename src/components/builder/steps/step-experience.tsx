"use client";

import * as React from "react";
import { Field, DarkInput, DarkTextarea, MonthInput } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { Plus, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Experience } from "@/lib/cv-data/types";
import { dateRange } from "@/lib/cv-data/format";
import { EntryCard } from "./entry-card";

const SITUATIONS = [
  { id: "experienced", label: "I have work experience", profile: "experienced" },
  { id: "fresher", label: "I am a fresher", profile: "fresher" },
  { id: "student", label: "I am a student", profile: "student" },
  { id: "internship", label: "I have internship experience", profile: "fresher" },
  { id: "freelancer", label: "I have freelance experience", profile: "freelancer" },
];

export function StepExperience() {
  const cv = useCVStore((s) => s.current);
  const addExperience = useCVStore((s) => s.addExperience);
  const updateExperience = useCVStore((s) => s.updateExperience);
  const removeExperience = useCVStore((s) => s.removeExperience);
  const moveItem = useCVStore((s) => s.moveItem);
  const setProfileType = useCVStore((s) => s.setProfileType);
  const [situation, setSituation] = React.useState<string>(
    () => SITUATIONS.find((s) => s.id === cv?.profileType)?.id ?? ""
  );
  const [openId, setOpenId] = React.useState<string | null>(null);

  if (!cv) return null;

  const noExp = situation === "fresher" || situation === "student";
  const add = () => setOpenId(addExperience());

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
            onClick={() => {
              setSituation(s.id);
              setProfileType(s.profile);
            }}
            aria-pressed={situation === s.id}
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

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-medium text-white/80">Your experience</p>
          {cv.experience.length > 0 && (
            <button
              onClick={add}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
            >
              <Plus className="size-3.5" /> Add another experience
            </button>
          )}
        </div>

        <div className="space-y-3">
          {cv.experience.length === 0 && (
            <button
              onClick={add}
              className="w-full rounded-[12px] border border-dashed border-white/15 hover:border-nirvash-red/40 hover:bg-white/[0.02] transition-colors py-8 text-white/45 text-[14px] font-medium"
            >
              <Plus className="size-5 mx-auto mb-2 text-nirvash-red" />
              {noExp ? "Add a part-time job or volunteer role (optional)" : "Add your first experience"}
            </button>
          )}
          {cv.experience.map((exp, i) => (
            <ExperienceEntry
              key={exp.id}
              exp={exp}
              open={openId === exp.id}
              onToggle={() => setOpenId((o) => (o === exp.id ? null : exp.id))}
              onChange={(patch) => updateExperience(exp.id, patch)}
              onRemove={() => removeExperience(exp.id)}
              onMove={(d) => moveItem("experience", exp.id, d)}
              first={i === 0}
              last={i === cv.experience.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


function ExperienceEntry({
  exp,
  open,
  onToggle,
  onChange,
  onRemove,
  onMove,
  first,
  last,
}: {
  exp: Experience;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Experience>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  const dateLabel = dateRange(exp.startDate, exp.endDate, exp.current);
  const title = exp.jobTitle || "Untitled role";
  const empty = !exp.jobTitle && !exp.company && !exp.responsibilities;

  return (
    <EntryCard
      icon={<Briefcase className="size-4" />}
      title={exp.company ? `${title} · ${exp.company}` : title}
      subtitle={dateLabel || "No dates set"}
      open={open}
      onToggle={onToggle}
      onMove={onMove}
      onRemove={onRemove}
      first={first}
      last={last}
      empty={empty}
    >
      <div className="grid sm:grid-cols-2 gap-3 pt-4">
        <Field label="Job title">
          <DarkInput value={exp.jobTitle} onChange={(e) => onChange({ jobTitle: e.target.value })} placeholder="Frontend Developer" autoFocus={empty} />
        </Field>
        <Field label="Company or organisation">
          <DarkInput value={exp.company} onChange={(e) => onChange({ company: e.target.value })} placeholder="Bkash Limited" />
        </Field>
        <Field label="Location" className="sm:col-span-2">
          <DarkInput value={exp.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="Dhaka, Bangladesh" />
        </Field>
        <Field label="Start date">
          <MonthInput label="Start date" value={exp.startDate} onChange={(v) => onChange({ startDate: v })} />
        </Field>
        <Field label="End date" hint={exp.current ? "Shown as Present" : undefined}>
          <MonthInput label="End date" value={exp.current ? "" : exp.endDate} disabled={exp.current} onChange={(v) => onChange({ endDate: v })} />
        </Field>
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
      <Field label="Responsibilities and achievements" hint="One point per line. Start with a verb and add a number where you can.">
        <DarkTextarea
          value={exp.responsibilities}
          onChange={(e) => onChange({ responsibilities: e.target.value })}
          placeholder={"Rebuilt the checkout flow, cutting drop-off by 18%\nMentored 4 junior developers\nMigrated 120k users to the new API"}
          className="min-h-[120px]"
        />
      </Field>
    </EntryCard>
  );
}
