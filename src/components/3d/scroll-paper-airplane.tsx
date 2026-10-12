"use client";

import * as React from "react";

/**
 * ScrollPaperAirplane — premium 3D-style paper airplane.
 *
 * Uses a detailed multi-layer SVG with:
 * - Realistic folded paper shading (multiple gradient layers)
 * - Visible wing thickness and edge bevels
 * - Raised center spine with depth shadow
 * - Specular highlights on wing surfaces
 * - Paper texture via subtle noise pattern
 * - Ruby-red accent along the fold
 * - Size: 80px desktop (elegant, not tiny, not huge)
 *
 * Animation: smooth scroll-driven Catmull-Rom flight path
 * with banking, idle float, and direction-aware nose orientation.
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

    // Flight path
    const wp: [number, number][] = [
      [76, 26], [56, 16], [28, 28], [4, 43], [-8, 56],
      [4, 67], [28, 71], [53, 57], [38, 41], [20, 49],
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
        smooth += (target - smooth) * Math.min(dt * 8, 1);
        const t = Math.max(0, Math.min(1, smooth));
        const isScrolling = Math.abs(target - smooth) > 0.003;

        const [x, y] = getPos(t);

        const dir = smooth > lastSmooth + 0.0002 ? 1 : smooth < lastSmooth - 0.0002 ? -1 : 0;
        if (dir !== 0) lastDir = dir;
        const ed = dir !== 0 ? dir : lastDir;
        const eps = 0.004;
        const sT = ed >= 0 ? Math.min(1, t + eps) : Math.max(0, t - eps);
        const [xs, ys] = getPos(sT);
        const dx = xs - x;
        const dy = ys - y;

        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        let diff = targetAngle - smoothAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        const speed = Math.abs(diff) > 60 ? 0.4 : 0.18;
        smoothAngle += diff * speed;

        const sT2 = Math.min(1, t + eps * 2);
        const [xs2, ys2] = getPos(sT2);
        const cross = (xs - x) * (ys2 - ys) - (ys - y) * (xs2 - xs);
        const bank = Math.max(-12, Math.min(12, cross * 60));

        if (!isScrolling) idleTime += dt; else idleTime *= 0.9;
        const idleY = Math.sin(idleTime * 0.8) * 0.8;
        const idleRot = Math.sin(idleTime * 0.5) * 1;

        const mobile = window.innerWidth < 768;
        const scale = (1 - t * 0.06) * (mobile ? 0.5 : 0.72);
        const vw = window.innerWidth / 100;
        const vh = window.innerHeight / 100;
        const finalAngle = smoothAngle + idleRot + bank * 0.2;

        el.style.transform = `translate3d(${x * vw}px, ${(y + idleY) * vh}px, 0) rotate(${finalAngle}deg) scale(${scale})`;
        el.style.opacity = String(Math.max(0.85, 0.95 - Math.abs(t - 0.5) * 0.05));

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
      <div
        ref={trailRef}
        className="fixed z-[4] pointer-events-none"
        aria-hidden="true"
        style={{ top: 0, left: 0, willChange: "transform, opacity", filter: "blur(6px)" }}
      >
        <PlaneSVG size={isMobile ? 28 : 42} />
      </div>
      <div
        ref={airplaneRef}
        className="fixed z-[5] pointer-events-none"
        aria-hidden="true"
        style={{
          top: 0, left: 0, willChange: "transform, opacity",
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(255,67,54,0.1))",
        }}
      >
        <PlaneSVG size={isMobile ? 42 : 80} />
      </div>
    </>
  );
}

/**
 * Premium 3D-style paper airplane SVG.
 *
 * Multiple layers create genuine depth illusion:
 * 1. Bottom wing (darkest — in shadow)
 * 2. Top wing (gradient — catches light)
 * 3. Wing edge thickness (bevel effect)
 * 4. Center spine (raised ridge with shadow)
 * 5. Specular highlight strip
 * 6. Fold crease lines
 * 7. Red accent
 * 8. Nose tip
 * 9. Tail notch
 */
