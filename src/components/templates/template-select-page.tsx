"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Star, X, ZoomIn, ZoomOut } from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer, PAGE_H, PAGE_W } from "@/components/templates/cv-renderer";
import { LazyCVPreview } from "@/components/templates/cv-preview";
import { TEMPLATES, FILTER_CATEGORIES, getTemplate, templatesByCollection, archetypeLabel } from "@/components/templates/registry";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore } from "@/lib/store/cv-store";
import { createSampleCV, hasMeaningfulContent, type CVDocument } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

// Preview scale: 794 * 0.34 ≈ 270px wide, 1123 * 0.34 ≈ 382px tall.
const PREVIEW_SCALE = 0.34;
const FAV_KEY = "nirvash-template-favorites";

/** The CV a template is previewed with, styled the way it would be after picking it. */
function previewWith(source: CVDocument, templateId: string): CVDocument {
  return { ...source, design: { ...source.design, templateId, accentColor: "", typography: "auto" } };
}

function useFavorites() {
  const [favorites, setFavorites] = React.useState<Set<string>>(() => new Set());
  React.useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
      if (Array.isArray(raw)) setFavorites(new Set(raw.filter((x) => typeof x === "string")));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);
  const toggle = React.useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        /* storage full or blocked */
      }
      return next;
    });
  }, []);
  return [favorites, toggle] as const;
}

