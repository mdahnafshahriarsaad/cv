"use client";

import * as React from "react";
import SplitType from "split-type";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Split-Type powered char-by-char reveal.
 * Characters animate in individually with a stagger as the text scrolls into view.
 */
export function SplitTextReveal({
  children,
  className,
  as: Tag = "p",
  stagger = 0.02,
}: {
  children: string;
  className?: string;
  as?: React.ElementType;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const split = new SplitType(el, { types: "chars, words" });
    const chars = el.querySelectorAll<HTMLElement>(".char");

    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(chars, {
        y: "100%",
        opacity: 0,
        duration: 0.6,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => {
      ctx.revert();
      split.revert();
    };
  }, [children, stagger]);

  return <Tag ref={ref as any} className={className}>{children}</Tag>;
}
