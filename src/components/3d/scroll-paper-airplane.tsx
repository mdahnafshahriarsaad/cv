"use client";

import * as React from "react";

/**
 * ScrollPaperAirplane — a persistent paper airplane that flies
 * through the website as the user scrolls.
 *
 * SVG-based for maximum performance (no WebGL overhead).
 * Small, smooth, and elegant.
 */
export function ScrollPaperAirplane() {
  const airplaneRef = React.useRef<HTMLDivElement>(null);
  const trailRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef(0);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    // Scroll tracking — passive, rAF-batched
    let scrollRaf = -1;
    const updateScroll = () => {
      const sh = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = sh > 0 ? Math.max(0, Math.min(1, window.scrollY / sh)) : 0;
      scrollRaf = -1;
    };
    const onScroll = () => {
      if (scrollRaf === -1) scrollRaf = requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { checkMobile(); onScroll(); }, { passive: true });

    // Flight path — smooth S-curve across the page
    const wp: [number, number][] = [
      [78, 28], [58, 18], [30, 30], [5, 45], [-10, 58],
      [5, 68], [30, 72], [55, 58], [40, 42], [22, 50],
    ];

    // Catmull-Rom interpolation
    const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => {
      const t2 = t * t, t3 = t2 * t;
      return 0.5 * (2*p1 + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3);
    };

    const getPos = (t: number): [number, number] => {
      const n = wp.length - 1;
      const i = Math.min(Math.floor(t * n), n - 1);
      const lt = t * n - i;
      const p0 = wp[Math.max(0, i-1)], p1 = wp[i], p2 = wp[i+1], p3 = wp[Math.min(n, i+2)];
      return [cr(p0[0],p1[0],p2[0],p3[0],lt), cr(p0[1],p1[1],p2[1],p3[1],lt)];
    };

    // Animation loop — single rAF, no React state updates
    let raf = 0;
    let running = true;
    let smooth = 0;
    let smoothAngle = 0;
    let lastSmooth = 0;
    let lastDir = 1;
    let idleTime = 0;
    let lastFrame = performance.now();

    const animate = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;

      const el = airplaneRef.current;
      const trail = trailRef.current;

      if (el) {
        const target = scrollRef.current;
        // Damped scroll — smooth but responsive
        smooth += (target - smooth) * Math.min(dt * 8, 1);
        const t = Math.max(0, Math.min(1, smooth));
        const isScrolling = Math.abs(target - smooth) > 0.003;

        // Position
        const [x, y] = getPos(t);

        // Direction from actual movement
        const dir = smooth > lastSmooth + 0.0002 ? 1 : smooth < lastSmooth - 0.0002 ? -1 : 0;
        if (dir !== 0) lastDir = dir;
        const ed = dir !== 0 ? dir : lastDir;
        const eps = 0.004;
        const sT = ed >= 0 ? Math.min(1, t + eps) : Math.max(0, t - eps);
        const [xs, ys] = getPos(sT);
        const dx = xs - x;
        const dy = ys - y;

        // Angle — nose points in travel direction
        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // Smooth angle with fast snap on reversal
        let diff = targetAngle - smoothAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        const speed = Math.abs(diff) > 60 ? 0.4 : 0.18;
        smoothAngle += diff * speed;

        // Banking
        const sT2 = Math.min(1, t + eps * 2);
        const [xs2, ys2] = getPos(sT2);
        const cross = (xs - x) * (ys2 - ys) - (ys - y) * (xs2 - xs);
        const bank = Math.max(-12, Math.min(12, cross * 60));

        // Idle
        if (!isScrolling) idleTime += dt; else idleTime *= 0.9;
        const idleY = Math.sin(idleTime * 0.8) * 0.8;
        const idleRot = Math.sin(idleTime * 0.5) * 1;

        // Scale — smaller for elegance
        const mobile = window.innerWidth < 768;
        const scale = (1 - t * 0.06) * (mobile ? 0.45 : 0.6);
        const vw = window.innerWidth / 100;
        const vh = window.innerHeight / 100;

        const finalAngle = smoothAngle + idleRot + bank * 0.2;

        el.style.transform = `translate3d(${x * vw}px, ${(y + idleY) * vh}px, 0) rotate(${finalAngle}deg) scale(${scale})`;
        el.style.opacity = String(Math.max(0.85, 0.95 - Math.abs(t - 0.5) * 0.05));

        // Trail — only when moving
        if (trail) {
          const tdx = -dx * 2.5, tdy = -dy * 2.5;
          trail.style.transform = `translate3d(${(x + tdx) * vw}px, ${(y + tdy) * vh}px, 0) rotate(${smoothAngle}deg) scale(${scale * 0.45})`;
          trail.style.opacity = String(isScrolling ? Math.min(0.15, Math.abs(target - smooth) * 1.5) : 0);
        }

        lastSmooth = smooth;
      }
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* Trail */}
      <div
        ref={trailRef}
        className="fixed z-[4] pointer-events-none"
        aria-hidden="true"
        style={{ top: 0, left: 0, willChange: "transform, opacity", filter: "blur(6px)" }}
      >
        <PlaneSVG size={isMobile ? 24 : 36} />
      </div>

      {/* Airplane */}
      <div
        ref={airplaneRef}
        className="fixed z-[5] pointer-events-none"
        aria-hidden="true"
        style={{
          top: 0, left: 0, willChange: "transform, opacity",
          filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(255,67,54,0.1))",
        }}
      >
        <PlaneSVG size={isMobile ? 36 : 56} />
      </div>
    </>
  );
}

