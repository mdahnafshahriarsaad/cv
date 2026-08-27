"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize, Maximize2 } from "lucide-react";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { CVDocument } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

/**
 * Professional CV preview workspace.
 *
 * Renders the CV at its real A4 width (794px) and scales it visually
 * with `transform: scale()`. The scaled content sits inside a wrapper whose
 * layout size matches the scaled dimensions, so scrolling and overflow behave
 * correctly — the document never forces the browser to zoom.
 *
 * Auto-fit: a ResizeObserver measures the container AND the actual CV content
 * height (which may exceed one A4 page). Fit Page scales so the entire
 * document fits; Fit Width scales to the container width.
 */

const A4_W = 794;
const A4_H = Math.round(A4_W * 1.414); // 1123

export type FitMode = "page" | "width" | "actual" | "manual";

export function PreviewWorkspace({
  cv,
  highlightSection,
  switching,
  className,
  defaultMode = "page",
  showControls = true,
}: {
  cv: CVDocument;
  highlightSection?: string | null;
  switching?: boolean;
  className?: string;
  defaultMode?: FitMode;
  showControls?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cvRef = React.useRef<HTMLDivElement>(null);
  const [cw, setCw] = React.useState(0);
  const [ch, setCh] = React.useState(0);
  const [docRealH, setDocRealH] = React.useState(A4_H);
  const [mode, setMode] = React.useState<FitMode>(defaultMode);
  const [manualZoom, setManualZoom] = React.useState<number | null>(null);

  // measure container
  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      // subtract padding (48px) + space for zoom controls bar (~56px)
      setCw(r.width - 48);
      setCh(r.height - 48 - (showControls ? 60 : 0));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showControls]);

  // measure actual CV content height (may exceed A4 if content is long)
  React.useLayoutEffect(() => {
    const el = cvRef.current;
    if (!el) return;
    const measureDoc = () => {
      const h = el.scrollHeight || el.offsetHeight || A4_H;
      setDocRealH(h);
    };
    // measure after render settles
    const t = setTimeout(measureDoc, 50);
    const ro = new ResizeObserver(measureDoc);
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [cv]);

  // computed zoom factors — use actual document height for fit-page
  const fitPageZoom = cw > 0 && ch > 0 ? Math.min(cw / A4_W, ch / docRealH) : 0.5;
  const fitWidthZoom = cw > 0 ? cw / A4_W : 0.5;

  const zoom =
    mode === "actual"
      ? 1
      : mode === "width"
      ? fitWidthZoom
      : mode === "page"
      ? fitPageZoom
      : manualZoom ?? fitPageZoom;

  const setZoomManual = (z: number) => {
    setManualZoom(Math.max(0.2, Math.min(2, z)));
    setMode("manual");
  };

  const setFit = (m: FitMode) => {
    setManualZoom(null);
    setMode(m);
  };

  const docW = A4_W * zoom;
  const docH = docRealH * zoom;

  return (
    <div className={cn("absolute inset-0 bg-[#181818]", className)}>
      {/* scrollable preview area — extra bottom padding clears the zoom controls */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-auto flex justify-center items-start p-6 pb-20"
      >
        <div
          className="relative"
          style={{ width: docW, height: docH, flexShrink: 0 }}
        >
          {/* zoom wrapper — NOT animated, holds the scale transform */}
          <div
            style={{
              width: A4_W,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={cv.design.templateId + cv.design.accentColor + cv.design.typography}
                initial={switching ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={switching ? { opacity: 0, y: -8 } : { opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div ref={cvRef}>
                  <CVRenderer cv={cv} width={A4_W} highlightSection={highlightSection} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* zoom controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 rounded-[12px] border border-white/12 bg-[#1a1a1a]/92 backdrop-blur-md px-1.5 py-1 shadow-2xl">
          <CtrlBtn onClick={() => setZoomManual((manualZoom ?? zoom) - 0.1)} aria-label="Zoom out">
            <ZoomOut className="size-4" />
          </CtrlBtn>
          <span className="text-[12px] font-semibold text-white tabular-nums w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <CtrlBtn onClick={() => setZoomManual((manualZoom ?? zoom) + 0.1)} aria-label="Zoom in">
            <ZoomIn className="size-4" />
          </CtrlBtn>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <FitBtn active={mode === "page"} onClick={() => setFit("page")}>
            <Maximize className="size-3.5" /> Fit Page
          </FitBtn>
          <FitBtn active={mode === "width"} onClick={() => setFit("width")}>
            <Maximize2 className="size-3.5" /> Fit Width
          </FitBtn>
          <FitBtn active={mode === "actual"} onClick={() => setFit("actual")}>
            100%
          </FitBtn>
        </div>
      )}
    </div>
  );
}

function CtrlBtn({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="size-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
    >
      {children}
    </button>
  );
}

function FitBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[12px] font-medium transition-colors whitespace-nowrap",
        active ? "bg-nirvash-red text-white" : "text-white/65 hover:text-white hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}
