"use client";

// Public entry point for drawing a CV.
//
//  <CVRenderer cv={cv} />            one A4 page, clipped (thumbnails, previews)
//  <CVRenderer cv={cv} paginate />   real A4 pages (editor, preview, print)
//  <CVPrintSource cv={cv} />         the off-screen copy the browser prints
//
// Pagination works in two passes. The whole document is laid out once in a
// hidden measuring sheet; every unbreakable unit reports its position; then
// each page renders only the units assigned to it. Nothing is ever cut in
// half, every page keeps its margins, and sidebars run the full page height.

import * as React from "react";
import { createPortal } from "react-dom";
import type { CVDocument } from "@/lib/cv-data/types";
import { RenderProvider, type RenderContext } from "@/components/templates/cv-blocks";
import { TemplateLayout } from "@/components/templates/cv-layouts";
import {
  paginate,
  pageIndex,
  samePagination,
  type FlowSpec,
  type Pagination,
  type UnitBox,
} from "@/components/templates/cv-paginate";
import { PAGE_H, PAGE_W, resolveTheme, type CVTheme } from "@/components/templates/cv-theme";
import { cn } from "@/lib/utils";

export { formatMonth, dateRange } from "@/lib/cv-data/format";
export { PAGE_H, PAGE_W };

/** Gap between stacked pages on screen (matches .cv-doc in cv-document.css). */
export const PAGE_GAP = 28;

export interface CVRendererProps {
  cv: CVDocument;
  className?: string;
  /** Kept for existing callers. Pages are always A4 at 96 dpi (794px wide). */
  width?: number;
  showShadow?: boolean;
  /** Section the editor is focused on; it flashes briefly in the preview. */
  highlightSection?: string | null;
  /** Split the document into real pages instead of clipping it to one. */
  paginate?: boolean;
  /** Reports the page count whenever it changes (paginated mode only). */
  onPageCount?: (pages: number) => void;
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const ALWAYS = () => true;

export function CVRenderer(props: CVRendererProps) {
  return props.paginate ? <PagedCV {...props} /> : <SinglePage {...props} />;
}

function PageShell({
  theme,
  measure = false,
  className,
  ariaHidden,
  children,
}: {
  theme: CVTheme;
  measure?: boolean;
  className?: string;
  ariaHidden?: boolean;
  children: React.ReactNode;
}) {
  const def = theme.def;
  return (
    <div
      className={cn("cv-page", className)}
      style={theme.vars}
      data-template={def.id}
      data-label={def.label}
      data-skills={def.skills}
      data-bullet={def.bullet}
      data-upper-name={def.upperName ? "" : undefined}
      data-measure={measure ? "" : undefined}
      aria-hidden={ariaHidden || undefined}
    >
      {children}
    </div>
  );
}

function SinglePage({ cv, className, showShadow = true, highlightSection }: CVRendererProps) {
  const theme = React.useMemo(() => resolveTheme(cv.design), [cv.design]);
  const ctx = React.useMemo<RenderContext>(
    () => ({ cv, theme, measuring: false, first: true, show: ALWAYS, any: ALWAYS, highlight: highlightSection ?? null }),
    [cv, theme, highlightSection]
  );
  return (
    <PageShell theme={theme} className={cn(showShadow && "paper-shadow", className)}>
      <RenderProvider value={ctx}>
        <TemplateLayout />
      </RenderProvider>
    </PageShell>
  );
}

/* ---------- measuring ---------- */

function measureUnits(sheet: HTMLElement): { units: UnitBox[]; flows: Record<string, FlowSpec> } | null {
  const page = sheet.querySelector<HTMLElement>(".cv-page");
  if (!page) return null;
  const pageRect = page.getBoundingClientRect();
  if (pageRect.width === 0 || page.offsetWidth === 0) return null;
  // The preview is zoomed with a CSS transform; convert back to layout pixels.
  const scale = pageRect.width / page.offsetWidth;

  const flows: Record<string, FlowSpec> = {};
  const units: UnitBox[] = [];
  const byKey = new Map<string, UnitBox>();

  page.querySelectorAll<HTMLElement>("[data-cv-flow]").forEach((flowEl) => {
    const flow = flowEl.dataset.cvFlow as string;
    flows[flow] = { contTop: Number(flowEl.dataset.contTop), limit: Number(flowEl.dataset.limit) };
    flowEl.querySelectorAll<HTMLElement>("[data-u]").forEach((el) => {
      const key = el.dataset.u as string;
      const r = el.getBoundingClientRect();
      const top = (r.top - pageRect.top) / scale;
      const bottom = (r.bottom - pageRect.top) / scale;
      const known = byKey.get(key);
      if (known) {
        // Several elements may share a key (a label and the entry under it): keep them together.
        known.top = Math.min(known.top, top);
        known.bottom = Math.max(known.bottom, bottom);
      } else {
        const box: UnitBox = { key, flow, top, bottom };
        byKey.set(key, box);
        units.push(box);
      }
    });
  });

  return { units, flows };
}

/** Largest distance (px) by which any column of any rendered page passes its limit. */
function measureOverflow(doc: HTMLElement): number {
  let worst = 0;
  doc.querySelectorAll<HTMLElement>(":scope > .cv-page").forEach((page) => {
    const pageRect = page.getBoundingClientRect();
    if (pageRect.width === 0 || page.offsetWidth === 0) return;
    const scale = pageRect.width / page.offsetWidth;
    page.querySelectorAll<HTMLElement>("[data-cv-flow]").forEach((flowEl) => {
      const limit = Number(flowEl.dataset.limit);
      const units = flowEl.querySelectorAll<HTMLElement>("[data-u]");
      if (units.length < 2) return;
      units.forEach((el) => {
        const bottom = (el.getBoundingClientRect().bottom - pageRect.top) / scale;
        // The first unit of a column cannot move anywhere: if it alone is too tall, leave it.
        if (el.dataset.u === units[0].dataset.u) return;
        worst = Math.max(worst, bottom - limit);
      });
    });
  });
  return worst;
}

/* ---------- paginated document ---------- */

const MAX_RESERVE = 240;

/** Spacing factors tried, in order, to pull a short spill back onto the previous page. */
const FIT_LEVELS = [1, 0.86, 0.74, 0.62];
/** Only a last page holding at most this much content (px) is worth fitting away. */
const FIT_TAIL = 240;

interface FitState {
  cv: CVDocument | null;
  fonts: number;
  level: number;
  base: number;
  done: boolean;
}

function PagedCV({ cv, className, showShadow = true, highlightSection, onPageCount }: CVRendererProps) {
  const [fontTick, setFontTick] = React.useState(0);
  const [fitState, setFitState] = React.useState<FitState>({ cv: null, fonts: 0, level: 0, base: 0, done: false });
  // Any edit (or font load) starts again from the natural spacing.
  const fit = fitState.cv === cv && fitState.fonts === fontTick ? fitState : null;
  const fitLevel = fit?.level ?? 0;
  const theme = React.useMemo(() => resolveTheme(cv.design, FIT_LEVELS[fitLevel]), [cv.design, fitLevel]);
  const docRef = React.useRef<HTMLDivElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);

