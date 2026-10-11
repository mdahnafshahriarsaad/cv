"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { CVRenderer } from "@/components/templates/cv-renderer";
import { CVDocument } from "@/lib/cv-data/types";

/**
 * Premium animated CV preview stack for the hero.
 *
 * Features:
 * - 3D mouse parallax tilt (spring physics, no re-renders)
 * - Multi-layer depth: back pages float at different speeds + rotations
 * - Scroll parallax (moves slower than content)
 * - Ambient red glow that pulses
 * - Entrance: staggered scale + blur reveal
 * - Subtle perpetual floating on all layers
 * - Spotlight sheen that follows the cursor
 */
export function HeroCVStack({ cv }: { cv: CVDocument }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  // spotlight position
  const sx = useMotionValue(50);
  const sy = useMotionValue(50);
  const sheenX = useTransform(sx, (v) => `${v}%`);
  const sheenY = useTransform(sy, (v) => `${v}%`);

  // scroll parallax
  const { scrollY } = useScroll();
  const yBack = useTransform(scrollY, [0, 600], [0, 60]);
  const yMid = useTransform(scrollY, [0, 600], [0, 30]);
  const yFront = useTransform(scrollY, [0, 600], [0, 12]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px - 0.5);
    my.set(py - 0.5);
    sx.set(px * 100);
    sy.set(py * 100);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    sx.set(50);
    sy.set(50);
  };

  return (
    <motion.div
      style={{ y: yFront, opacity }}
      className="hidden lg:flex justify-center"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1400 }}
        className="relative"
      >
        {/* Ambient red glow behind stack */}
        <motion.div
          className="absolute inset-0 -m-24 rounded-full bg-nirvash-red/15 blur-3xl pointer-events-none"
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Secondary deep-ruby glow */}
        <motion.div
          className="absolute inset-0 -m-16 rounded-full bg-nirvash-ruby/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative"
        >
          <div className="relative" style={{ width: 460, height: 620 }}>
            {/* Back page 2 — deepest, slowest float, most rotated */}
            <motion.div
              style={{ y: yBack }}
              className="absolute"
            >
              <motion.div
                className="absolute paper-shadow-sm bg-white rounded-lg"
                style={{
                  width: 380, height: 500,
                  top: 70, left: 85,
                  rotate: "8deg",
                  opacity: 0.3,
                  transform: "translateZ(-60px)",
                }}
                animate={{ y: [0, -10, 0], rotate: [8, 9, 8] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Back page 1 — mid depth, medium float */}
            <motion.div
              style={{ y: yMid }}
              className="absolute"
            >
              <motion.div
                className="absolute paper-shadow-sm bg-white rounded-lg overflow-hidden"
                style={{
                  width: 390, height: 510,
                  top: 45, left: 55,
                  rotate: "-5deg",
                  opacity: 0.5,
                  transform: "translateZ(-30px)",
                }}
                animate={{ y: [0, -7, 0], rotate: [-5, -6, -5] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              >
                {/* faint content lines on back page */}
                <div className="p-8 space-y-2 opacity-40">
                  <div className="h-3 w-2/3 rounded bg-neutral-200" />
                  <div className="h-2 w-1/2 rounded bg-neutral-200 mt-3" />
                  <div className="h-1.5 w-full rounded bg-neutral-100 mt-4" />
                  <div className="h-1.5 w-5/6 rounded bg-neutral-100" />
                  <div className="h-1.5 w-4/5 rounded bg-neutral-100" />
                </div>
              </motion.div>
            </motion.div>

            {/* Main CV — front, clearest, gentle float */}
            <motion.div
              className="absolute float-y-slow"
              style={{ top: 0, left: 20, transform: "translateZ(0px)" }}
            >
              <motion.div
                initial={{ filter: "blur(8px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="origin-top-left relative"
                style={{ transform: "scale(0.54)" }}
              >
                <CVRenderer cv={cv} width={794} showShadow />
                {/* Cursor spotlight sheen overlay */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-sm"
                  style={{
                    background: useTransform(
                      [sheenX, sheenY],
                      ([x, y]) =>
                        `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.12), transparent 40%)`
                    ),
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Floating accent badge — "PRO" or template name */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -left-4 top-12 z-20"
              style={{ transform: "translateZ(40px)" }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 rounded-full bg-nirvash-red px-3.5 py-1.5 shadow-lg shadow-nirvash-red/40"
              >
                <span className="size-1.5 rounded-full bg-white" />
                <span className="text-[11px] font-bold tracking-wider text-white uppercase">Vertex Template</span>
              </motion.div>
            </motion.div>

            {/* Floating "ATS Friendly" badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -right-2 bottom-20 z-20"
              style={{ transform: "translateZ(50px)" }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="flex items-center gap-2 rounded-full bg-[#212121] border border-white/15 px-3.5 py-1.5 shadow-xl backdrop-blur-md"
              >
                <svg viewBox="0 0 24 24" className="size-3.5 text-nirvash-red" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-[11px] font-bold tracking-wider text-white uppercase">ATS Friendly</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
