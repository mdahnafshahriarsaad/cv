"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { PaperAirplane3D } from "@/components/3d/paper-airplane-3d";

/**
 * ScrollPaperAirplane — 3D paper airplane with scroll-driven flight.
 *
 * Uses Three.js + React Three Fiber for genuine 3D geometry.
 * Falls back to SVG if WebGL is unavailable.
 *
 * Camera: three-quarter angle from above-left (matches reference).
 * Lighting: key from above-left, rim from right-rear, ambient fill.
 */
export function ScrollPaperAirplane() {
  const scrollRef = React.useRef(0);
  const [webglOk, setWebglOk] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // WebGL check
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) { setWebglOk(false); }
      else {
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "";
        if (r.includes("SwiftShader") || r.includes("llvmpipe")) setWebglOk(false);
      }
    } catch { setWebglOk(false); }

    // Scroll tracking — always set up (for both 3D and fallback)
    let raf = -1;
    const update = () => {
      const sh = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = sh > 0 ? Math.max(0, Math.min(1, window.scrollY / sh)) : 0;
      raf = -1;
    };
    const onScroll = () => { if (raf === -1) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf > 0) cancelAnimationFrame(raf);
    };
  }, []);

  if (!mounted) return null;

  // SVG fallback for environments without WebGL
  if (!webglOk) {
    return <SVGFallback scrollRef={scrollRef} />;
  }

  // 3D mode
  return (
    <div
      className="fixed inset-0 z-[5] pointer-events-none"
      aria-hidden="true"
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        overflow: "hidden", pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{
          position: [-2.5, 1.8, 7],   // three-quarter from above-LEFT (matches reference lighting)
          fov: 50,
          near: 0.1, far: 100,
        }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100vw", height: "100vh",
          background: "transparent", pointerEvents: "none",
        }}
        frameloop="always"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setSize(window.innerWidth, window.innerHeight, false);
        }}
      >
        {/* ═══ Lighting (matches reference: key above-left, rim right-rear) ═══ */}
        <ambientLight intensity={0.3} color="#FFFFFF" />

        {/* Key light — above-left, illuminates left wing and spine */}
        <directionalLight position={[-4, 6, 2]} intensity={1.4} color="#FFFFFF" castShadow />

        {/* Rim light — right-rear, creates edge highlights on right wing */}
        <directionalLight position={[5, 2, -3]} intensity={0.5} color="#FF4336" />

        {/* Fill — from below, softens wing undersides */}
        <pointLight position={[0, -3, 2]} intensity={0.25} color="#F5F5F5" distance={15} />

        {/* Hemisphere bounce */}
        <hemisphereLight args={["#FFFFFF", "#212121", 0.25]} />

        {/* ═══ The 3D Airplane ═══ */}
        <PaperAirplane3D scrollProgressRef={scrollRef} />
      </Canvas>
    </div>
  );
}

// ─── SVG Fallback ─────────────────────────────────────────