/**
 * Compact, elegant paper airplane SVG.
 * Nose at right (x=92), tail with notch at left (x=8).
 * 3D effect via two-tone wings + spine shadow + gradients.
 */
function PlaneSVG({ size }: { size: number }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gt-${id}`} x1="10%" y1="10%" x2="90%" y2="60%">
          <stop offset="0%" stopColor="#EAEAEA" />
          <stop offset="40%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F5F5" />
        </linearGradient>
        <linearGradient id={`gb-${id}`} x1="10%" y1="90%" x2="90%" y2="40%">
          <stop offset="0%" stopColor="#C8C8C8" />
          <stop offset="50%" stopColor="#DCDCDC" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </linearGradient>
      </defs>
      {/* Top wing */}
      <path d="M92 50 L8 12 L54 50 Z" fill={`url(#gt-${id})`} stroke="#DDD" strokeWidth="0.4" />
      {/* Bottom wing */}
      <path d="M92 50 L54 50 L8 88 Z" fill={`url(#gb-${id})`} stroke="#CCC" strokeWidth="0.4" />
      {/* Spine shadow */}
      <path d="M92 50 L54 50 L54 51.5 L92 50.8 Z" fill="#B8B8B8" opacity="0.4" />
      {/* Tail notch */}
      <path d="M8 12 L16 50 L8 88 Z" fill="#212121" opacity="0.12" />
      <path d="M8 12 L16 50 L8 88" stroke="#C0C0C0" strokeWidth="0.4" fill="none" />
      {/* Red accent line */}
      <line x1="18" y1="50" x2="90" y2="50" stroke="#FF4336" strokeWidth="1.2" opacity="0.75" strokeLinecap="round" />
      {/* Wing creases */}
      <line x1="54" y1="50" x2="8" y2="12" stroke="#D0D0D0" strokeWidth="0.3" opacity="0.5" />
      <line x1="54" y1="50" x2="8" y2="88" stroke="#D0D0D0" strokeWidth="0.3" opacity="0.5" />
      {/* Nose tip */}
      <circle cx="91" cy="50" r="1" fill="#FFF" />
      <circle cx="90" cy="50" r="0.6" fill="#FF4336" opacity="0.6" />
    </svg>
  );
}
