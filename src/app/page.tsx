"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { LandingPage } from "@/components/landing/landing-page";
import { CreateStartPage } from "@/components/builder/create-start";
import { GuidedBuilder } from "@/components/builder/guided-builder";
import { FormBuilder } from "@/components/builder/form-builder";
import { TemplateSelectPage } from "@/components/templates/template-select-page";
import { CVEditor } from "@/components/editor/cv-editor";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const showLoading = useAppStore((s) => s.showLoading);

  useEffect(() => {
    showLoading(900);
  }, [showLoading]);

  return (
    <>
      <LoadingScreen />
      <div key={view} className="fade-up">
        {view === "landing" && <LandingPage />}
        {view === "create-start" && <CreateStartPage />}
        {view === "guided-builder" && <GuidedBuilder />}
        {view === "form-builder" && <FormBuilder />}
        {view === "templates" && <TemplateSelectPage />}
        {view === "editor" && <CVEditor />}
      </div>
    </>
  );
}
