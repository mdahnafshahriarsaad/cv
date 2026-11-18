"use client";

import * as React from "react";
import { Field, DarkInput, DarkTextarea } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { Plus, FolderGit2 } from "lucide-react";
import { Project } from "@/lib/cv-data/types";
import { EntryCard } from "./entry-card";

export function StepProjects() {
  const cv = useCVStore((s) => s.current);
  const addProject = useCVStore((s) => s.addProject);
  const updateProject = useCVStore((s) => s.updateProject);
  const removeProject = useCVStore((s) => s.removeProject);
  const moveItem = useCVStore((s) => s.moveItem);
  const [openId, setOpenId] = React.useState<string | null>(null);

  if (!cv) return null;

  const add = () => setOpenId(addProject());

  return (
    <div>
      <StepHeader
        title="Have you worked on any projects?"
        subtitle="Projects are especially useful for students, freshers and creative work. This step is optional; press Continue to skip it."
      />

      {cv.projects.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-medium text-white/80">Projects</p>
          <button
            onClick={add}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
          >
            <Plus className="size-3.5" /> Add another project
          </button>
        </div>
      )}

      <div className="space-y-3">
        {cv.projects.length === 0 && (
          <button
            onClick={add}
            className="w-full rounded-[12px] border border-dashed border-white/15 hover:border-nirvash-red/40 hover:bg-white/[0.02] transition-colors py-8 text-white/45 text-[14px] font-medium"
          >
            <Plus className="size-5 mx-auto mb-2 text-nirvash-red" />
            Add a project
          </button>
        )}
        {cv.projects.map((p, i) => (
          <ProjectEntry
            key={p.id}
            p={p}
            open={openId === p.id}
            onToggle={() => setOpenId((o) => (o === p.id ? null : p.id))}
            onChange={(patch) => updateProject(p.id, patch)}
            onRemove={() => removeProject(p.id)}
            onMove={(d) => moveItem("projects", p.id, d)}
            first={i === 0}
            last={i === cv.projects.length - 1}
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
  onMove,
  first,
  last,
}: {
  p: Project;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Project>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  const empty = !p.name && !p.description && !p.technologies && !p.link;
  return (
    <EntryCard
      icon={<FolderGit2 className="size-4" />}
      title={p.name || "Untitled project"}
      subtitle={p.technologies || "No technologies listed"}
      open={open}
      onToggle={onToggle}
      onMove={onMove}
      onRemove={onRemove}
      first={first}
      last={last}
      empty={empty}
    >
      <div className="grid sm:grid-cols-2 gap-3 pt-4">
        <Field label="Project name">
          <DarkInput value={p.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Bus route planner" autoFocus={empty} />
        </Field>
        <Field label="Project link">
          <DarkInput value={p.link} onChange={(e) => onChange({ link: e.target.value })} placeholder="github.com/you/project" />
        </Field>
      </div>
      <Field label="Technologies or skills used">
        <DarkInput value={p.technologies} onChange={(e) => onChange({ technologies: e.target.value })} placeholder="React, TypeScript, PostgreSQL" />
      </Field>
      <Field label="Description" hint="What does it do, what was your part, and what came of it?">
        <DarkTextarea
          value={p.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Built a route planner used by 2,300 students to find the fastest bus between campuses."
          className="min-h-[100px]"
        />
      </Field>
    </EntryCard>
  );
}