export function TemplateSelectPage() {
  const [filter, setFilter] = React.useState<string>("All");
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const [favorites, toggleFav] = useFavorites();
  const [search, setSearch] = React.useState("");
  const setView = useAppStore((s) => s.setView);
  const templatesOrigin = useAppStore((s) => s.templatesOrigin);
  const cv = useCVStore((s) => s.current);
  const setTemplate = useCVStore((s) => s.setTemplate);

  const hasOwn = hasMeaningfulContent(cv);
  const [useOwn, setUseOwn] = React.useState(true);
  const sample = React.useMemo(() => createSampleCV(), []);
  const source = hasOwn && useOwn && cv ? cv : sample;
  const previews = React.useMemo(() => {
    const map = new Map<string, CVDocument>();
    for (const t of TEMPLATES) map.set(t.id, previewWith(source, t.id));
    return map;
  }, [source]);
  const currentId = cv && templatesOrigin === "editor-change" ? cv.design.templateId : null;

  const back = () => {
    setView(templatesOrigin === "editor-change" ? "editor" : "create-start");
    window.scrollTo({ top: 0 });
  };

  const selectTemplate = (id: string) => {
    // Browsing from the landing page without a CV: start from the sample.
    if (!cv) useCVStore.getState().loadSample();
    setTemplate(id);
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const filtered = React.useMemo(() => {
    let list = filter === "Favourites" ? TEMPLATES.filter((t) => favorites.has(t.id)) : templatesByCollection(filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.collection.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  }, [filter, search, favorites]);

  const featured = getTemplate(currentId ?? "vertex");
  const featuredCV = previews.get(featured.id)!;
  const categories: string[] = favorites.size > 0 ? [...FILTER_CATEGORIES, "Favourites"] : [...FILTER_CATEGORIES];
  React.useEffect(() => {
    if (filter === "Favourites" && favorites.size === 0) setFilter("All");
  }, [filter, favorites]);

  return (
    <div className="min-h-[100dvh] bg-[#212121] text-white flex flex-col">
      <div className="fixed inset-0 red-ambient opacity-30 pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-20 border-b border-white/5 bg-[#212121]/80 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={back}
            className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors text-[13px] font-medium"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <NirvashBrand variant="dark" size="sm" showSub={false} />
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            {TEMPLATES.length} Professional Templates
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Choose your CV design
          </h1>
          <p className="mt-4 text-white/55 text-[15px] leading-relaxed">
            {hasOwn && useOwn
              ? "Every preview below uses your own details, so you can see exactly how your CV will look."
              : "Start with a layout you like. Every template works with your information, and you can switch at any time."}
          </p>
        </div>

        {/* Featured */}
        <div className="mt-12 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center rounded-[16px] border border-white/10 bg-white/[0.02] p-6 sm:p-8 lg:p-10">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-nirvash-red/15 border border-nirvash-red/30 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase text-nirvash-red">
              {currentId ? <><Check className="size-3" /> Your current template</> : <><Star className="size-3 fill-current" /> Editor's choice</>}
            </span>
            <h2 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight">{featured.name}</h2>
            <p className="mt-2 text-white/50 text-sm font-medium">{featured.collection} · {archetypeLabel(featured.archetype)}</p>
            <p className="mt-4 text-white/65 text-[15px] leading-relaxed max-w-md">{featured.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BrandButton variant="primary" size="lg" onClick={() => selectTemplate(featured.id)}>
                {currentId ? "Keep" : "Use"} {featured.name} <ArrowRight className="size-4" />
              </BrandButton>
              <BrandButton variant="secondary" size="lg" onClick={() => setPreviewId(featured.id)}>
                Preview
              </BrandButton>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <div
              className="cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => setPreviewId(featured.id)}
            >
              <LazyCVPreview cv={featuredCV} scale={0.5} />
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h3 className="text-xl font-bold tracking-tight">Explore templates</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {hasOwn && (
                <div role="group" aria-label="Preview content" className="inline-flex rounded-[10px] border border-white/12 bg-white/[0.03] p-0.5 text-[12px] font-medium">
                  {[
                    { own: true, label: "My details" },
                    { own: false, label: "Sample CV" },
                  ].map((o) => (
                    <button
                      key={o.label}
                      onClick={() => setUseOwn(o.own)}
                      aria-pressed={useOwn === o.own}
                      className={cn(
                        "px-3 h-8 rounded-[8px] transition-colors",
                        useOwn === o.own ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates…"
                aria-label="Search templates"
                className="h-9 rounded-[10px] bg-white/[0.04] border border-white/12 text-white text-[13px] px-3.5 placeholder:text-white/30 focus-visible:border-nirvash-red outline-none w-full sm:w-56"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-8">
            {categories.map((c) => {
              const isActive = filter === c;
              const count = c === "All" ? TEMPLATES.length : c === "Favourites" ? favorites.size : templatesByCollection(c).length;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    "relative px-3.5 py-1.5 text-[13px] font-medium transition-colors rounded-[8px]",
                    isActive ? "text-white bg-white/[0.06]" : "text-white/55 hover:text-white"
                  )}
                >
                  {c} <span className="text-white/35 text-[11px]">{count}</span>
                  {isActive && (
                    <motion.span layoutId="cat-active" className="absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full bg-nirvash-red" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                previewCV={previews.get(t.id)!}
                isFav={favorites.has(t.id)}
                isCurrent={t.id === currentId}
                onToggleFav={() => toggleFav(t.id)}
                onPreview={() => setPreviewId(t.id)}
                onUse={() => selectTemplate(t.id)}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/50 text-sm">No templates match your search.</p>
            </div>
          )}
        </div>
      </main>

      <Portal>
        <AnimatePresence>
          {previewId && (
            <PreviewModal
              templateId={previewId}
              cv={previews.get(previewId)!}
              isCurrent={previewId === currentId}
              onClose={() => setPreviewId(null)}
              onUse={() => { selectTemplate(previewId); setPreviewId(null); }}
            />
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

/**
 * Template card with cursor-tracking spotlight border.
 * Uses CSS variables (--mx, --my) updated via mousemove — no React state,
 * no re-renders. The border illuminates red where the cursor is.
 */
function TemplateCard({
  template: t,
  previewCV,
  isFav,
  isCurrent,
  onToggleFav,
  onPreview,
  onUse,
}: {
  template: ReturnType<typeof getTemplate>;
  previewCV: CVDocument;
  isFav: boolean;
  isCurrent: boolean;
  onToggleFav: () => void;
  onPreview: () => void;
  onUse: () => void;
}) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      className="group relative rounded-[12px] overflow-hidden bg-[#1a1a1a] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
      style={{
        // spotlight border that follows the cursor
        background: `
          radial-gradient(200px circle at var(--mx, 50%) var(--my, 50%), rgba(255,67,54,0.15), transparent 70%),
          #1a1a1a
        `,
        border: isCurrent ? "1px solid rgba(255,67,54,0.55)" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {isCurrent && (
        <span className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 rounded-[6px] bg-nirvash-red px-2 py-1 text-[10px] font-bold text-white">
          <Check className="size-3" /> Current
        </span>
      )}
      {/* Favorite */}
      <button
        onClick={onToggleFav}
        className={cn("absolute top-2.5 right-2.5 z-20 size-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm", isFav ? "bg-nirvash-red text-white" : "bg-black/40 text-white/50 hover:text-white")}
        aria-label={isFav ? `Remove ${t.name} from favourites` : `Add ${t.name} to favourites`}
        aria-pressed={isFav}
      >
        <Star className={cn("size-3.5", isFav && "fill-current")} />
      </button>

      {/* Preview area */}
      <button
        type="button"
        aria-label={`Preview ${t.name}`}
        className="relative w-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center cursor-pointer py-3"
        onClick={onPreview}
      >
        <div className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
          <LazyCVPreview cv={previewCV} scale={PREVIEW_SCALE} />
        </div>
        <div className="absolute inset-0 bg-[#212121]/0 group-hover:bg-[#212121]/35 transition-all duration-500 flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] inline-flex items-center gap-1.5 rounded-[10px] bg-white/15 backdrop-blur border border-white/30 px-4 py-2 text-[12px] font-semibold text-white pointer-events-none">
            <ZoomIn className="size-3.5" /> Preview
          </span>
        </div>
      </button>

      {/* Footer */}
      <div className="p-3.5 flex items-center justify-between bg-white/[0.02] border-t border-white/5">
        <div className="min-w-0">
          <h4 className="text-[14px] font-bold tracking-tight">{t.name}</h4>
          <p className="text-[11px] text-white/40 truncate">{t.collection} · {archetypeLabel(t.archetype)}</p>
        </div>
        <button
          onClick={onUse}
          className="text-[12px] font-semibold text-nirvash-red hover:text-white transition-colors shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-nirvash-red/10"
        >
          {isCurrent ? "Keep" : "Use"} <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

function PreviewModal({
  templateId,
  cv,
  isCurrent,
  onClose,
  onUse,
}: {
  templateId: string;
  cv: CVDocument;
  isCurrent: boolean;
  onClose: () => void;
  onUse: () => void;
}) {
  const t = getTemplate(templateId);
  const [zoom, setZoom] = React.useState(0.65);
  const [natural, setNatural] = React.useState(PAGE_H);
  const innerRef = React.useRef<HTMLDivElement>(null);

  // Start at a zoom that fits the page width in the viewport.
  React.useLayoutEffect(() => {
    setZoom(Math.min(1, Math.max(0.4, Math.floor(((window.innerWidth - 48) / PAGE_W) * 20) / 20)));
  }, []);

  // Track the unscaled document height so the scaled wrapper takes the right space.
  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNatural(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${t.name} preview`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#212121]/92 backdrop-blur-md flex flex-col text-white"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight truncate">{t.name}</h3>
          <span className="text-[12px] text-white/45 truncate">{t.collection} · {archetypeLabel(t.archetype)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-[10px] border border-white/12 bg-white/[0.04] px-1.5 py-1">
            <button onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} className="size-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Zoom out"><ZoomOut className="size-4" /></button>
            <span className="text-[12px] font-medium text-white/70 w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} className="size-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Zoom in"><ZoomIn className="size-4" /></button>
          </div>
          <button onClick={onClose} className="size-9 rounded-[10px] border border-white/12 hover:bg-white/10 flex items-center justify-center" aria-label="Close"><X className="size-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto"
          style={{ width: PAGE_W * zoom, height: natural * zoom }}
        >
          <div ref={innerRef} style={{ width: PAGE_W, transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            <CVRenderer cv={cv} paginate />
          </div>
        </motion.div>
      </div>
      <div className="shrink-0 border-t border-white/8 bg-[#212121]/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-[12px] text-white/50 min-w-0 line-clamp-2">{t.description}</p>
        <BrandButton variant="primary" size="lg" onClick={onUse} className="shrink-0">
          {isCurrent ? "Keep this template" : "Use this template"} <ArrowRight className="size-4" />
        </BrandButton>
      </div>
    </motion.div>
  );
}
