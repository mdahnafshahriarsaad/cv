"use client";

import * as React from "react";
import { DarkInput } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "HTML", "CSS", "JavaScript", "React", "Python", "Microsoft Office",
  "Communication", "Problem Solving", "TypeScript", "Node.js", "SQL",
  "Leadership", "Figma", "Git", "Project Management",
];

export function StepSkills() {
  const cv = useCVStore((s) => s.current);
  const addSkill = useCVStore((s) => s.addSkill);
  const removeSkill = useCVStore((s) => s.removeSkill);
  const [input, setInput] = React.useState("");

  if (!cv) return null;

  const commit = () => {
    const v = input.trim();
    if (v) {
      addSkill(v);
      setInput("");
    }
  };

  return (
    <div>
      <StepHeader
        title="What are you good at?"
        subtitle="Add skills that are relevant to the type of work you're interested in."
      />

      {/* input */}
      <div className="relative">
        <DarkInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder="Type a skill and press Enter"
        />
        <button
          onClick={commit}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-[8px] bg-nirvash-red text-white text-[13px] font-semibold hover:bg-nirvash-ruby transition-colors inline-flex items-center gap-1"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>

      {/* selected skills */}
      {cv.skills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {cv.skills.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-nirvash-red/12 border border-nirvash-red/35 text-white text-[13px] font-medium px-3 py-1.5"
            >
              {s.name}
              <button
                onClick={() => removeSkill(s.id)}
                className="text-white/50 hover:text-white transition-colors"
                aria-label={`Remove ${s.name}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* suggested */}
      <div className="mt-8">
        <p className="text-[13px] font-medium text-white/70 mb-3">Popular Skills</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.filter((s) => !cv.skills.some((c) => c.name.toLowerCase() === s.toLowerCase())).map((s) => (
            <button
              key={s}
              onClick={() => addSkill(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-medium border transition-all",
                "bg-white/[0.03] border-white/12 text-white/60 hover:text-white hover:border-nirvash-red/40 hover:bg-nirvash-red/8"
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
