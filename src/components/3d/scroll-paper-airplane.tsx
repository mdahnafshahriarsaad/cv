"use client";

import * as React from "react";

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

    // Flight path [x(vw), y(vh)]
    const wp: [number, number][] = [
      [72, 22], [48, 14], [18, 25], [-8, 40], [-18, 56],
      [-2, 68], [22, 72], [48, 56], [32, 40], [15, 47],
    ];

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

    let raf = 0;
    let running = true;
    let smooth = 0;
    let smoothAngle = 0;
    let lastSmooth = 0;
    let idleTime = 0;
    let lastDir = 1; // remember last scroll direction for idle orientation

    const animate = () => {
      if (!running) return;
      const el = airplaneRef.current;
      const trail = trailRef.current;

      if (el) {
        const target = scrollRef.current;
        smooth += (target - smooth) * 0.06;
        const t = Math.max(0, Math.min(1, smooth));
        const isScrolling = Math.abs(target - smooth) > 0.002;

        const [x, y] = getPos(t);

        // Direction: detect scroll direction for nose orientation
        const dir = smooth > lastSmooth + 0.0001 ? 1 : smooth < lastSmooth - 0.0001 ? -1 : 0;
        if (dir !== 0) lastDir = dir;
        const effectiveDir = dir !== 0 ? dir : lastDir;
        const eps = 0.005;
        // Sample in the direction of travel:
        // forward (dir=1): sample ahead (t+eps)
        // backward (dir=-1): sample behind (t-eps)
        // The sampled point is the NEXT position in the travel direction.
        const sT = effectiveDir >= 0 ? Math.min(1, t + eps) : Math.max(0, t - eps);
        const [xs, ys] = getPos(sT);
        // Direction = next - current (always, regardless of travel direction)
        // This gives the actual direction of travel.
        const dx = xs - x;
        const dy = ys - y;

        // SVG nose points RIGHT at 0°. atan2(dy, dx) gives the angle.
        // BUT: CSS rotate() rotates clockwise, while atan2 measures
        // counter-clockwise from +X. In screen coordinates, +Y is DOWN.
        // atan2(dy, dx) with screen coords: dy>0 = downward = clockwise.
        // This MATCHES CSS rotate(). So the angle is directly correct.
        let targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // Smooth angle — snap quickly when direction reverses to avoid backward flight
        let diff = targetAngle - smoothAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        // Large diff (>60°) means direction reversed — snap fast
        const angleSpeed = Math.abs(diff) > 60 ? 0.5 : 0.15;
        smoothAngle += diff * angleSpeed;

        // Banking
        const sT2 = Math.min(1, t + eps * 2);
        const [xs2, ys2] = getPos(sT2);
        const cross = (xs - x) * (ys2 - ys) - (ys - y) * (xs2 - xs);
        const bank = Math.max(-15, Math.min(15, cross * 80));

        // Idle
        if (!isScrolling) idleTime += 0.016; else idleTime *= 0.95;
        const idleY = Math.sin(idleTime * 0.8) * 1.2;
        const idleRot = Math.sin(idleTime * 0.5) * 1.5;

        const mobile = window.innerWidth < 768;
        const scale = (1 - t * 0.08) * (mobile ? 0.55 : 0.85);
        const vw = window.innerWidth / 100;
        const vh = window.innerHeight / 100;

        const finalAngle = smoothAngle + idleRot + bank * 0.3;
        el.style.transform = `translate3d(${x*vw}px, ${(y+idleY)*vh}px, 0) rotate(${finalAngle}deg) scale(${scale})`;
        el.style.opacity = String(Math.max(0.8, 0.95 - Math.abs(t - 0.5) * 0.06));

        if (trail) {
          const tdx = -dx * 3, tdy = -dy * 3;
          trail.style.transform = `translate3d(${(x+tdx)*vw}px, ${(y+tdy)*vh}px, 0) rotate(${smoothAngle}deg) scale(${scale*0.5})`;
          trail.style.opacity = String(isScrolling ? Math.min(0.2, Math.abs(target-smooth)*2) : 0);
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
      <div
        ref={trailRef}
        className="fixed z-[4] pointer-events-none"
        aria-hidden="true"
        style={{ top: 0, left: 0, willChange: "transform, opacity", filter: "blur(8px)" }}
      >
        <PaperAirplaneSVG size={isMobile ? 40 : 70} />
      </div>
      <div
        ref={airplaneRef}
        className="fixed z-[5] pointer-events-none"
        aria-hidden="true"
        style={{
          top: 0, left: 0, willChange: "transform, opacity",
          filter: "drop-shadow(0 12px 35px rgba(0,0,0,0.7)) drop-shadow(0 0 20px rgba(255,67,54,0.12))",
        }}
      >
        <PaperAirplaneSVG size={isMobile ? 56 : 110} />
      </div>
    </>
  );
}

/**
 * Realistic 3D-style paper airplane SVG.
 *
 * The nose is at the RIGHT (x≈90) — sharp and pointed.
 * The tail is at the LEFT (x≈10) — wide and flat with a notch.
 * This makes it unambiguous which end is the front.
 *
 * The 3D effect comes from:
 * - Two-tone wings (top lighter, bottom darker)
 * - A visible center spine with shadow
 * - Wing crease lines that suggest folded paper
 * - A subtle gradient on the top wing for depth
 * - The tail has a distinct notch (V-shape) unlike the sharp nose
 */
function PaperAirplaneSVG({ size }: { size: number }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for top wing — gives 3D depth */}
        <linearGradient id={`grad-top-${id}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8F8F8" />
        </linearGradient>
        {/* Gradient for bottom wing — darker, in shadow */}
        <linearGradient id={`grad-bot-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D8D8D8" />
          <stop offset="50%" stopColor="#E8E8E8" />
          <stop offset="100%" stopColor="#F0F0F0" />
        </linearGradient>
        {/* Center spine shadow */}
        <linearGradient id={`grad-spine-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C0C0C0" />
          <stop offset="50%" stopColor="#D5D5D5" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </linearGradient>
      </defs>

      {/* ═══ TOP WING (upper half — lighter, catches light) ═══ */}
      {/* Sharp nose at right (90,50), sweeps to wing tip at left-top (10,15),
          inner crease at (55,50) */}
      <path
        d="M90 50 L10 15 L55 50 Z"
        fill={`url(#grad-top-${id})`}
        stroke="#E0E0E0"
        strokeWidth="0.5"
      />

      {/* ═══ BOTTOM WING (lower half — darker, in shadow) ═══ */}
      {/* Sharp nose at right (90,50), inner crease at (55,50),
          sweeps to wing tip at left-bottom (10,85) */}
      <path
        d="M90 50 L55 50 L10 85 Z"
        fill={`url(#grad-bot-${id})`}
        stroke="#D0D0D0"
        strokeWidth="0.5"
      />

      {/* ═══ CENTER SPINE (the folded keel — visible 3D ridge) ═══ */}
      {/* Thin band from nose to inner crease with shadow gradient */}
      <path
        d="M90 50 L55 50 L55 52 L90 51 Z"
        fill={`url(#grad-spine-${id})`}
        opacity="0.6"
      />

      {/* ═══ TAIL NOTCH (V-shape cut at the back — makes tail clearly distinct from nose) ═══ */}
      {/* This creates a visible notch at the left end (tail) */}
      <path
        d="M10 15 L18 50 L10 85 Z"
        fill="#212121"
        opacity="0.15"
      />
      <path
        d="M10 15 L18 50 L10 85"
        stroke="#C8C8C8"
        strokeWidth="0.5"
        fill="none"
      />

      {/* ═══ RUBY-RED ACCENT (center fold line — brand color) ═══ */}
      <line
        x1="20"
        y1="50"
        x2="88"
        y2="50"
        stroke="#FF4336"
        strokeWidth="1.5"
        opacity="0.8"
        strokeLinecap="round"
      />

      {/* ═══ WING CREASE LINES (suggest folded paper) ═══ */}
      <line
        x1="55"
        y1="50"
        x2="10"
        y2="15"
        stroke="#D5D5D5"
        strokeWidth="0.4"
        opacity="0.6"
      />
      <line
        x1="55"
        y1="50"
        x2="10"
        y2="85"
        stroke="#D5D5D5"
        strokeWidth="0.4"
        opacity="0.6"
      />

      {/* ═══ NOSE TIP (sharp highlight — makes the front obvious) ═══ */}
      <circle cx="89" cy="50" r="1.5" fill="#FFFFFF" />
      <circle cx="88" cy="50" r="0.8" fill="#FF4336" opacity="0.7" />

      {/* ═══ SUBTLE WING SHADOW (where top wing overhangs bottom) ═══ */}
      <path
        d="M55 50 L90 50 L55 51 Z"
        fill="#000000"
        opacity="0.06"
      />
    </svg>
  );
}
