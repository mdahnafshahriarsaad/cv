"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Circle } from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore, persistCurrent } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";

import { StepPersonal } from "@/components/builder/steps/step-personal";
import { StepSummary } from "@/components/builder/steps/step-summary";
import { StepExperience } from "@/components/builder/steps/step-experience";
import { StepEducation } from "@/components/builder/steps/step-education";
import { StepSkills } from "@/components/builder/steps/step-skills";
import { StepProjects } from "@/components/builder/steps/step-projects";
import { SectionForm } from "@/components/builder/steps/step-additional";

type SectionId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "additional";

const NAV: { id: SectionId; label: string }[] = [
  { id: "personal", label: "Personal Information" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "languages", label: "Languages" },
  { id: "additional", label: "Additional Information" },
];

export function FormBuilder() {
  const [active, setActive] = React.useState<SectionId>("personal");
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);
  const cv = useCVStore((s) => s.current);
  const saveStatus = useCVStore((s) => s.saveStatus);
  const setSaveStatus = useCVStore((s) => s.setSaveStatus);

  // autosave when active section changes
  React.useEffect(() => {
    setSaveStatus("saving");
    const t = setTimeout(() => {
      persistCurrent();
      setSaveStatus("saved");
    }, 500);
    return () => clearTimeout(t);
  }, [active, setSaveStatus]);

  const exit = () => {
    persistCurrent();
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  const goToTemplates = () => {
    persistCurrent();
    setTemplatesOrigin("flow");
    setView("templates");
    window.scrollTo({ top: 0 });
  };

  const completion = React.useMemo(() => {
    if (!cv) return {} as Record<SectionId, boolean>;
    return {
      personal: !!cv.personalInfo.fullName,
      summary: !!cv.summary,
      experience: cv.experience.length > 0,
      education: cv.education.length > 0,
      skills: cv.skills.length > 0,
      projects: cv.projects.length > 0,
      certifications: cv.certifications.length > 0,
      languages: cv.languages.length > 0,
      additional:
        cv.awards.length + cv.volunteer.length + cv.publications.length + cv.interests.length > 0,
    } as Record<SectionId, boolean>;
  }, [cv]);

  const activeIndex = NAV.findIndex((n) => n.id === active);

  return (
    <div className="min-h-screen bg-[#212121] text-white flex flex-col">
      <div className="fixed inset-0 red-ambient opacity-30 pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-20 border-b border-white/5 bg-[#212121]/80 backdrop-blur-md sticky top-0">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={exit}
            className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors text-sm font-medium shrink-0"
          >
            <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="flex-1 flex items-center justify-center min-w-0">
            <NirvashBrand variant="dark" size="sm" showSub={false} />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[12px] text-white/45 hidden sm:flex items-center gap-1.5">
              {saveStatus === "saving" ? (
                <><span className="size-1.5 rounded-full bg-white/40 animate-pulse" /> Saving</>
              ) : (
                <><Check className="size-3.5 text-nirvash-red" /> Saved</>
              )}
            </span>
            <BrandButton variant="primary" size="sm" onClick={goToTemplates}>
              Continue <ArrowRight className="size-4" />
            </BrandButton>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 lg:w-72 shrink-0 border-r border-white/8 bg-[#1a1a1a]/60 flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase px-2 mb-3">
              Sections
            </p>
            <nav className="space-y-1">
              {NAV.map((n, i) => {
                const done = completion[n.id];
                const isActive = active === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActive(n.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-all relative",
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-white/55 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="form-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-nirvash-red"
                      />
                    )}
                    <span className="text-[11px] font-mono text-white/30 w-4">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-[13.5px] font-medium">{n.label}</span>
                    {done ? (
                      <Check className="size-3.5 text-nirvash-red" />
                    ) : (
                      <Circle className="size-2 text-white/20" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main form area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* mobile section switcher */}
          <div className="md:hidden border-b border-white/8 px-4 py-3 flex gap-1.5 overflow-x-auto">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium border transition-all",
                  active === n.id
                    ? "bg-nirvash-red/15 border-nirvash-red/50 text-white"
                    : "bg-white/[0.03] border-white/10 text-white/55"
                )}
              >
                {n.label}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {active === "personal" && <StepPersonal />}
                {active === "summary" && <StepSummary />}
                {active === "experience" && <StepExperience />}
                {active === "education" && <StepEducation />}
                {active === "skills" && <StepSkills />}
                {active === "projects" && <StepProjects />}
                {active === "certifications" && (
                  <FormShell title="Certifications" subtitle="Professional certificates and licenses you hold.">
                    <SectionForm section="certifications" />
                  </FormShell>
                )}
                {active === "languages" && (
                  <FormShell title="Languages" subtitle="Languages you speak and your proficiency.">
                    <SectionForm section="languages" />
                  </FormShell>
                )}
                {active === "additional" && (
                  <FormShell title="Additional Information" subtitle="Awards, volunteer work, publications, and interests.">
                    <div className="space-y-6">
                      <SubGroup title="Awards"><SectionForm section="awards" /></SubGroup>
                      <SubGroup title="Volunteer Experience"><SectionForm section="volunteer" /></SubGroup>
                      <SubGroup title="Publications"><SectionForm section="publications" /></SubGroup>
                      <SubGroup title="Interests"><SectionForm section="interests" /></SubGroup>
                    </div>
                  </FormShell>
                )}
              </motion.div>
            </AnimatePresence>

            {/* prev / next */}
            <div className="mt-10 flex items-center justify-between border-t border-white/8 pt-6">
              <BrandButton
                variant="ghost"
                size="md"
                onClick={() => activeIndex > 0 && setActive(NAV[activeIndex - 1].id)}
                disabled={activeIndex === 0}
              >
                <ArrowLeft className="size-4" /> Previous
              </BrandButton>
              {activeIndex < NAV.length - 1 ? (
                <BrandButton variant="secondary" size="md" onClick={() => setActive(NAV[activeIndex + 1].id)}>
                  Next Section <ArrowRight className="size-4" />
                </BrandButton>
              ) : (
                <BrandButton variant="primary" size="md" onClick={goToTemplates}>
                  Choose Template <ArrowRight className="size-4" />
                </BrandButton>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FormShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2.5 text-white/55 text-[15px]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function SubGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[13px] font-semibold text-white/80 mb-1">{title}</p>
      {children}
    </div>
  );
}
