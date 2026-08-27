"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, X, ZoomIn, ZoomOut } from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { LazyCVPreview } from "@/components/templates/cv-preview";
import { TEMPLATES, FILTER_CATEGORIES, getTemplate, templatesByCollection } from "@/components/templates/registry";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore } from "@/lib/store/cv-store";
import { createSampleCV } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

// Preview scale: 794 * 0.34 ≈ 270px wide, 1123 * 0.34 ≈ 382px tall.
// Card preview area = ~382px tall. This fills the card with a real miniature CV.
const PREVIEW_SCALE = 0.34;

export function TemplateSelectPage() {
  const [filter, setFilter] = React.useState<string>("All");
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const setView = useAppStore((s) => s.setView);
  const templatesOrigin = useAppStore((s) => s.templatesOrigin);
  const cv = useCVStore((s) => s.current);
  const setTemplate = useCVStore((s) => s.setTemplate);

  const back = () => {
    setView(templatesOrigin === "editor-change" ? "editor" : "create-start");
    window.scrollTo({ top: 0 });
  };

  const selectTemplate = (id: string) => {
    // If no CV exists yet (browsing from landing), create one with sample data
    if (!cv) {
      const sampleId = useCVStore.getState().loadSample();
      useCVStore.getState().setTemplate(id);
    } else {
      setTemplate(id);
    }
    setView("editor");
    window.scrollTo({ top: 0 });
  };

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = React.useMemo(() => {
    let list = templatesByCollection(filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.collection.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  }, [filter, search]);

  const featured = TEMPLATES.find((t) => t.id === "vertex")!;
  const featuredCV = React.useMemo(() => {
    const base = createSampleCV(true);
    base.design.templateId = featured.id;
    return base;
  }, [featured]);

  return (
    <div className="min-h-screen bg-[#212121] text-white flex flex-col">
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
            Choose Your CV Design
          </h1>
          <p className="mt-4 text-white/55 text-[15px] leading-relaxed">
            Start with a layout you love. Every template works with your information — and you can change it anytime.
          </p>
        </div>

        {/* Featured */}
        <div className="mt-12 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center rounded-[16px] border border-white/10 bg-white/[0.02] p-6 sm:p-8 lg:p-10">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-nirvash-red/15 border border-nirvash-red/30 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase text-nirvash-red">
              <Star className="size-3 fill-current" /> Editor's Choice
            </span>
            <h2 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight">{featured.name}</h2>
            <p className="mt-2 text-white/50 text-sm font-medium">{featured.collection} · {featured.archetype.replace("-", " ")}</p>
            <p className="mt-4 text-white/65 text-[15px] leading-relaxed max-w-md">{featured.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BrandButton variant="primary" size="lg" onClick={() => selectTemplate(featured.id)}>
                Use {featured.name} <ArrowRight className="size-4" />
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
            <h3 className="text-xl font-bold tracking-tight">Explore Templates</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="h-9 rounded-[10px] bg-white/[0.04] border border-white/12 text-white text-[13px] px-3.5 placeholder:text-white/30 focus-visible:border-nirvash-red outline-none w-full sm:w-56"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-8">
            {FILTER_CATEGORIES.map((c) => {
              const isActive = filter === c;
              const count = c === "All" ? TEMPLATES.length : templatesByCollection(c).length;
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
            {filtered.map((t) => {
              const isFav = favorites.has(t.id);
              // photo-capable templates render with a sample photo
              const previewCV = createSampleCV(t.photoShape !== "none");
              previewCV.design.templateId = t.id;
              return (
                <div
                  key={t.id}
                  className="group relative rounded-[12px] overflow-hidden border border-white/8 bg-[#1a1a1a] transition-all duration-300 hover:border-nirvash-red/35 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Favorite */}
                  <button
                    onClick={() => toggleFav(t.id)}
                    className={cn("absolute top-2.5 right-2.5 z-20 size-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm", isFav ? "bg-nirvash-red text-white" : "bg-black/40 text-white/50 hover:text-white")}
                    aria-label="Favorite"
                  >
                    <Star className={cn("size-3.5", isFav && "fill-current")} />
                  </button>

                  {/* Preview area — full miniature CV */}
                  <div
                    className="relative overflow-hidden bg-[#1a1a1a] flex items-center justify-center cursor-pointer py-3"
                    onClick={() => setPreviewId(t.id)}
                  >
                    <div className="transition-transform duration-500 group-hover:scale-[1.03]">
                      <LazyCVPreview cv={previewCV} scale={PREVIEW_SCALE} />
                    </div>
                    {/* hover overlay + Preview button */}
                    <div className="absolute inset-0 bg-[#212121]/0 group-hover:bg-[#212121]/35 transition-all duration-300 flex items-center justify-center pointer-events-none">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 rounded-[10px] bg-white/15 backdrop-blur border border-white/30 px-4 py-2 text-[12px] font-semibold text-white pointer-events-none">
                        <ZoomIn className="size-3.5" /> Preview
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3.5 flex items-center justify-between bg-white/[0.02] border-t border-white/5">
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-bold tracking-tight">{t.name}</h4>
                      <p className="text-[11px] text-white/40 truncate">{t.collection}{t.badges?.length ? ` · ${t.badges[0]}` : ""}</p>
                    </div>
                    <button
                      onClick={() => selectTemplate(t.id)}
                      className="text-[11px] font-semibold text-nirvash-red hover:text-white transition-colors shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-nirvash-red/10"
                    >
                      Use <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/50 text-sm">No templates match your search.</p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {previewId && (
          <PreviewModal
            templateId={previewId}
            onClose={() => setPreviewId(null)}
            onUse={() => { selectTemplate(previewId); setPreviewId(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PreviewModal({ templateId, onClose, onUse }: { templateId: string; onClose: () => void; onUse: () => void }) {
  const [zoom, setZoom] = React.useState(0.65);
  const t = getTemplate(templateId);
  const previewCV = React.useMemo(() => {
    const base = createSampleCV(t.photoShape !== "none");
    base.design.templateId = templateId;
    return base;
  }, [templateId, t.photoShape]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#212121]/92 backdrop-blur-md flex flex-col"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight truncate">{t.name}</h3>
          <span className="text-[12px] text-white/45">{t.collection}</span>
          {t.badges?.map(b => <span key={b} className="text-[9px] font-bold uppercase tracking-wide text-nirvash-red border border-nirvash-red/30 rounded-full px-1.5 py-0.5">{b}</span>)}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-[10px] border border-white/12 bg-white/[0.04] px-1.5 py-1">
            <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="size-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Zoom out"><ZoomOut className="size-4" /></button>
            <span className="text-[12px] font-medium text-white/70 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} className="size-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Zoom in"><ZoomIn className="size-4" /></button>
          </div>
          <button onClick={onClose} className="size-9 rounded-[10px] border border-white/12 hover:bg-white/10 flex items-center justify-center" aria-label="Close"><X className="size-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 sm:p-10 flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <CVRenderer cv={previewCV} width={794} />
        </motion.div>
      </div>
      <div className="shrink-0 border-t border-white/8 bg-[#212121]/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate">{t.name}</p>
          <p className="text-[12px] text-white/45 truncate">{t.description}</p>
        </div>
        <BrandButton variant="primary" size="lg" onClick={onUse}>
          Use This Template <ArrowRight className="size-4" />
        </BrandButton>
      </div>
    </motion.div>
  );
}
