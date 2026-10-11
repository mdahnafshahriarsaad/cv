"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * GSAP-powered scroll-triggered text reveal.
 * Words fade in + slide up sequentially as the heading enters the viewport.
 */
export function GsapTextReveal({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
}: {
  children: string;
  as?: React.ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>(".gsap-word");
    if (words.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(words, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.06,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [children, delay]);

  const words = children.split(" ");

  return (
    <Tag ref={ref as any} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span className="gsap-word inline-block">{word}&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
}
