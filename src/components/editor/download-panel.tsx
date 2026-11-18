"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X, FileDown, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { BrandButton } from "@/components/shared/brand-button";
import { useCVStore } from "@/lib/store/cv-store";
import { getTemplate } from "@/components/templates/registry";
import { preflight, pdfFileName } from "@/lib/cv-data/checks";

function readPageCount(): number | null {
  const doc = document.querySelector<HTMLElement>("#nirvash-print-source .cv-doc");
  const n = Number(doc?.dataset.pages);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function DownloadPanel({ onClose }: { onClose: () => void }) {
  const cv = useCVStore((s) => s.current);
  const [pages, setPages] = React.useState<number | null>(null);
  const [opened, setOpened] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setPages(readPageCount()));
    return () => cancelAnimationFrame(id);
  }, [cv]);

  const checks = React.useMemo(() => (cv ? preflight(cv, pages) : []), [cv, pages]);

  const savedTitle = React.useRef<string | null>(null);
  React.useEffect(
    () => () => {
      if (savedTitle.current !== null) document.title = savedTitle.current;
    },
    []
  );

  const savePdf = () => {
    if (!cv) return;
    // Chrome and Edge use the document title as the default PDF file name.
    if (savedTitle.current === null) savedTitle.current = document.title;
    const previous = savedTitle.current;
    document.title = pdfFileName(cv);
    const restore = () => {
      document.title = previous;
      savedTitle.current = null;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    setOpened(true);
    window.print();
  };

  if (!cv) return null;
  const template = getTemplate(cv.design.templateId);
  const warnings = checks.filter((c) => c.level === "warn");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#212121]/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-title"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-white/10 bg-[#1f1f1f] p-6 sm:p-7"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 id="download-title" className="text-lg font-bold tracking-tight">Download as PDF</h3>
            <p className="text-[12px] text-white/45 mt-0.5 flex items-center gap-1.5">
              <FileText className="size-3.5" />
              {template.name} · A4 · {pages === null ? "…" : `${pages} ${pages === 1 ? "page" : "pages"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-[8px] hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="space-y-2 mb-5">
          {checks.map((c) => (
            <li
              key={c.text}
              className={
                c.level === "warn"
                  ? "flex gap-2.5 rounded-[9px] border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 text-[12.5px] text-amber-100/85"
                  : "flex gap-2.5 rounded-[9px] border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2.5 text-[12.5px] text-emerald-100/85"
              }
            >
              {c.level === "warn" ? (
                <AlertTriangle className="size-4 shrink-0 text-amber-300/80 mt-px" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-300/80 mt-px" />
              )}
              <span>{c.text}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-[10px] border border-white/10 bg-white/[0.02] px-4 py-3.5 mb-5">
          <p className="text-[12px] font-semibold text-white/75 mb-2">In the print dialog that opens</p>
          <ol className="space-y-1.5 text-[12.5px] text-white/55 list-decimal pl-4 marker:text-white/30">
            <li>
              Set <span className="text-white/80 font-medium">Destination</span> to{" "}
              <span className="text-white/80 font-medium">Save as PDF</span>.
            </li>
            <li>
              Leave <span className="text-white/80 font-medium">Margins</span> on Default and paper size on A4.
            </li>
            <li>
              If colours are missing, turn on <span className="text-white/80 font-medium">Background graphics</span> under More settings.
            </li>
          </ol>
        </div>

        <BrandButton variant="primary" size="lg" className="w-full" onClick={savePdf}>
          <FileDown className="size-4" /> {opened ? "Open print dialog again" : warnings.length ? "Download anyway" : "Download PDF"}
        </BrandButton>
        <p className="mt-3 text-center text-[11px] text-white/35">
          The PDF keeps selectable text, so applicant tracking systems can read it.
        </p>
      </motion.div>
    </motion.div>
  );
}
