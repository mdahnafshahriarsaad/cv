"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Eye, Download, Edit3, Palette, LayoutPanelTop, X, Check as CheckIcon } from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore, persistCurrent } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";
import { ContentPanel } from "@/components/editor/content-panel";
import { DesignPanel } from "@/components/editor/design-panel";
import { LayoutPanel } from "@/components/editor/layout-panel";
import { DownloadPanel } from "@/components/editor/download-panel";
import { TemplateChangeModal } from "@/components/editor/template-change-modal";

type Tab = "content" | "design" | "layout";
type MobileTab = "edit" | "preview" | "design";

export function CVEditor() {
  const [tab, setTab] = React.useState<Tab>("content");
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("edit");
  const [zoom, setZoom] = React.useState(0.85);
  const [showDownload, setShowDownload] = React.useState(false);
  const [showTemplateChange, setShowTemplateChange] = React.useState(false);
  const setView = useAppStore((s) => s.setView);
  const setTemplatesOrigin = useAppStore((s) => s.setTemplatesOrigin);
  const cv = useCVStore((s) => s.current);
  const renameCV = useCVStore((s) => s.renameCV);
  const saveStatus = useCVStore((s) => s.saveStatus);
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
      persistCurrent();
      setSaveStatus("saved");
    }, 800);
    return () => clearTimeout(t);
  }, [cv, setSaveStatus]);

  if (!cv) {
    return (
      <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center">
        <p className="text-white/50">No CV loaded.</p>
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
    <div className="h-screen bg-[#212121] text-white flex flex-col overflow-hidden">
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
              className="text-[15px] font-semibold text-white text-center bg-transparent border-none outline-none focus:bg-white/5 rounded px-2 py-0.5 max-w-[280px] truncate"
              aria-label="CV name"
            />
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              {saveStatus === "saving" ? (
                <><span className="size-1.5 rounded-full bg-white/40 animate-pulse" /> Saving…</>
              ) : (
                <><Check className="size-3 text-nirvash-red" /> Saved just now</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <BrandButton variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => setMobileTab("preview")}>
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
            {tab === "content" && <ContentPanel />}
            {tab === "design" && <DesignPanel onChangeTemplate={changeTemplate} onBrowse={changeTemplate} />}
            {tab === "layout" && <LayoutPanel />}
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 min-w-0 bg-[#181818] relative overflow-hidden">
          <PreviewArea cv={cv} zoom={zoom} setZoom={setZoom} />
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
        <div className="flex-1 overflow-y-auto">
          {mobileTab === "edit" && <ContentPanel />}
          {mobileTab === "design" && <DesignPanel onChangeTemplate={changeTemplate} onBrowse={changeTemplate} />}
          {mobileTab === "preview" && (
            <div className="bg-[#181818] p-4">
              <PreviewArea cv={cv} zoom={0.6} setZoom={() => {}} mobile />
            </div>
          )}
        </div>
      </div>

      {/* Download panel */}
      <AnimatePresence>
        {showDownload && <DownloadPanel onClose={() => setShowDownload(false)} />}
      </AnimatePresence>

      {/* Template change modal */}
      <AnimatePresence>
        {showTemplateChange && (
          <TemplateChangeModal onClose={() => setShowTemplateChange(false)} />
        )}
      </AnimatePresence>

      {/* Hidden print source for PDF export */}
      <div
        id="nirvash-print-source"
        aria-hidden="true"
        style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}
      >
        <CVRenderer cv={cv} width={794} showShadow={false} />
      </div>
    </div>
  );
}

function PreviewArea({
  cv,
  zoom,
  setZoom,
  mobile = false,
}: {
  cv: ReturnType<typeof useCVStore.getState>["current"];
  zoom: number;
  setZoom: (z: number) => void;
  mobile?: boolean;
}) {
  if (!cv) return null;
  return (
    <div className="h-full w-full overflow-auto flex flex-col">
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8 lg:p-10">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
          <CVRenderer cv={cv} width={794} />
        </div>
      </div>
      {/* floating zoom controls */}
      {!mobile && (
        <div className="sticky bottom-4 mx-auto mb-4 flex items-center gap-1 rounded-[10px] border border-white/12 bg-[#1a1a1a]/90 backdrop-blur-md px-1.5 py-1 shadow-lg w-fit self-center">
          <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="size-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70" aria-label="Zoom out">−</button>
          <span className="text-[12px] font-medium text-white/70 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="size-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70" aria-label="Zoom in">+</button>
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          <button onClick={() => setZoom(0.85)} className="px-2.5 h-8 rounded-md hover:bg-white/10 text-[12px] font-medium text-white/70" aria-label="Fit">Fit</button>
        </div>
      )}
    </div>
  );
}