function PlaneSVG({ size }: { size: number }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Top wing gradient — light from upper-left */}
        <linearGradient id={`gt-${id}`} x1="5%" y1="5%" x2="85%" y2="65%">
          <stop offset="0%" stopColor="#DCDCDC" />
          <stop offset="25%" stopColor="#F8F8F8" />
          <stop offset="55%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </linearGradient>
        {/* Bottom wing gradient — darker, in shadow */}
        <linearGradient id={`gb-${id}`} x1="5%" y1="95%" x2="85%" y2="35%">
          <stop offset="0%" stopColor="#B0B0B0" />
          <stop offset="40%" stopColor="#C8C8C8" />
          <stop offset="100%" stopColor="#D8D8D8" />
        </linearGradient>
        {/* Spine ridge — dark shadow in the fold valley */}
        <linearGradient id={`gs-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#999999" />
          <stop offset="50%" stopColor="#AAAAAA" />
          <stop offset="100%" stopColor="#888888" />
        </linearGradient>
        {/* Specular highlight — bright strip on top wing */}
        <linearGradient id={`gh-${id}`} x1="30%" y1="20%" x2="70%" y2="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* Paper texture — subtle noise */}
        <filter id={`noise-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.04" />
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* ═══ Layer 1: Bottom wing (darkest) ═══ */}
      <path
        d="M92 50 L52 50 L8 88 Z"
        fill={`url(#gb-${id})`}
      />

      {/* ═══ Layer 2: Wing edge thickness (bevel — gives paper volume) ═══ */}
      <path d="M92 50 L52 50 L8 88 L10 86 L52 51 L91 49 Z" fill="#909090" opacity="0.3" />
      <path d="M92 50 L52 50 L8 12 L10 14 L52 49 L91 51 Z" fill="#E0E0E0" opacity="0.3" />

      {/* ═══ Layer 3: Top wing (lighter, catches light) ═══ */}
      <path
        d="M92 50 L8 12 L52 50 Z"
        fill={`url(#gt-${id})`}
      />

      {/* ═══ Layer 4: Specular highlight on top wing ═══ */}
      <path
        d="M80 48 L20 18 L45 45 Z"
        fill={`url(#gh-${id})`}
      />

      {/* ═══ Layer 5: Center spine (raised ridge shadow) ═══ */}
      <path
        d="M92 50 L52 50 L52 53 L92 51 Z"
        fill={`url(#gs-${id})`}
        opacity="0.55"
      />
      {/* Spine top edge — bright highlight where ridge catches light */}
      <line x1="52" y1="50" x2="92" y2="50" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.5" />

      {/* ═══ Layer 6: Fold crease lines ═══ */}
      <line x1="52" y1="50" x2="8" y2="12" stroke="#C5C5C5" strokeWidth="0.35" opacity="0.6" />
      <line x1="52" y1="50" x2="8" y2="88" stroke="#A0A0A0" strokeWidth="0.35" opacity="0.5" />

      {/* ═══ Layer 7: Tail notch (V-cut — distinguishes tail from nose) ═══ */}
      <path d="M8 12 L17 50 L8 88 Z" fill="#1a1a1a" opacity="0.1" />
      <path d="M8 12 L17 50 L8 88" stroke="#B0B0B0" strokeWidth="0.35" fill="none" />

      {/* ═══ Layer 8: Ruby-red accent (center fold line) ═══ */}
      <line
        x1="17" y1="50" x2="90" y2="50"
        stroke="#FF4336" strokeWidth="1.4" opacity="0.75" strokeLinecap="round"
      />

      {/* ═══ Layer 9: Nose tip ═══ */}
      <circle cx="91" cy="50" r="1.3" fill="#FFFFFF" />
      <circle cx="90" cy="50" r="0.7" fill="#FF4336" opacity="0.6" />

      {/* ═══ Paper texture overlay (very subtle) ═══ */}
      <rect x="0" y="0" width="100" height="100" filter={`url(#noise-${id})`} opacity="0.5" />
    </svg>
  );
}
