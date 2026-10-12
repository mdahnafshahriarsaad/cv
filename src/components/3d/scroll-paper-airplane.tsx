"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/**
 * ScrollPaperAirplane — a persistent paper airplane that flies
 * through the entire website as the user scrolls.
 *
 * Strategy: Always render the CSS/SVG fallback first (guaranteed visible),
 * then attempt to upgrade to 3D (Three.js) if WebGL is available.
 * This ensures the airplane is ALWAYS visible, even in headless/preview environments.
 */

// 3D version — loaded only on client, only if WebGL works
const Airplane3D = dynamic(
  () => import("@/components/3d/airplane-3d").then((m) => m.Airplane3D),
  { ssr: false }
);

export function ScrollPaperAirplane() {
  const scrollProgressRef = React.useRef(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [use3D, setUse3D] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Mount + checks
  React.useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    // Check WebGL — only enable 3D if we can actually create a context AND it's not a headless renderer
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
                 canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
      if (!gl) {
        setUse3D(false);
      } else {
        // Verify the context actually works by checking parameters
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "";
        // If we can't get a real renderer string, it's likely a software renderer that won't work
        if (!renderer || renderer.includes("SwiftShader") || renderer.includes("llvmpipe")) {
          setUse3D(false);
        } else {
          setUse3D(true);
        }
      }
    } catch {
      setUse3D(false);
    }

    const onResize = () => checkMobile();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Track scroll progress
  React.useEffect(() => {
    if (reducedMotion) return;

    let rafId = -1;
    const updateScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      scrollProgressRef.current = Math.max(0, Math.min(1, progress));
      rafId = -1;
    };

    const onScroll = () => {
      if (rafId === -1) rafId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId > 0) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // Not mounted yet (SSR) — render nothing
  if (!mounted) return null;

  // Reduced motion: static
  if (reducedMotion) {
    return (
      <div
        className="fixed top-1/2 right-8 -translate-y-1/2 z-[5] pointer-events-none opacity-25"
        aria-hidden="true"
      >
        <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
          <path d="M5 30 L55 10 L35 30 L55 50 Z" fill="#FAFAF8" stroke="#FF4336" strokeWidth="0.5" />
        </svg>
      </div>
    );
  }

  // 3D mode (WebGL available)
  if (use3D) {
    return <Airplane3D scrollProgressRef={scrollProgressRef} isMobile={isMobile} />;
  }

  // Fallback: CSS/SVG airplane (always visible)
  return <FallbackAirplane scrollProgressRef={scrollProgressRef} isMobile={isMobile} />;
}

/**
 * CSS/SVG fallback airplane — scroll-driven 2D movement.
 * Always visible, no WebGL required.
 */
function FallbackAirplane({
  scrollProgressRef,
  isMobile,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
}) {
  const airplaneRef = React.useRef<HTMLDivElement>(null);
  const smoothScroll = React.useRef(0);
  const idleTime = React.useRef(0);
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    let mounted = true;

    const animate = () => {
      if (!mounted) return;
      const el = airplaneRef.current;
      if (el) {
        const target = scrollProgressRef.current;
        smoothScroll.current += (target - smoothScroll.current) * 0.08;

        const t = smoothScroll.current;

        // Flight path: right → center-left → right → center
        // X: starts at 75% (right), moves to -30% (off left), comes back
        const x = 75 - t * 110 + Math.sin(t * Math.PI * 2) * 10;
        // Y: gentle wave
        const y = 25 + Math.sin(t * Math.PI * 2.5) * 20;
        // Rotation: banking based on horizontal movement direction
        const rotation = Math.cos(t * Math.PI * 2) * 12;
        // Scale: slightly smaller over time
        const scale = (1 - t * 0.15) * (isMobile ? 0.55 : 0.85);

        // Idle float
        const isScrolling = Math.abs(target - smoothScroll.current) > 0.001;
        if (!isScrolling) {
          idleTime.current += 0.016;
        }
        const idleY = isScrolling ? 0 : Math.sin(idleTime.current * 0.7) * 2;
        const idleRot = isScrolling ? 0 : Math.sin(idleTime.current * 0.5) * 1.5;

        el.style.transform = `translate(${x}vw, ${y + idleY}vh) rotate(${rotation + idleRot}deg) scale(${scale})`;
        el.style.opacity = String(Math.max(0.7, 0.95 - Math.abs(t - 0.5) * 0.1));
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [scrollProgressRef, isMobile]);

  return (
    <div
      ref={airplaneRef}
      className="fixed z-[5] pointer-events-none"
      aria-hidden="true"
      style={{
        top: 0,
        left: 0,
        willChange: "transform, opacity",
        filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.4))",
      }}
    >
      <svg width={isMobile ? "48" : "80"} height={isMobile ? "48" : "80"} viewBox="0 0 60 60" fill="none">
        {/* Paper airplane — top wing */}
        <path d="M5 30 L55 8 L38 30 Z" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="0.5" />
        {/* Bottom wing (slightly darker for depth) */}
        <path d="M5 30 L38 30 L55 52 Z" fill="#F0F0F0" stroke="#E0E0E0" strokeWidth="0.5" />
        {/* Center fold line — ruby red accent */}
        <line x1="5" y1="30" x2="38" y2="30" stroke="#FF4336" strokeWidth="1.5" opacity="0.9" />
        {/* Wing crease */}
        <line x1="38" y1="30" x2="55" y2="8" stroke="#D5D5D5" strokeWidth="0.5" opacity="0.6" />
      </svg>
    </div>
  );
}
