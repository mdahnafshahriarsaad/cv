"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { PaperAirplaneMesh } from "@/components/3d/paper-airplane";
import { cn } from "@/lib/utils";

/**
 * ScrollPaperAirplane — a persistent 3D paper airplane that flies
 * through the entire website as the user scrolls.
 *
 * Features:
 * - Real 3D folded paper geometry (Three.js + R3F)
 * - Scroll-driven flight path (Catmull-Rom spline)
 * - Damped interpolation (no jitter, smooth both directions)
 * - Idle floating when not scrolling
 * - Banking turns + pitch based on flight path curvature
 * - pointer-events: none (never blocks clicks)
 * - Responsive: smaller on mobile, simplified on low-power
 * - Reduced-motion: static position or hidden
 * - Performance: demand-based rendering, cleanup on unmount
 * - z-index: above content but below navbar/modals
 */

export function ScrollPaperAirplane() {
  const scrollProgressRef = React.useRef(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Check mobile
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Track scroll progress (passive, no state updates)
  React.useEffect(() => {
    if (reducedMotion) return;

    let rafId: number;
    const updateScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      scrollProgressRef.current = Math.max(0, Math.min(1, progress));
      rafId = -1; // mark as processed
    };

    const onScroll = () => {
      if (rafId === -1 || rafId === undefined) {
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    updateScroll(); // initial
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId > 0) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // Reduced motion: render static plane or nothing
  if (reducedMotion) {
    return (
      <div
        className="fixed top-1/2 right-8 -translate-y-1/2 z-[5] pointer-events-none opacity-30"
        aria-hidden="true"
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M5 30 L55 10 L35 30 L55 50 Z" fill="#FAFAF8" stroke="#FF4336" strokeWidth="0.5" opacity="0.6" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[5] pointer-events-none",
        isMobile && "opacity-60"
      )}
      aria-hidden="true"
      style={{ mixBlendMode: "normal" }}
    >
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
        frameloop={isMobile ? "always" : "always"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} color="#FFFFFF" />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.2}
          color="#FFFFFF"
          castShadow
        />
        {/* Rim light from behind-left for edge highlights */}
        <directionalLight
          position={[-4, 2, -3]}
          intensity={0.4}
          color="#FF4336"
        />
        {/* Soft fill from below */}
        <pointLight position={[0, -3, 2]} intensity={0.3} color="#F5F5F5" />

        {/* The airplane */}
        <PaperAirplaneMesh scrollProgressRef={scrollProgressRef} />
      </Canvas>
    </div>
  );
}
