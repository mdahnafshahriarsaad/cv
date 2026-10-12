"use client";

import * as React from "react";

export function ScrollPaperAirplane() {
  const airplaneRef = React.useRef<HTMLDivElement>(null);
  const trailRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef(0);
  const [isMobile, setIsMobile] = React.useState(false);

  // Single effect: scroll tracking + animation + responsive
  React.useEffect(() => {
    // Reduced motion check
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return; // don't animate

    // Mobile check
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    // Scroll tracking
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

    // Flight path waypoints [x(vw), y(vh)]
    const wp: [number, number][] = [
      [72, 20], [50, 12], [20, 22], [-5, 38], [-15, 55],
      [0, 68], [25, 72], [50, 55], [35, 38], [15, 45],
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

    // Animation loop
    let raf = 0;
    let running = true;
    let smooth = 0;
    let smoothAngle = 0;
    let lastSmooth = 0;
    let idleTime = 0;
    let mobile = window.innerWidth < 768;

    const animate = () => {
      if (!running) return;
      const el = airplaneRef.current;
      const trail = trailRef.current;

      if (el) {
        const target = scrollRef.current;
        smooth += (target - smooth) * 0.06;
        const t = Math.max(0, Math.min(1, smooth));
        const isScrolling = Math.abs(target - smooth) > 0.002;

        // Position
        const [x, y] = getPos(t);

        // Direction: detect scroll direction for nose orientation
        const dir = smooth > lastSmooth ? 1 : smooth < lastSmooth ? -1 : 0;
        const eps = 0.005;
        const sT = dir >= 0 ? Math.min(1, t + eps) : Math.max(0, t - eps);
        const [xs, ys] = getPos(sT);
        const dx = dir >= 0 ? xs - x : x - xs;
        const dy = dir >= 0 ? ys - y : y - ys;
        let targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // Smooth angle
        let diff = targetAngle - smoothAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        smoothAngle += diff * 0.12;

        // Banking via curvature
        const sT2 = Math.min(1, t + eps * 2);
        const [xs2, ys2] = getPos(sT2);
        const cross = (xs - x) * (ys2 - ys) - (ys - y) * (xs2 - xs);
        const bank = Math.max(-15, Math.min(15, cross * 80));

        // Idle
        if (!isScrolling) idleTime += 0.016; else idleTime *= 0.95;
        const idleY = Math.sin(idleTime * 0.8) * 1.2;
        const idleRot = Math.sin(idleTime * 0.5) * 1.5;

        // Scale
        const scale = (1 - t * 0.08) * (mobile ? 0.55 : 0.85);

        // Pixels
        const vw = window.innerWidth / 100;
        const vh = window.innerHeight / 100;

        // Apply
        const finalAngle = smoothAngle + idleRot + bank * 0.3;
        el.style.transform = `translate3d(${x*vw}px, ${(y+idleY)*vh}px, 0) rotate(${finalAngle}deg) scale(${scale})`;
        el.style.opacity = String(Math.max(0.8, 0.95 - Math.abs(t - 0.5) * 0.06));

        // Trail
        if (trail) {
          const tdx = -dx * 3, tdy = -dy * 3;
          trail.style.transform = `translate3d(${(x+tdx)*vw}px, ${(y+tdy)*vh}px, 0) rotate(${smoothAngle}deg) scale(${scale*0.5})`;
          trail.style.opacity = String(isScrolling ? Math.min(0.25, Math.abs(target-smooth)*2) : 0);
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
        <PaperAirplaneSVG size={isMobile ? 40 : 70} />
      </div>

      {/* Airplane */}
      <div
        ref={airplaneRef}
        className="fixed z-[5] pointer-events-none"
        aria-hidden="true"
        style={{
          top: 0, left: 0, willChange: "transform, opacity",
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.7)) drop-shadow(0 0 15px rgba(255,67,54,0.15))",
        }}
      >
        <PaperAirplaneSVG size={isMobile ? 56 : 100} />
      </div>
    </>
  );
}

function PaperAirplaneSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 50 L92 10 L60 50 Z" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="0.6" />
      <path d="M8 50 L60 50 L92 90 Z" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="0.6" />
      <path d="M8 50 L60 50 L60 51.5 L8 50.5 Z" fill="#C8C8C8" opacity="0.4" />
      <line x1="8" y1="50" x2="60" y2="50" stroke="#FF4336" strokeWidth="1.8" opacity="0.85" strokeLinecap="round" />
      <line x1="60" y1="50" x2="92" y2="10" stroke="#D5D5D5" strokeWidth="0.5" opacity="0.5" />
      <line x1="60" y1="50" x2="92" y2="90" stroke="#D5D5D5" strokeWidth="0.5" opacity="0.5" />
      <circle cx="91" cy="50" r="1.2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="89" cy="50" r="0.8" fill="#FF4336" opacity="0.6" />
    </svg>
  );
}
