"use client";

import { motion, useInView, type Variants } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  as = "div",
  blur = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: React.ElementType;
  blur?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag
      ref={ref}
      initial={blur ? { opacity: 0, y, filter: "blur(8px)" } : { opacity: 0, y }}
      animate={
        inView
          ? blur
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 1, y: 0 }
          : blur
          ? { opacity: 0, y, filter: "blur(8px)" }
          : { opacity: 0, y }
      }
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
