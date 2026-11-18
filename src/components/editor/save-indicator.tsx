"use client";

import { Check, TriangleAlert } from "lucide-react";
import { useCVStore } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";

/** Autosave status shown in the editor, preview and builder headers. */
export function SaveIndicator({ className, compact = false }: { className?: string; compact?: boolean }) {
  const status = useCVStore((s) => s.saveStatus);
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-white/45", className)}
    >
      {status === "saving" ? (
        <>
          <span className="size-1.5 rounded-full bg-white/40 animate-pulse" /> Saving…
        </>
      ) : status === "error" ? (
        <span
          className="inline-flex items-center gap-1.5 text-amber-300"
          title="Your browser's storage is full or blocked. Remove a photo or an old CV, then edit again."
        >
          <TriangleAlert className="size-3" /> {compact ? "Not saved" : "Not saved: browser storage is full"}
        </span>
      ) : (
        <>
          <Check className="size-3 text-nirvash-red" /> Saved
        </>
      )}
    </span>
  );
}
