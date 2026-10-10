"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import * as React from "react";

/**
 * 3D floating geometric objects for the hero background.
 * Uses CSS 3D transforms + framer-motion for smooth perpetual rotation.
 * Adds depth and visual interest without distracting from content.
 */
export function Floating3DObjects() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 100]);
  const y2 = useTransform(scrollY, [0, 800], [0, -60]);
  const y3 = useTransform(scrollY, [0, 800], [0, 40]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: "1000px" }}>
      {/* Floating cube — top right area */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-[15%] right-[8%]"
      >
        <motion.div
          animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative size-16"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* 6 faces of a cube */}
          {[
            { transform: "translateZ(32px)", bg: "rgba(255,67,54,0.08)" },
            { transform: "rotateY(180deg) translateZ(32px)", bg: "rgba(255,67,54,0.06)" },
            { transform: "rotateY(90deg) translateZ(32px)", bg: "rgba(255,67,54,0.05)" },
            { transform: "rotateY(-90deg) translateZ(32px)", bg: "rgba(255,67,54,0.07)" },
            { transform: "rotateX(90deg) translateZ(32px)", bg: "rgba(255,67,54,0.04)" },
            { transform: "rotateX(-90deg) translateZ(32px)", bg: "rgba(255,67,54,0.09)" },
          ].map((face, i) => (
            <div
              key={i}
              className="absolute inset-0 border border-white/10 rounded-lg backdrop-blur-sm"
              style={{ transform: face.transform, background: face.bg }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Floating pyramid — mid left area */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[60%] left-[5%]"
      >
        <motion.div
          animate={{ rotateZ: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative w-0 h-0" style={{
            borderLeft: "24px solid transparent",
            borderRight: "24px solid transparent",
            borderBottom: "42px solid rgba(183,28,28,0.1)",
            filter: "blur(0.5px)",
          }} />
        </motion.div>
      </motion.div>

      {/* Floating ring — bottom right */}
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-[10%] right-[15%]"
      >
        <motion.div
          animate={{ rotateX: [0, 360], rotateZ: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="size-20 rounded-full border-2 border-white/8"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-2 rounded-full border border-nirvash-red/15" />
        </motion.div>
      </motion.div>

      {/* Small floating dots — scattered */}
      {[
        { top: "25%", left: "15%", size: 4, delay: 0 },
        { top: "45%", left: "80%", size: 6, delay: 1 },
        { top: "70%", left: "40%", size: 3, delay: 2 },
        { top: "35%", left: "60%", size: 5, delay: 0.5 },
        { top: "80%", left: "70%", size: 4, delay: 1.5 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-nirvash-red/20"
          style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
        />
      ))}
    </div>
  );
}
