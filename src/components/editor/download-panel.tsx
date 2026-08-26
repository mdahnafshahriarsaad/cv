"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X, FileDown, Printer, Check, Loader2 } from "lucide-react";
import { BrandButton } from "@/components/shared/brand-button";
import { useCVStore } from "@/lib/store/cv-store";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { cn } from "@/lib/utils";

type Fmt = "pdf" | "print";

export function DownloadPanel({ onClose }: { onClose: () => void }) {
  const cv = useCVStore((s) => s.current);
  const [fmt, setFmt] = React.useState<Fmt>("pdf");
  const [status, setStatus] = React.useState<"idle" | "preparing" | "done">("idle");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const doDownload = () => {
    if (!cv) return;
    setStatus("preparing");
    // open a print window with just the CV
    setTimeout(() => {
      const win = window.open("", "_blank", "width=900,height=1200");
      if (!win) {
        setStatus("done");
        return;
      }
      const printCSS = `
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fff; font-family: var(--font-geist-sans), Inter, system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `;
      // We render the CVRenderer to HTML by capturing a serialized version.
      // Simpler: write a self-contained document using an iframe approach.
      win.document.write(`<!DOCTYPE html><html><head><title>${cv.name} — Nirvash CV</title><style>${printCSS}</style></head><body><div id="root"></div></body></html>`);
      win.document.close();
      // Use React portal alternative: just instruct print of a generated DOM via srcdoc iframe is complex.
      // Fallback: print this approach by writing the CV node's outerHTML.
      const node = document.getElementById("nirvash-print-source");
      if (node) {
        win.document.getElementById("root")!.innerHTML = node.innerHTML;
      }
      setTimeout(() => {
        win.focus();
        win.print();
        setStatus("done");
      }, 300);
    }, 600);
  };

  if (!cv) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#212121]/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-white/10 bg-[#1f1f1f] p-6 sm:p-7"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold tracking-tight">Download Your CV</h3>
          <button onClick={onClose} className="size-8 rounded-[8px] hover:bg-white/10 flex items-center justify-center text-white/60" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {status === "done" ? (
          <div className="text-center py-6">
            <div className="mx-auto size-14 rounded-full bg-nirvash-red/15 border border-nirvash-red/30 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="size-7 text-nirvash-red" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M5 13l4 4L19 7" className="check-draw" />
              </svg>
            </div>
            <p className="text-[16px] font-semibold text-white">Your CV is ready.</p>
            <p className="text-[13px] text-white/50 mt-1">If the print dialog didn't open, allow pop-ups and try again.</p>
            <div className="mt-5 flex gap-2 justify-center">
              <BrandButton variant="secondary" size="md" onClick={() => setStatus("idle")}>Back</BrandButton>
              <BrandButton variant="primary" size="md" onClick={doDownload}>Try Again</BrandButton>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2.5 mb-6">
              <FormatOption
                active={fmt === "pdf"}
                onClick={() => setFmt("pdf")}
                icon={FileDown}
                title="PDF"
                desc="Recommended · Best for sharing online"
                badge="Recommended"
              />
              <FormatOption
                active={fmt === "print"}
                onClick={() => setFmt("print")}
                icon={Printer}
                title="Print"
                desc="Optimized for printing"
              />
            </div>
            <BrandButton variant="primary" size="lg" className="w-full" onClick={doDownload} disabled={status === "preparing"}>
              {status === "preparing" ? (
                <><Loader2 className="size-4 animate-spin" /> Preparing…</>
              ) : (
                <><FileDown className="size-4" /> Download {fmt.toUpperCase()}</>
              )}
            </BrandButton>
            <p className="mt-3 text-center text-[11px] text-white/35">
              Your browser's print dialog lets you save as PDF.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function FormatOption({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-all",
        active ? "border-nirvash-red/50 bg-nirvash-red/8" : "border-white/10 bg-white/[0.02] hover:border-white/25"
      )}
    >
      <span className={cn("size-9 rounded-[8px] flex items-center justify-center shrink-0", active ? "bg-nirvash-red/20 text-nirvash-red" : "bg-white/5 text-white/50")}>
        <Icon className="size-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-[14px] font-semibold", active ? "text-white" : "text-white/80")}>{title}</p>
          {badge && <span className="text-[9px] font-bold tracking-wide uppercase text-nirvash-red border border-nirvash-red/30 rounded-full px-1.5 py-0.5">{badge}</span>}
        </div>
        <p className="text-[12px] text-white/45 mt-0.5">{desc}</p>
      </div>
      <span className={cn("size-5 rounded-full border-2 flex items-center justify-center shrink-0", active ? "border-nirvash-red" : "border-white/20")}>
        {active && <Check className="size-3 text-nirvash-red" />}
      </span>
    </button>
  );
}
