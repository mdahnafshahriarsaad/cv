"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { ScrollPaperAirplane } from "@/components/3d/scroll-paper-airplane";
import { LandingPage } from "@/components/landing/landing-page";
import { CreateStartPage } from "@/components/builder/create-start";
import { GuidedBuilder } from "@/components/builder/guided-builder";
import { FormBuilder } from "@/components/builder/form-builder";
import { TemplateSelectPage } from "@/components/templates/template-select-page";
import { CVEditor } from "@/components/editor/cv-editor";
import { PreviewPage } from "@/components/editor/preview-page";

export default function Home() {
  const view = useAppStore((s) => s.view);

  useEffect(() => {
    useAppStore.setState({ loading: false });
  }, []);

  return (
    <>
      {/* Paper airplane — at body level to avoid stacking context issues */}
      {view === "landing" && <ScrollPaperAirplane />}
      <div key={view} className="fade-up">
        {view === "landing" && <LandingPage />}
        {view === "create-start" && <CreateStartPage />}
        {view === "guided-builder" && <GuidedBuilder />}
        {view === "form-builder" && <FormBuilder />}
        {view === "templates" && <TemplateSelectPage />}
        {view === "editor" && <CVEditor />}
        {view === "preview" && <PreviewPage />}
      </div>
    </>
  );
}
