"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, ZoomIn, ZoomOut, Star } from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { TEMPLATES, TEMPLATE_CATEGORIES, getTemplate } from "@/components/templates/registry";
import { useAppStore } from "@/lib/store/app-store";
import { useCVStore } from "@/lib/store/cv-store";
import { createSampleCV } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

export function TemplateSelectPage() {
  const [filter, setFilter] = React.useState<string>("All");
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const setView = useAppStore((s) => s.setView);
  const templatesOrigin = useAppStore((s) => s.templatesOrigin);
  const cv = useCVStore((s) => s.current);
  const setTemplate = useCVStore((s) => s.setTemplate);

  const back = () => {
    setView(templatesOrigin === "editor-change" ? "editor" : "create-start");
    window.scrollTo({ top: 0 });
  };

  const selectTemplate = (id: string) => {
    setTemplate(id);
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
    if (filter === "All") return TEMPLATES;
    const f = filter.toLowerCase();
    return TEMPLATES.filter((t) => t.categories.some((c) => c.toLowerCase() === f));
  }, [filter]);

  const featured = TEMPLATES.find((t) => t.editorChoice) ?? TEMPLATES[0];
  const featuredCV = React.useMemo(() => {
    const base = createSampleCV();
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
            className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors text-sm font-medium"
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
            Choose Your Design
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Choose Your CV Design
          </h1>
          <p className="mt-4 text-white/55 text-base leading-relaxed">
            Start with a layout you love. You can always change it later.
          </p>
        </div>

        {/* Featured template */}
        <div className="mt-14 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center rounded-[16px] border border-white/10 bg-white/[0.02] p-6 sm:p-8 lg:p-10">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-nirvash-red/15 border border-nirvash-red/30 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase text-nirvash-red">
              <Star className="size-3 fill-current" /> Editor's Choice
            </span>
            <h2 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight">{featured.name}</h2>
            <p className="mt-2 text-white/50 text-sm font-medium">{featured.category}</p>
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
            <div className="origin-top cursor-pointer" style={{ transform: "scale(0.55)" }} onClick={() => setPreviewId(featured.id)}>
              <CVRenderer cv={featuredCV} width={794} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-16">
          <h3 className="text-xl font-bold tracking-tight mb-5">Explore Templates</h3>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((c) => {
              const isActive = filter === c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    "relative px-3.5 py-1.5 text-[13px] font-medium transition-colors rounded-[8px]",
                    isActive ? "text-white" : "text-white/55 hover:text-white"
                  )}
                >
                  {c}
                  {isActive && (
                    <motion.span
                      layoutId="cat-active"
                      className="absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full bg-nirvash-red"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filtered.map((t) => {
              const previewCV = createSampleCV();
              previewCV.design.templateId = t.id;
              const isFav = favorites.has(t.id);
              return (
                <div
                  key={t.id}
                  className="group relative rounded-[14px] overflow-hidden border border-white/10 bg-[#1a1a1a] transition-all hover:border-nirvash-red/40 hover:shadow-xl"
                >
                  {/* fav */}
                  <button
                    onClick={() => toggleFav(t.id)}
                    className={cn(
                      "absolute top-3 right-3 z-20 size-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm",
                      isFav ? "bg-nirvash-red text-white" : "bg-black/40 text-white/60 hover:text-white"
                    )}
                    aria-label="Favorite"
                  >
                    <Star className={cn("size-4", isFav && "fill-current")} />
                  </button>

                  {/* preview */}
                  <div
                    className="relative overflow-hidden bg-[#1a1a1a] flex items-center justify-center cursor-pointer"
                    style={{ height: 380 }}
                    onClick={() => setPreviewId(t.id)}
                  >
                    <div className="origin-top transition-transform duration-500 group-hover:scale-105" style={{ transform: "scale(0.4)" }}>
                      <CVRenderer cv={previewCV} width={794} showShadow={false} />
                    </div>
                    {/* hover overlay */}
                    <div className="absolute inset-0 bg-[#212121]/0 group-hover:bg-[#212121]/45 transition-all duration-300 flex items-center justify-center gap-2">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 rounded-[10px] bg-white/10 backdrop-blur border border-white/25 px-3.5 py-2 text-[13px] font-medium text-white">
                        <ZoomIn className="size-3.5" /> Preview
                      </span>
                    </div>
                  </div>

                  {/* meta */}
                  <div className="p-4 flex items-center justify-between bg-white/[0.02]">
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-extrabold tracking-tight">{t.name}</h4>
                      <p className="text-[12px] text-white/45 truncate">{t.category}</p>
                    </div>
                    <BrandButton variant="primary" size="sm" onClick={() => selectTemplate(t.id)}>
                      Use <ArrowRight className="size-3.5" />
                    </BrandButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Preview modal */}
      <AnimatePresence>
        {previewId && (
          <PreviewModal
            templateId={previewId}
            onClose={() => setPreviewId(null)}
            onUse={() => {
              selectTemplate(previewId);
              setPreviewId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PreviewModal({
  templateId,
  onClose,
  onUse,
}: {
  templateId: string;
  onClose: () => void;
  onUse: () => void;
}) {
  const [zoom, setZoom] = React.useState(0.7);
  const t = getTemplate(templateId);
  const previewCV = React.useMemo(() => {
    const base = createSampleCV();
    base.design.templateId = templateId;
    return base;
  }, [templateId]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#212121]/90 backdrop-blur-md flex flex-col"
    >
      {/* top controls */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight truncate">{t.name}</h3>
          <span className="text-[12px] text-white/45">{t.category}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* zoom controls */}
          <div className="hidden sm:flex items-center gap-1 rounded-[10px] border border-white/12 bg-white/[0.04] px-1.5 py-1">
            <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))} className="size-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Zoom out">
              <ZoomOut className="size-4" />
            </button>
            <span className="text-[12px] font-medium text-white/70 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} className="size-7 rounded-md hover:bg-white/10 flex items-center justify-center" aria-label="Zoom in">
              <ZoomIn className="size-4" />
            </button>
          </div>
          <button onClick={onClose} className="size-9 rounded-[10px] border border-white/12 hover:bg-white/10 flex items-center justify-center" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* preview area */}
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

      {/* bottom CTA */}
      <div className="shrink-0 border-t border-white/8 bg-[#212121]/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold">{t.name}</p>
          <p className="text-[12px] text-white/45">{t.description}</p>
        </div>
        <BrandButton variant="primary" size="lg" onClick={onUse}>
          Use This Template <ArrowRight className="size-4" />
        </BrandButton>
      </div>
    </motion.div>
  );
}
