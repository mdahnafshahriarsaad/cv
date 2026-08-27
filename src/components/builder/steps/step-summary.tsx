"use client";

import { Field, DarkTextarea } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { cn } from "@/lib/utils";

const PROFILES = [
  { id: "student", label: "Student", hint: "Mention your education, skills, projects, and career goals." },
  { id: "fresher", label: "Fresher", hint: "Highlight projects, internships, skills, and what you're eager to learn." },
  { id: "experienced", label: "Experienced Professional", hint: "Focus on your achievements, impact, and career progression." },
  { id: "freelancer", label: "Freelancer", hint: "Showcase your projects, clients, and the range of work you do." },
  { id: "career-changer", label: "Career Changer", hint: "Emphasize transferable skills and what motivates your transition." },
];

export function StepSummary() {
  const cv = useCVStore((s) => s.current);
  const setSummary = useCVStore((s) => s.setSummary);
  const setProfileType = useCVStore((s) => s.setProfileType);
  if (!cv) return null;

  const active = PROFILES.find((p) => p.id === cv.profileType);

  return (
    <div>
      <StepHeader
        title="Tell us about yourself."
        subtitle="Don't worry about writing perfectly. Just describe yourself naturally."
      />

      <Field label="Professional Summary" htmlFor="summary">
        <DarkTextarea
          id="summary"
          value={cv.summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="I'm a motivated and passionate professional with experience in..."
          className="min-h-[160px]"
        />
      </Field>

      <div className="mt-7">
        <p className="text-[13px] font-medium text-white/70 mb-3">
          Quick profile type <span className="text-white/35 font-normal">(helps tailor guidance)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => setProfileType(p.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-all",
                cv.profileType === p.id
                  ? "bg-nirvash-red/15 border-nirvash-red/50 text-white"
                  : "bg-white/[0.03] border-white/12 text-white/60 hover:text-white hover:border-white/25"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {active && (
          <p className="mt-4 text-[13px] text-white/50 leading-relaxed rounded-[10px] bg-white/[0.03] border border-white/8 px-4 py-3">
            <span className="text-nirvash-red font-medium">Tip:</span> {active.hint}
          </p>
        )}
      </div>
    </div>
  );
}
