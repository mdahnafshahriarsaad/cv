"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User, FileText, Briefcase, GraduationCap, Wrench, FolderGit2, Award, Languages, MoreHorizontal } from "lucide-react";
import { useCVStore } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";
import { StepPersonal } from "@/components/builder/steps/step-personal";
import { StepSummary } from "@/components/builder/steps/step-summary";
import { StepExperience } from "@/components/builder/steps/step-experience";
import { StepEducation } from "@/components/builder/steps/step-education";
import { StepSkills } from "@/components/builder/steps/step-skills";
import { StepProjects } from "@/components/builder/steps/step-projects";
import { SectionForm } from "@/components/builder/steps/step-additional";

type SectionId =
  | "personal" | "summary" | "experience" | "education"
  | "skills" | "projects" | "certifications" | "languages" | "additional";

const SECTIONS: { id: SectionId; label: string; icon: any }[] = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "additional", label: "Additional", icon: MoreHorizontal },
];

export function ContentPanel({ onActiveSection }: { onActiveSection?: (s: string | null) => void }) {
  const cv = useCVStore((s) => s.current);
  const [open, setOpen] = React.useState<SectionId>("personal");

  React.useEffect(() => {
    // map content panel section to renderer highlight key
    const map: Record<string, string> = { additional: "awards" };
    onActiveSection?.(open ? (map[open] ?? open) : null);
  }, [open, onActiveSection]);

  if (!cv) return null;

  const counts: Partial<Record<SectionId, number>> = {
    experience: cv.experience.length,
    education: cv.education.length,
    skills: cv.skills.length,
    projects: cv.projects.length,
    certifications: cv.certifications.length,
    languages: cv.languages.length,
    additional: cv.awards.length + cv.volunteer.length + cv.publications.length + cv.interests.length,
  };

  return (
    <div className="p-3 sm:p-4">
      <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase px-2 mb-2">Sections</p>
      <div className="space-y-1">
        {SECTIONS.map((s) => {
          const isOpen = open === s.id;
          const count = counts[s.id];
          return (
            <div key={s.id} className="rounded-[10px] overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? ("" as SectionId) : s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  isOpen ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                )}
              >
                <s.icon className={cn("size-4 shrink-0", isOpen ? "text-nirvash-red" : "text-white/40")} />
                <span className={cn("flex-1 text-[13.5px] font-medium", isOpen ? "text-white" : "text-white/70")}>
                  {s.label}
                </span>
                {!!count && (
                  <span className="text-[11px] font-medium text-white/45 bg-white/5 rounded-full px-2 py-0.5">{count}</span>
                )}
                <ChevronDown className={cn("size-4 text-white/40 transition-transform", isOpen && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-4 pt-1">
                      {s.id === "personal" && <StepPersonal />}
                      {s.id === "summary" && <StepSummary />}
                      {s.id === "experience" && <StepExperience />}
                      {s.id === "education" && <StepEducation />}
                      {s.id === "skills" && <StepSkills />}
                      {s.id === "projects" && <StepProjects />}
                      {s.id === "certifications" && <SectionForm section="certifications" />}
                      {s.id === "languages" && <SectionForm section="languages" />}
                      {s.id === "additional" && (
                        <div className="space-y-4">
                          <SubGroup title="Awards"><SectionForm section="awards" /></SubGroup>
                          <SubGroup title="Volunteer"><SectionForm section="volunteer" /></SubGroup>
                          <SubGroup title="Publications"><SectionForm section="publications" /></SubGroup>
                          <SubGroup title="Interests"><SectionForm section="interests" /></SubGroup>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[12px] font-semibold text-white/70 mb-2">{title}</p>
      {children}
    </div>
  );
}