function SVGFallback({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const trailRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    let raf = 0;
    let running = true;
    let smooth = 0, smoothAngle = 0, lastSmooth = 0, lastDir = 1, idleTime = 0;

    const wp: [number, number][] = [
      [72, 22], [48, 14], [18, 25], [-5, 38], [-15, 55],
      [-2, 68], [22, 72], [48, 56], [32, 40], [15, 47],
    ];

    const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => {
      const t2 = t*t, t3 = t2*t;
      return 0.5*(2*p1 + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3);
    };

    const getPos = (t: number): [number, number] => {
      const n = wp.length-1, i = Math.min(Math.floor(t*n), n-1), lt = t*n-i;
      const p0 = wp[Math.max(0,i-1)], p1 = wp[i], p2 = wp[i+1], p3 = wp[Math.min(n,i+2)];
      return [cr(p0[0],p1[0],p2[0],p3[0],lt), cr(p0[1],p1[1],p2[1],p3[1],lt)];
    };

    const animate = () => {
      if (!running) return;
      const el = ref.current;
      const trail = trailRef.current;
      if (el) {
        const target = scrollRef.current;
        smooth += (target - smooth) * 0.06;
        const t = Math.max(0, Math.min(1, smooth));
        const isScrolling = Math.abs(target - smooth) > 0.002;
        const [x, y] = getPos(t);

        const dir = smooth > lastSmooth + 0.0001 ? 1 : smooth < lastSmooth - 0.0001 ? -1 : 0;
        if (dir !== 0) lastDir = dir;
        const ed = dir !== 0 ? dir : lastDir;
        const eps = 0.005;
        const sT = ed >= 0 ? Math.min(1, t+eps) : Math.max(0, t-eps);
        const [xs, ys] = getPos(sT);
        const dx = xs - x, dy = ys - y;
        let ta = (Math.atan2(dy, dx) * 180) / Math.PI;
        let diff = ta - smoothAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        smoothAngle += diff * (Math.abs(diff) > 60 ? 0.5 : 0.15);

        const sT2 = Math.min(1, t + eps * 2);
        const [xs2, ys2] = getPos(sT2);
        const cross = (xs-x)*(ys2-ys) - (ys-y)*(xs2-xs);
        const bank = Math.max(-15, Math.min(15, cross * 80));

        if (!isScrolling) idleTime += 0.016; else idleTime *= 0.95;
        const idleY = Math.sin(idleTime * 0.8) * 1.2;
        const idleRot = Math.sin(idleTime * 0.5) * 1.5;

        const mobile = window.innerWidth < 768;
        const scale = (1 - t * 0.08) * (mobile ? 0.55 : 0.85);
        const vw = window.innerWidth / 100, vh = window.innerHeight / 100;
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
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [scrollRef]);

  return (
    <>
      <div ref={trailRef} className="fixed z-[4] pointer-events-none" aria-hidden="true"
        style={{ top: 0, left: 0, willChange: "transform, opacity", filter: "blur(8px)" }}>
        <PlaneSVG size={isMobile ? 40 : 70} />
      </div>
      <div ref={ref} className="fixed z-[5] pointer-events-none" aria-hidden="true"
        style={{ top: 0, left: 0, willChange: "transform, opacity",
          filter: "drop-shadow(0 12px 35px rgba(0,0,0,0.7)) drop-shadow(0 0 20px rgba(255,67,54,0.12))" }}>
        <PlaneSVG size={isMobile ? 56 : 110} />
      </div>
    </>
  );
}

function PlaneSVG({ size }: { size: number }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gt-${id}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#F0F0F0" /><stop offset="50%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#F8F8F8" />
        </linearGradient>
        <linearGradient id={`gb-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D8D8D8" /><stop offset="50%" stopColor="#E8E8E8" /><stop offset="100%" stopColor="#F0F0F0" />
        </linearGradient>
      </defs>
      <path d="M90 50 L10 15 L55 50 Z" fill={`url(#gt-${id})`} stroke="#E0E0E0" strokeWidth="0.5" />
      <path d="M90 50 L55 50 L10 85 Z" fill={`url(#gb-${id})`} stroke="#D0D0D0" strokeWidth="0.5" />
      <path d="M90 50 L55 50 L55 52 L90 51 Z" fill="#C0C0C0" opacity="0.5" />
      <path d="M10 15 L18 50 L10 85 Z" fill="#212121" opacity="0.15" />
      <line x1="20" y1="50" x2="88" y2="50" stroke="#FF4336" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />
      <line x1="55" y1="50" x2="10" y2="15" stroke="#D5D5D5" strokeWidth="0.4" opacity="0.6" />
      <line x1="55" y1="50" x2="10" y2="85" stroke="#D5D5D5" strokeWidth="0.4" opacity="0.6" />
      <circle cx="89" cy="50" r="1.5" fill="#FFFFFF" />
      <circle cx="88" cy="50" r="0.8" fill="#FF4336" opacity="0.7" />
    </svg>
  );
}
