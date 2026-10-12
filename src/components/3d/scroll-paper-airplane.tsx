"use client";

import * as React from "react";

/**
 * ScrollPaperAirplane — a persistent paper airplane that flies
 * through the entire website as the user scrolls.
 *
 * Uses a richly animated SVG with CSS 3D transforms for reliable
 * rendering in ALL environments (no WebGL dependency).
 *
 * Features:
 * - Scroll-driven flight path across the full page
 * - 3D perspective tilt (rotateX/rotateY) for depth
 * - Banking turns, pitch adjustments
 * - Idle floating when not scrolling
 * - Motion trail (fading duplicate)
 * - pointer-events: none, z-index: 5
 * - Responsive + reduced-motion support
 */
export function ScrollPaperAirplane() {
  const scrollProgressRef = React.useRef(0);
  const airplaneRef = React.useRef<HTMLDivElement>(null);
  const trailRef = React.useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Mount + preferences
  React.useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  // Animation loop
  React.useEffect(() => {
    if (reducedMotion || !mounted) return;

    let raf = 0;
    let isRunning = true;
    let smooth = 0;
    let idleTime = 0;

    const animate = () => {
      if (!isRunning) return;

      const el = airplaneRef.current;
      const trail = trailRef.current;
      if (el) {
        const target = scrollProgressRef.current;
        smooth += (target - smooth) * 0.07;
        const t = smooth;
        const isScrolling = Math.abs(target - smooth) > 0.002;

        // ═══ Flight Path ═══
        // 10 waypoints mapping scroll 0→1 to screen position
        // The plane sweeps across the screen in a graceful S-curve

        // X position (vw): starts right, sweeps left, comes back
        const xPoints = [75, 55, 25, -5, -20, -5, 25, 55, 40, 20];
        // Y position (vh): stays within viewport (10-80)
        const yPoints = [25, 15, 25, 40, 55, 65, 70, 55, 40, 50];

        // Interpolate between waypoints
        const segCount = xPoints.length - 1;
        const segT = t * segCount;
        const segIdx = Math.min(Math.floor(segT), segCount - 1);
        const segFrac = segT - segIdx;

        // Smooth interpolation (ease in-out)
        const ease = segFrac * segFrac * (3 - 2 * segFrac);
        const x = xPoints[segIdx] + (xPoints[segIdx + 1] - xPoints[segIdx]) * ease;
        const y = yPoints[segIdx] + (yPoints[segIdx + 1] - yPoints[segIdx]) * ease;

        // Direction of travel for rotation
        // SVG points right (nose at x=92), so we need to add the angle
        // of the direction vector. atan2 gives angle from +X axis.
        // For a plane pointing right, rotation = atan2(dy, dx) in degrees.
        // But we want the nose to lead, so we use the angle directly.
        const dx = xPoints[segIdx + 1] - xPoints[segIdx];
        const dy = yPoints[segIdx + 1] - yPoints[segIdx];
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // Idle floating
        if (!isScrolling) {
          idleTime += 0.016;
        }
        const idleY = isScrolling ? 0 : Math.sin(idleTime * 0.8) * 1.5;
        const idleRot = isScrolling ? 0 : Math.sin(idleTime * 0.6) * 2;

        // Scale (slightly smaller towards end + mobile)
        const scale = (1 - t * 0.1) * (isMobile ? 0.6 : 1.0);

        // 3D perspective tilt (very subtle — disabled to prevent projection issues)
        // const tiltY = Math.sin(t * Math.PI * 1.5) * 8;
        // const tiltX = Math.cos(t * Math.PI * 2) * 4;

        // Convert vh/vw to pixels for reliability
        const vw = window.innerWidth / 100;
        const vh = window.innerHeight / 100;

        const transform = `translate3d(${x * vw}px, ${y * vh + idleY * vh}px, 0) rotate(${angle + idleRot}deg) scale(${scale})`;
        el.style.transform = transform;
        el.style.opacity = String(Math.max(0.75, 0.95 - Math.abs(t - 0.5) * 0.08));

        // Trail follows slightly behind
        if (trail) {
          const trailX = x - dx * 0.3;
          const trailY = y - dy * 0.3;
          trail.style.transform = `translate3d(${trailX * vw}px, ${trailY * vh}px, 0) rotate(${angle}deg) scale(${scale * 0.6})`;
          trail.style.opacity = String(Math.max(0, 0.3 - Math.abs(target - smooth) * 0.5));
        }
      }
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => {
      isRunning = false;
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, mounted, isMobile]);

  if (!mounted) return null;

  // Reduced motion: static
  if (reducedMotion) {
    return (
      <div
        className="fixed top-1/2 right-8 -translate-y-1/2 z-[5] pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <PaperAirplaneSVG size={50} />
      </div>
    );
  }

  return (
    <>
      {/* Motion trail (fading duplicate behind the airplane) */}
      <div
        ref={trailRef}
        className="fixed z-[4] pointer-events-none"
        aria-hidden="true"
        style={{
          top: 0,
          left: 0,
          willChange: "transform, opacity",
          filter: "blur(4px)",
        }}
      >
        <PaperAirplaneSVG size={isMobile ? 48 : 80} />
      </div>

      {/* Main airplane */}
      <div
        ref={airplaneRef}
        className="fixed z-[5] pointer-events-none"
        aria-hidden="true"
        style={{
          top: 0,
          left: 0,
          willChange: "transform, opacity",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 12px rgba(255,67,54,0.2))",
        }}
      >
        <PaperAirplaneSVG size={isMobile ? 56 : 100} />
      </div>
    </>
  );
}

/**
 * Detailed SVG paper airplane — white paper with ruby-red center fold.
 */
function PaperAirplaneSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top wing (lighter) */}
      <path
        d="M8 50 L92 12 L62 50 Z"
        fill="#FFFFFF"
        stroke="#E0E0E0"
        strokeWidth="0.8"
      />
      {/* Bottom wing (slightly darker for depth) */}
      <path
        d="M8 50 L62 50 L92 88 Z"
        fill="#EAEAEA"
        stroke="#D5D5D5"
        strokeWidth="0.8"
      />
      {/* Center fold shadow */}
      <path
        d="M8 50 L62 50 L62 52 L8 51 Z"
        fill="#D0D0D0"
        opacity="0.5"
      />
      {/* Ruby-red accent line along the center fold */}
      <line
        x1="8"
        y1="50"
        x2="62"
        y2="50"
        stroke="#FF4336"
        strokeWidth="2"
        opacity="0.85"
      />
      {/* Wing crease lines (subtle) */}
      <line
        x1="62"
        y1="50"
        x2="92"
        y2="12"
        stroke="#CCCCCC"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <line
        x1="62"
        y1="50"
        x2="92"
        y2="88"
        stroke="#CCCCCC"
        strokeWidth="0.6"
        opacity="0.5"
      />
      {/* Nose highlight */}
      <circle cx="91" cy="50" r="1.5" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}