  // Extra space held back per page if a rendered page is ever found to
  // overflow. It stays at 0 unless measuring and rendering disagree.
  const layoutKey = `${cv.design.templateId}|${cv.design.density}|${cv.design.margins}|${cv.design.typography}`;
  const [reserve, setReserve] = React.useState({ key: layoutKey, px: 0 });
  const reservePx = reserve.key === layoutKey ? reserve.px : 0;

  // Web fonts change text metrics when they finish loading.
  React.useEffect(() => {
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (!fonts) return;
    let alive = true;
    const bump = () => {
      if (alive) setFontTick((t) => t + 1);
    };
    fonts.ready.then(bump).catch(() => {});
    fonts.addEventListener?.("loadingdone", bump);
    return () => {
      alive = false;
      fonts.removeEventListener?.("loadingdone", bump);
    };
  }, []);

  // Measure, paginate, then verify. The verification only runs once the pages
  // on screen were rendered from the pagination just computed, so a font that
  // loads between passes can never be mistaken for an overflow.
  useIsoLayoutEffect(() => {
    const sheet = sheetRef.current;
    const doc = docRef.current;
    if (!sheet || !doc) return;
    const measured = measureUnits(sheet);
    if (!measured) return;
    const next = paginate(measured.units, measured.flows, reservePx);
    if (!samePagination(pagination, next)) {
      setPagination(next);
      return;
    }
    const over = measureOverflow(doc);
    if (over > 1 && reservePx < MAX_RESERVE) {
      setReserve({ key: layoutKey, px: Math.min(MAX_RESERVE, reservePx + Math.ceil(over) + 2) });
      return;
    }

    // Smart fit: a few lines spilling onto a new page is the most common way a
    // CV ends up looking unfinished. Tighten spacing step by step and keep the
    // result only if it actually removes that page.
    if (fit?.done) return;
    const stamp = { cv, fonts: fontTick };
    if (fitLevel === 0) {
      if (next.pageCount > 1 && next.lastFill <= FIT_TAIL) {
        setFitState({ ...stamp, level: 1, base: next.pageCount, done: false });
      }
      return;
    }
    const base = fit?.base ?? next.pageCount;
    if (next.pageCount < base) setFitState({ ...stamp, level: fitLevel, base, done: true });
    else if (fitLevel < FIT_LEVELS.length - 1) setFitState({ ...stamp, level: fitLevel + 1, base, done: false });
    else setFitState({ ...stamp, level: 0, base, done: true });
  }, [cv, theme, pagination, reservePx, fontTick, layoutKey, fit, fitLevel]);

