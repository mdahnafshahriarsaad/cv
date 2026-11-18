"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Download, Edit3, Palette, LayoutPanelTop } from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { PreviewWorkspace } from "@/components/editor/preview-workspace";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore, persistCurrent } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";
import { ContentPanel } from "@/components/editor/content-panel";
import { DesignPanel } from "@/components/editor/design-panel";
import { LayoutPanel } from "@/components/editor/layout-panel";
import { DownloadPanel } from "@/components/editor/download-panel";
import { SaveIndicator } from "@/components/editor/save-indicator";
import { CVPrintSource } from "@/components/templates/cv-renderer";

type Tab = "content" | "design" | "layout";
type MobileTab = "edit" | "preview" | "design";

export function CVEditor() {
  const [tab, setTab] = React.useState<Tab>("content");
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("edit");
  const [showDownload, setShowDownload] = React.useState(false);
  const [highlightSection, setHighlightSection] = React.useState<string | null>(null);
  const [switching, setSwitching] = React.useState(false);
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);
  const cv = useCVStore((s) => s.current);
  const renameCV = useCVStore((s) => s.renameCV);
  const setSaveStatus = useCVStore((s) => s.setSaveStatus);

  // debounced autosave on cv changes
  const firstRun = React.useRef(true);
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaveStatus("saving");
    const t = setTimeout(() => {
      setSaveStatus(persistCurrent() ? "saved" : "error");
    }, 800);
    return () => clearTimeout(t);
  }, [cv, setSaveStatus]);

  // trigger switching animation when templateId changes (returning from template browser)
  const lastTemplate = React.useRef<string | null>(cv?.design.templateId ?? null);
  React.useEffect(() => {
    if (cv && lastTemplate.current !== null && lastTemplate.current !== cv.design.templateId) {
      setSwitching(true);
      const t = setTimeout(() => setSwitching(false), 500);
      lastTemplate.current = cv.design.templateId;
      return () => clearTimeout(t);
    }
    lastTemplate.current = cv?.design.templateId ?? null;
  }, [cv?.design.templateId]);

  if (!cv) {
    return (
      <div className="min-h-[100dvh] bg-[#212121] text-white flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div>
          <p className="text-lg font-semibold">No CV is open.</p>
          <p className="mt-1.5 text-[14px] text-white/50">Start a new CV or pick one you saved earlier.</p>
        </div>
        <BrandButton variant="primary" size="md" onClick={() => setView("create-start")}>
          <ArrowLeft className="size-4" /> Go to my CVs
        </BrandButton>
      </div>
    );
  }

  const backToCVs = () => {
    persistCurrent();
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  const changeTemplate = () => {
    setTemplatesOrigin("editor-change");
    setView("templates");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#212121] text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 border-b border-white/8 bg-[#1a1a1a]">
        <div className="px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={backToCVs}
              className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors text-[13px] font-medium shrink-0"
            >
              <ArrowLeft className="size-4" /> <span className="hidden sm:inline">My CVs</span>
            </button>
            <div className="hidden md:block h-5 w-px bg-white/10" />
            <NirvashBrand variant="dark" size="sm" showSub={false} className="hidden md:flex" />
          </div>

          {/* CV name + save status */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <input
              value={cv.name}
              onChange={(e) => renameCV(e.target.value)}
              onBlur={(e) => !e.target.value.trim() && renameCV("Untitled CV")}
              placeholder="Name this CV"
              className="w-full max-w-[280px] text-[15px] font-semibold text-white text-center bg-transparent border border-transparent outline-none hover:border-white/10 focus:border-white/20 focus:bg-white/5 rounded-md px-2 py-0.5 truncate transition-colors"
              aria-label="CV name"
            />
            <SaveIndicator className="text-[11px]" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <BrandButton variant="ghost" size="sm" onClick={() => setView("preview")}>
              <Eye className="size-4" /> Preview
            </BrandButton>
            <BrandButton variant="primary" size="sm" onClick={() => setShowDownload(true)}>
              <Download className="size-4" /> Download
            </BrandButton>
          </div>
        </div>
      </header>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Left: editor */}
        <div className="w-[38%] lg:w-[36%] xl:w-[34%] shrink-0 border-r border-white/8 bg-[#1f1f1f] flex flex-col min-h-0">
          {/* tabs */}
          <div className="shrink-0 flex border-b border-white/8">
            {([
              { id: "content", label: "Content", icon: Edit3 },
              { id: "design", label: "Design", icon: Palette },
              { id: "layout", label: "Layout", icon: LayoutPanelTop },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold transition-colors relative",
                  tab === t.id ? "text-white" : "text-white/45 hover:text-white/70"
                )}
              >
                <t.icon className="size-4" /> {t.label}
                {tab === t.id && (
                  <motion.span layoutId="editor-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-nirvash-red" />
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab === "content" && <ContentPanel onActiveSection={setHighlightSection} />}
            {tab === "design" && <DesignPanel onChangeTemplate={changeTemplate} />}
            {tab === "layout" && <LayoutPanel />}
          </div>
        </div>

        {/* Right: preview — auto-fit workspace, never requires browser zoom */}
        <div className="flex-1 min-w-0 relative overflow-hidden">
          <PreviewWorkspace cv={cv} highlightSection={highlightSection} switching={switching} defaultMode="width" />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        {/* mobile tabs */}
        <div className="shrink-0 flex border-b border-white/8 bg-[#1f1f1f]">
          {([
            { id: "edit", label: "Edit" },
            { id: "preview", label: "Preview" },
            { id: "design", label: "Design" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setMobileTab(t.id)}
              className={cn(
                "flex-1 py-3 text-[13px] font-semibold transition-colors relative",
                mobileTab === t.id ? "text-white" : "text-white/45"
              )}
            >
              {t.label}
              {mobileTab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nirvash-red" />}
            </button>
          ))}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {mobileTab === "edit" && (
            <div className="h-full overflow-y-auto">
              <ContentPanel onActiveSection={setHighlightSection} />
            </div>
          )}
          {mobileTab === "design" && (
            <div className="h-full overflow-y-auto">
              <DesignPanel onChangeTemplate={changeTemplate} />
              <div className="mx-4 border-t border-white/8" />
              <LayoutPanel />
            </div>
          )}
          {mobileTab === "preview" && (
            <PreviewWorkspace cv={cv} highlightSection={highlightSection} switching={switching} defaultMode="width" />
          )}
        </div>
      </div>

      {/* Download panel */}
      <AnimatePresence>
        {showDownload && <DownloadPanel onClose={() => setShowDownload(false)} />}
      </AnimatePresence>

      {/* Off-screen full-size pages: this is what Download and Ctrl/Cmd+P print */}
      <CVPrintSource cv={cv} />
    </div>
  );
}
