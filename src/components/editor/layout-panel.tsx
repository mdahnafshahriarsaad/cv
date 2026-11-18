"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useCVStore } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";
import type { SectionKey } from "@/lib/cv-data/types";
import { getTemplate } from "@/components/templates/registry";
import { sectionHasContent } from "@/components/templates/cv-blocks";
import { sectionPlacement, sideColumnLabel } from "@/components/templates/cv-layouts";

const SECTION_LABELS: Record<SectionKey, string> = {
  personal: "Personal Information",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  volunteer: "Volunteer",
  publications: "Publications",
  interests: "Interests",
};

const DENSITIES = [
  { id: "compact", label: "Compact" },
  { id: "balanced", label: "Balanced" },
  { id: "spacious", label: "Spacious" },
] as const;

const MARGINS = [
  { id: "narrow", label: "Narrow" },
  { id: "standard", label: "Standard" },
  { id: "wide", label: "Wide" },
] as const;

export function LayoutPanel() {
  const cv = useCVStore((s) => s.current);
  const setDesign = useCVStore((s) => s.setDesign);
  const setSectionOrder = useCVStore((s) => s.setSectionOrder);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!cv) return null;

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = cv.design.sectionOrder.indexOf(active.id as SectionKey);
    const newIndex = cv.design.sectionOrder.indexOf(over.id as SectionKey);
    setSectionOrder(arrayMove(cv.design.sectionOrder, oldIndex, newIndex));
  };

  // Personal details always open the CV, so they are not reorderable.
  const order = cv.design.sectionOrder.filter((s) => s !== "personal");
  const template = getTemplate(cv.design.templateId);
  const sideLabel = sideColumnLabel(template.archetype);
  const placementLabel = (key: SectionKey) => {
    const p = sectionPlacement(template.archetype, key);
    if (p === "header") return "Header";
    if (p === "side") return sideLabel ?? "Main";
    return sideLabel ? "Main column" : null;
  };

  return (
    <div className="p-4 space-y-7">
      {/* Density */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Density</p>
        <div className="grid grid-cols-3 gap-2">
          {DENSITIES.map((d) => {
            const active = cv.design.density === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDesign({ density: d.id })}
                className={cn(
                  "rounded-[10px] border px-2 py-3 text-center transition-all",
                  active ? "border-nirvash-red/50 bg-nirvash-red/8 text-white" : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25"
                )}
              >
                <div className={cn("mx-auto mb-1.5 rounded", d.id === "compact" ? "h-4 w-8" : d.id === "balanced" ? "h-5 w-8" : "h-6 w-8", active ? "bg-nirvash-red/40" : "bg-white/15")} />
                <span className="text-[12px] font-medium">{d.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-white/40 mt-2.5">
          If only a few lines spill onto a new page, spacing is tightened slightly so they fit.
        </p>
      </div>
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-3">Margins</p>
        <div className="grid grid-cols-3 gap-2">
          {MARGINS.map((m) => {
            const active = cv.design.margins === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setDesign({ margins: m.id })}
                className={cn(
                  "rounded-[10px] border px-2 py-3 text-center transition-all",
                  active ? "border-nirvash-red/50 bg-nirvash-red/8 text-white" : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25"
                )}
              >
                <div className={cn("mx-auto mb-1.5 border border-white/20 rounded", m.id === "narrow" ? "h-5 w-7" : m.id === "standard" ? "h-5 w-8" : "h-5 w-9", active && "border-nirvash-red/50")} />
                <span className="text-[12px] font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section order */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase mb-1">Section order</p>
        <p className="text-[12px] text-white/40 mb-3">
          Drag to reorder. Empty sections are left off the CV.
          {sideLabel && ` In ${template.name}, some sections sit in the ${sideLabel.toLowerCase()}; their order applies within that column.`}
        </p>
        <div className="rounded-[10px] border border-white/10 bg-white/[0.02] p-2">
          <div className="flex items-center gap-2 px-2 py-2 mb-1 text-[11px] font-semibold text-white/40">
            <span className="w-4" />
            <span className="flex-1">Personal information</span>
            <span className="text-[10px]">Always first</span>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              {order.map((s) => (
                <SortableRow
                  key={s}
                  id={s}
                  label={SECTION_LABELS[s]}
                  empty={!sectionHasContent(cv, s)}
                  placement={placementLabel(s)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

function SortableRow({ id, label, empty, placement }: { id: string; label: string; empty: boolean; placement: string | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-2 py-2 rounded-[8px] cursor-grab active:cursor-grabbing touch-none",
        isDragging ? "bg-nirvash-red/15 border border-nirvash-red/40 z-10 shadow-lg" : "hover:bg-white/[0.03]"
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4 text-white/30" />
      <span className={cn("flex-1 text-[13px] font-medium", empty ? "text-white/35" : "text-white/80")}>{label}</span>
      {empty ? (
        <span className="text-[10px] font-medium text-white/30">Empty</span>
      ) : (
        placement && <span className="text-[10px] font-medium text-white/40">{placement}</span>
      )}
    </div>
  );
}
