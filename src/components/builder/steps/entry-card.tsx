"use client";

import * as React from "react";
import { ChevronDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Collapsible list entry used by the experience, education and project steps. */
export function EntryCard({
  icon,
  title,
  subtitle,
  open,
  onToggle,
  onMove,
  onRemove,
  first,
  last,
  empty,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  onMove?: (direction: -1 | 1) => void;
  onRemove: () => void;
  first?: boolean;
  last?: boolean;
  /** skip the confirmation when nothing has been typed yet */
  empty?: boolean;
  children: React.ReactNode;
}) {
  const iconBtn =
    "size-8 inline-flex items-center justify-center rounded-[8px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nirvash-red/40";

  return (
    <div
      className={cn(
        "rounded-[12px] border bg-white/[0.02] overflow-hidden transition-colors",
        open ? "border-white/20" : "border-white/10"
      )}
    >
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:bg-white/[0.04]"
        >
          <span className="size-9 rounded-[10px] bg-nirvash-red/12 border border-nirvash-red/25 flex items-center justify-center shrink-0 text-nirvash-red">
            {icon}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] font-semibold text-white truncate">{title}</span>
            <span className="block text-[12px] text-white/40 truncate">{subtitle}</span>
          </span>
          <ChevronDown className={cn("size-4 text-white/40 transition-transform shrink-0", open && "rotate-180")} />
        </button>
        {onMove && (
          <>
            <button type="button" aria-label="Move up" title="Move up" disabled={first} onClick={() => onMove(-1)} className={iconBtn}>
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" aria-label="Move down" title="Move down" disabled={last} onClick={() => onMove(1)} className={iconBtn}>
              <ArrowDown className="size-3.5" />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/8">
          {children}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (empty || window.confirm(`Remove "${title}"?`)) onRemove();
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/45 hover:text-nirvash-red transition-colors"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
