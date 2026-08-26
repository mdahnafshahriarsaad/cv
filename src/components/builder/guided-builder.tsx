"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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
import { StepAdditional } from "@/components/builder/steps/step-additional";
import { StepReview } from "@/components/builder/steps/step-review";

const TOTAL_STEPS = 8;
const STEP_LABELS = [
  "Personal",
  "Summary",
  "Experience",
  "Education",
  "Skills",
  "Projects",
  "Additional",
  "Review",
];

export function GuidedBuilder() {
  const [step, setStep] = React.useState(0);
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);
  const saveStatus = useCVStore((s) => s.saveStatus);
  const setSaveStatus = useCVStore((s) => s.setSaveStatus);

  // autosave on step change
  React.useEffect(() => {
    setSaveStatus("saving");
    const t = setTimeout(() => {
      persistCurrent();
      setSaveStatus("saved");
    }, 500);
    return () => clearTimeout(t);
  }, [step, setSaveStatus]);

  const exit = () => {
    persistCurrent();
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  const back = () => {
    if (step === 0) {
      exit();
    } else {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0 });
    }
  };

  const next = () => {
    if (step === TOTAL_STEPS - 1) {
      persistCurrent();
      setTemplatesOrigin("flow");
      setView("templates");
      window.scrollTo({ top: 0 });
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-[#212121] text-white flex flex-col">
      {/* ambient */}
      <div className="fixed inset-0 red-ambient opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#212121]/80 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={exit}
            className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="size-4" /> Exit
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[13px] font-semibold text-white">
              Step {step + 1} of {TOTAL_STEPS}
              <span className="text-white/35 font-normal ml-1.5 hidden sm:inline">
                · {STEP_LABELS[step]}
              </span>
            </span>
            {/* progress line */}
            <div className="mt-2 h-1 w-40 sm:w-56 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-nirvash-red rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-white/45 w-16 justify-end">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-white/40 animate-pulse" />
                Saving
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/55">
                <Check className="size-3.5 text-nirvash-red" /> Saved
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && <StepPersonal />}
            {step === 1 && <StepSummary />}
            {step === 2 && <StepExperience />}
            {step === 3 && <StepEducation />}
            {step === 4 && <StepSkills />}
            {step === 5 && <StepProjects />}
            {step === 6 && <StepAdditional />}
            {step === 7 && <StepReview />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky bottom nav */}
      <div className="relative z-20 sticky bottom-0 border-t border-white/8 bg-[#212121]/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandButton variant="ghost" size="md" onClick={back}>
            <ArrowLeft className="size-4" /> Back
          </BrandButton>
          <BrandButton variant="primary" size="lg" onClick={next}>
            {step === TOTAL_STEPS - 1 ? "Choose Your Template" : "Continue"}
            <ArrowRight className="size-4" />
          </BrandButton>
        </div>
      </div>
    </div>
  );
}

/** shared step header */
export function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
        {title}
      </h1>
      <p className="mt-2.5 text-white/55 text-[15px] leading-relaxed">{subtitle}</p>
    </div>
  );
}
