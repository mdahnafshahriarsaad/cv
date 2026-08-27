"use client";

import * as React from "react";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { CVDocument } from "@/lib/cv-data/types";
import { cn } from "@/lib/utils";

/**
 * Correctly-scaled miniature A4 CV preview.
 *
 * The trick: render the full-size CV (794px wide) inside a wrapper that is
 * exactly `width * scale` × `height * scale`, with the inner content scaled
 * from `top left`. This avoids the clipping / centering issues that arise
 * when you scale a flex-centered element.
 *
 * A4 ratio = 210:297 ≈ 1:1.414
 */

const A4_W = 794;
const A4_H = Math.round(A4_W * 1.414); // 1123

export function CVPreview({
  cv,
  scale = 0.4,
  className,
  showShadow = true,
}: {
  cv: CVDocument;
  scale?: number;
  className?: string;
  showShadow?: boolean;
}) {
  const w = A4_W * scale;
  const h = A4_H * scale;
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width: w, height: h }}
    >
      <div
        style={{
          width: A4_W,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CVRenderer cv={cv} width={A4_W} showShadow={showShadow} />
      </div>
    </div>
  );
}

/**
 * A4-shaped skeleton placeholder shown while a preview is loading.
 */
export function A4Skeleton({ scale = 0.4, className }: { scale?: number; className?: string }) {
  const w = A4_W * scale;
  const h = A4_H * scale;
  return (
    <div
      className={cn("relative overflow-hidden bg-white", className)}
      style={{ width: w, height: h }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 p-[8%] space-y-3">
        <div className="h-[6%] w-[55%] rounded bg-neutral-200 shimmer" />
        <div className="h-[3%] w-[35%] rounded bg-neutral-200 shimmer" />
        <div className="h-[2%] w-full rounded bg-neutral-100 mt-[4%]" />
        <div className="h-[2%] w-[90%] rounded bg-neutral-100" />
        <div className="h-[2%] w-[85%] rounded bg-neutral-100" />
        <div className="h-[2%] w-full rounded bg-neutral-200 mt-[4%]" />
        <div className="h-[3%] w-[40%] rounded bg-neutral-200 mt-[3%]" />
        <div className="h-[2%] w-[88%] rounded bg-neutral-100" />
        <div className="h-[2%] w-[80%] rounded bg-neutral-100" />
        <div className="h-[2%] w-full rounded bg-neutral-200 mt-[4%]" />
        <div className="h-[3%] w-[35%] rounded bg-neutral-200 mt-[3%]" />
        <div className="h-[2%] w-[90%] rounded bg-neutral-100" />
      </div>
    </div>
  );
}

/**
 * Lazy-mounted CV preview. Shows an A4 skeleton until the element approaches
 * the viewport, then renders the full CV. Stays mounted once revealed.
 */
export function LazyCVPreview({
  cv,
  scale = 0.4,
  className,
  rootMargin = "200px",
}: {
  cv: CVDocument;
  scale?: number;
  className?: string;
  rootMargin?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {shown ? (
        <CVPreview cv={cv} scale={scale} showShadow={false} />
      ) : (
        <A4Skeleton scale={scale} />
      )}
    </div>
  );
}
