"use client";

import * as React from "react";
import { Field, DarkInput, DarkTextarea } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { BrandButton } from "@/components/shared/brand-button";
import { Plus, Trash2, ChevronDown, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/cv-data/types";

export function StepProjects() {
  const cv = useCVStore((s) => s.current);
  const addProject = useCVStore((s) => s.addProject);
  const updateProject = useCVStore((s) => s.updateProject);
  const removeProject = useCVStore((s) => s.removeProject);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [skipped, setSkipped] = React.useState(false);

  if (!cv) return null;

  if (cv.projects.length === 0 && !skipped) {
    return (
      <div>
        <StepHeader
          title="Have you worked on any projects?"
          subtitle="Projects are especially useful for students, freshers, and creative professionals."
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => addProject()}
            className="rounded-[12px] border border-nirvash-red/30 bg-nirvash-red/8 hover:bg-nirvash-red/12 transition-colors p-7 text-left"
          >
            <Plus className="size-6 text-nirvash-red mb-3" />
            <p className="text-[15px] font-semibold text-white">Yes, Add a Project</p>
            <p className="text-[13px] text-white/50 mt-1">Showcase what you've built.</p>
          </button>
          <button
            onClick={() => setSkipped(true)}
            className="rounded-[12px] border border-white/12 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-7 text-left"
          >
            <p className="text-[15px] font-semibold text-white/80">Skip for Now</p>
            <p className="text-[13px] text-white/45 mt-1">You can add projects later.</p>
          </button>
        </div>
      </div>
    );
  }

  if (skipped && cv.projects.length === 0) {
    return (
      <div>
        <StepHeader title="Have you worked on any projects?" subtitle="Projects are especially useful for students, freshers, and creative professionals." />
        <div className="rounded-[12px] border border-white/10 bg-white/[0.02] px-6 py-8 text-center">
          <p className="text-white/60 text-[14px]">No projects added.</p>
          <BrandButton variant="secondary" size="md" className="mt-4" onClick={() => setSkipped(false)}>
            <Plus className="size-4" /> Add a project
          </BrandButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepHeader title="Have you worked on any projects?" subtitle="Projects are especially useful for students, freshers, and creative professionals." />

      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-medium text-white/80">Projects</p>
        <button
          onClick={() => addProject()}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
        >
          <Plus className="size-3.5" /> Add Another Project
        </button>
      </div>

      <div className="space-y-3">
        {cv.projects.map((p) => (
          <ProjectEntry
            key={p.id}
            p={p}
            open={openId === p.id}
            onToggle={() => setOpenId((o) => (o === p.id ? null : p.id))}
            onChange={(patch) => updateProject(p.id, patch)}
            onRemove={() => removeProject(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectEntry({
  p,
  open,
  onToggle,
  onChange,
  onRemove,
}: {
  p: Project;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Project>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="size-9 rounded-[10px] bg-nirvash-red/12 border border-nirvash-red/25 flex items-center justify-center shrink-0">
          <FolderGit2 className="size-4 text-nirvash-red" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white truncate">{p.name || "Untitled project"}</p>
          <p className="text-[12px] text-white/40 truncate">{p.technologies || "No technologies listed"}</p>
        </div>
        <ChevronDown className={cn("size-4 text-white/40 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/8">
          <div className="grid sm:grid-cols-2 gap-3 pt-4">
            <Field label="Project Name">
              <DarkInput value={p.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Nimbus UI Kit" />
            </Field>
            <Field label="Project Link">
              <DarkInput value={p.link} onChange={(e) => onChange({ link: e.target.value })} placeholder="github.com/..." />
            </Field>
          </div>
          <Field label="Technologies / Skills Used">
            <DarkInput value={p.technologies} onChange={(e) => onChange({ technologies: e.target.value })} placeholder="React, TypeScript, Tailwind" />
          </Field>
          <Field label="Project Description">
            <DarkTextarea
              value={p.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="What does the project do? What was your role?"
              className="min-h-[100px]"
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
