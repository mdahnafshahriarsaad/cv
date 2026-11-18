"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize, Maximize2 } from "lucide-react";
import { CVRenderer, PAGE_GAP, PAGE_H, PAGE_W } from "@/components/templates/cv-renderer";
import { CVDocument } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

/**
 * CV preview workspace.
 *
 * Shows the CV exactly as it will print: real A4 pages, stacked, each with
 * its own margins. The pages are laid out at full size (794px wide) and
 * scaled with a CSS transform; a wrapper with the scaled dimensions keeps
 * scrolling correct. "Fit Page" fits one whole page in view, "Fit Width"
 * fills the available width.
 */

export type FitMode = "page" | "width" | "actual" | "manual";

const PADDING = 24;
const CONTROLS_CLEARANCE = 60;
const MAX_FIT_WIDTH_ZOOM = 1.5;

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
  const [cw, setCw] = React.useState(0);
  const [ch, setCh] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [mode, setMode] = React.useState<FitMode>(defaultMode);
  const [manualZoom, setManualZoom] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setCw(r.width - PADDING * 2);
      setCh(r.height - PADDING * 2 - (showControls ? CONTROLS_CLEARANCE : 0));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showControls]);

  const fitPageZoom = cw > 0 && ch > 0 ? Math.min(cw / PAGE_W, ch / PAGE_H) : 0.5;
  const fitWidthZoom = cw > 0 ? Math.min(cw / PAGE_W, MAX_FIT_WIDTH_ZOOM) : 0.5;

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

  const docH = pages * PAGE_H + (pages - 1) * PAGE_GAP;

  // Bring the section being edited into view. The flash itself is CSS.
  React.useEffect(() => {
    if (!highlightSection) return;
    const container = containerRef.current;
    if (!container) return;
    const frame = requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>(
        `.cv-doc > .cv-page [data-cv-section="${highlightSection}"]`
      );
      if (!target) return;
      const box = container.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      const visible = r.top >= box.top + 8 && r.top <= box.bottom - 140;
      if (!visible) {
        container.scrollTo({ top: container.scrollTop + (r.top - box.top) - 72, behavior: "smooth" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [highlightSection]);

  return (
    <div className={cn("absolute inset-0 bg-[#181818]", className)}>
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-auto flex justify-center items-start p-6 pb-20"
      >
        <div className="relative shrink-0" style={{ width: PAGE_W * zoom, height: docH * zoom }}>
          {/* zoom wrapper — holds the scale transform and is never animated */}
          <div
            style={{
              width: PAGE_W,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={cv.design.templateId}
                initial={switching ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={switching ? { opacity: 0, y: -8 } : { opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <CVRenderer cv={cv} paginate highlightSection={highlightSection} onPageCount={setPages} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 rounded-[12px] border border-white/12 bg-[#1a1a1a]/92 backdrop-blur-md px-1.5 py-1 shadow-2xl max-w-[calc(100%-1rem)]">
          <CtrlBtn onClick={() => setZoomManual(zoom - 0.1)} aria-label="Zoom out">
            <ZoomOut className="size-4" />
          </CtrlBtn>
          <span className="text-[12px] font-semibold text-white tabular-nums w-12 text-center" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <CtrlBtn onClick={() => setZoomManual(zoom + 0.1)} aria-label="Zoom in">
            <ZoomIn className="size-4" />
          </CtrlBtn>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <FitBtn active={mode === "page"} onClick={() => setFit("page")}>
            <Maximize className="size-3.5" /> <span className="hidden sm:inline">Fit </span>Page
          </FitBtn>
          <FitBtn active={mode === "width"} onClick={() => setFit("width")}>
            <Maximize2 className="size-3.5" /> <span className="hidden sm:inline">Fit </span>Width
          </FitBtn>
          <FitBtn active={mode === "actual"} onClick={() => setFit("actual")}>
            100%
          </FitBtn>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <span
            className={cn(
              "px-2 text-[12px] font-medium tabular-nums whitespace-nowrap",
              pages > 2 ? "text-amber-300/90" : "text-white/55"
            )}
            title={pages > 2 ? "Most recruiters prefer one or two pages." : undefined}
            data-testid="page-count"
          >
            {pages} {pages === 1 ? "page" : "pages"}
          </span>
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
      type="button"
      {...props}
      className="size-8 rounded-md hover:bg-white/10 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-[color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nirvash-red/60"
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
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[12px] font-medium whitespace-nowrap active:scale-[0.97] transition-[color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nirvash-red/60",
        active ? "bg-nirvash-red text-white" : "text-white/65 hover:text-white hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}