  const pageCount = pagination?.pageCount ?? 1;

  const onPageCountRef = React.useRef(onPageCount);
  React.useLayoutEffect(() => {
    onPageCountRef.current = onPageCount;
  });
  React.useEffect(() => {
    onPageCountRef.current?.(pageCount);
  }, [pageCount]);

  const measureCtx = React.useMemo<RenderContext>(
    () => ({ cv, theme, measuring: true, first: true, show: ALWAYS, any: ALWAYS, highlight: null }),
    [cv, theme]
  );

  return (
    <div ref={docRef} className={cn("cv-doc", className)} data-pages={pageCount} data-reserve={reservePx} data-fit={FIT_LEVELS[fitLevel]}>
      <div className="cv-measure" aria-hidden="true">
        <div ref={sheetRef}>
          <PageShell theme={theme} measure>
            <RenderProvider value={measureCtx}>
              <TemplateLayout />
            </RenderProvider>
          </PageShell>
        </div>
      </div>
      {Array.from({ length: pageCount }, (_, i) => (
        <CVPage
          key={i}
          index={i}
          cv={cv}
          theme={theme}
          pagination={pagination}
          highlight={highlightSection ?? null}
          className={showShadow ? "paper-shadow" : undefined}
        />
      ))}
    </div>
  );
}

function CVPage({
  index,
  cv,
  theme,
  pagination,
  highlight,
  className,
}: {
  index: number;
  cv: CVDocument;
  theme: CVTheme;
  pagination: Pagination | null;
  highlight: string | null;
  className?: string;
}) {
  const ctx = React.useMemo<RenderContext>(() => {
    const idx = pagination ? pageIndex(pagination, index) : null;
    return {
      cv,
      theme,
      measuring: false,
      first: index === 0,
      show: idx ? (key) => idx.units.has(key) : ALWAYS,
      any: idx ? (prefix) => idx.prefixes.has(prefix) : ALWAYS,
      highlight,
    };
  }, [cv, theme, pagination, index, highlight]);

  return (
    <PageShell theme={theme} className={className}>
      <RenderProvider value={ctx}>
        <TemplateLayout />
      </RenderProvider>
    </PageShell>
  );
}

/* ---------- print ---------- */

let printSources = 0;

function printTitle(cv: CVDocument): string {
  const person = cv.personalInfo.fullName.trim();
  const docName = cv.name.trim();
  const generic = !docName || /^untitled cv$/i.test(docName);
  const title = person ? (generic ? `${person} - CV` : `${person} - ${docName}`) : generic ? "CV" : docName;
  return title.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Off-screen, full-size copy of the CV that the browser prints. While it is
 * mounted, printing the page (the Download button or Ctrl/Cmd+P) outputs the
 * CV alone, one sheet per page, and names the PDF after its owner.
 */
export function CVPrintSource({ cv }: { cv: CVDocument }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    printSources += 1;
    document.documentElement.classList.add("cv-printing");
    return () => {
      printSources -= 1;
      if (printSources <= 0) document.documentElement.classList.remove("cv-printing");
    };
  }, []);

  const title = printTitle(cv);
  React.useEffect(() => {
    let previous: string | null = null;
    const before = () => {
      previous = document.title;
      document.title = title;
    };
    const after = () => {
      if (previous !== null) document.title = previous;
      previous = null;
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      after();
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [title]);

  if (!mounted) return null;
  return createPortal(
    <div id="nirvash-print-source" className="cv-print-root" aria-hidden="true">
      <CVRenderer cv={cv} paginate showShadow={false} />
    </div>,
    document.body
  );
}
