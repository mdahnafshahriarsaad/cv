"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Spotlight border card — the border illuminates dynamically under the cursor.
 * Uses a CSS custom property --mx/--my updated via mousemove, with a radial
 * gradient border that follows the cursor. No React state = no re-renders.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 67, 54, 0.6)",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  spotlightColor?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "group relative rounded-[16px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        className
      )}
      style={{
        // spotlight border via masked radial gradient
        background: `
          radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), ${spotlightColor}, transparent 70%),
          var(--card-bg, rgba(255,255,255,0.02))
        `,
      }}
      {...props}
    >
      {/* inner content layer — sits above the spotlight */}
      <div className="relative z-10 rounded-[15px] overflow-hidden bg-[#1a1a1a] h-full">
        {children}
      </div>
    </div>
  );
}
