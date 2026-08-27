"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, Download, Printer, Palette, FileText,
} from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { PreviewWorkspace } from "@/components/editor/preview-workspace";
import { DownloadPanel } from "@/components/editor/download-panel";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore, persistCurrent } from "@/lib/store/cv-store";
import { AnimatePresence } from "framer-motion";

export function PreviewPage() {
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);
  const cv = useCVStore((s) => s.current);
  const saveStatus = useCVStore((s) => s.saveStatus);
  const [showDownload, setShowDownload] = React.useState(false);

  // persist on entering preview
  React.useEffect(() => {
    persistCurrent();
  }, []);

  if (!cv) {
    return (
      <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center">
        <p className="text-white/50">No CV loaded.</p>
      </div>
    );
  }

  const backToEditor = () => {
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const changeTemplate = () => {
    setTemplatesOrigin("editor-change");
    setView("templates");
    window.scrollTo({ top: 0 });
  };

  const print = () => {
    window.print();
  };

  return (
    <div className="h-screen bg-[#212121] text-white flex flex-col overflow-hidden">
      {/* Top navigation — persistent */}
      <header className="shrink-0 border-b border-white/8 bg-[#1a1a1a]">
        <div className="px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
          {/* Left: back + name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={backToEditor}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-[13px] font-medium shrink-0 group"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back to Editor</span>
              <span className="sm:hidden">Editor</span>
            </button>
            <div className="hidden md:block h-5 w-px bg-white/10" />
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <span className="text-[14px] font-semibold text-white truncate max-w-[200px]">{cv.name}</span>
              <span className="text-[11px] text-white/40 flex items-center gap-1 shrink-0">
                {saveStatus === "saving" ? (
                  <><span className="size-1.5 rounded-full bg-white/40 animate-pulse" /> Saving…</>
                ) : (
                  <><Check className="size-3 text-nirvash-red" /> Autosaved</>
                )}
              </span>
            </div>
          </div>

          {/* Center: brand on mobile */}
          <div className="md:hidden">
            <NirvashBrand variant="dark" size="sm" showSub={false} />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={changeTemplate}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Palette className="size-3.5" /> Template
            </button>
            <button
              onClick={print}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Printer className="size-3.5" /> Print
            </button>
            <button
              onClick={backToEditor}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FileText className="size-3.5" /> Edit CV
            </button>
            <BrandButton variant="primary" size="sm" onClick={() => setShowDownload(true)}>
              <Download className="size-4" /> <span className="hidden sm:inline">Download</span>
            </BrandButton>
          </div>
        </div>

        {/* mobile action row */}
        <div className="sm:hidden flex items-center gap-1.5 px-3 pb-2">
          <button
            onClick={changeTemplate}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-[8px] text-[12px] font-medium text-white/70 bg-white/5"
          >
            <Palette className="size-3.5" /> Template
          </button>
          <button
            onClick={print}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-[8px] text-[12px] font-medium text-white/70 bg-white/5"
          >
            <Printer className="size-3.5" /> Print
          </button>
          <button
            onClick={backToEditor}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-[8px] text-[12px] font-medium text-white/70 bg-white/5"
          >
            <FileText className="size-3.5" /> Edit
          </button>
        </div>
      </header>

      {/* Preview workspace — auto-fit, never requires browser zoom */}
      <main className="flex-1 min-h-0 relative">
        <PreviewWorkspace cv={cv} defaultMode="page" />
      </main>

      {/* Download panel */}
      <AnimatePresence>
        {showDownload && <DownloadPanel onClose={() => setShowDownload(false)} />}
      </AnimatePresence>

      {/* Hidden print source — real A4 dimensions for PDF/print */}
      <div
        id="nirvash-print-source"
        aria-hidden="true"
        style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}
      >
        {/* CVRenderer at full A4 for print; the visible PreviewWorkspace is separate */}
      </div>
    </div>
  );
}
