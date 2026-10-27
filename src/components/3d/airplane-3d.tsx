"use client";

import { Canvas } from "@react-three/fiber";
import { PaperAirplaneMesh } from "@/components/3d/paper-airplane";

/**
 * 3D airplane wrapper — only rendered when WebGL is confirmed available.
 * Contains the R3F Canvas with lighting and the PaperAirplaneMesh.
 */
export function Airplane3D({
  scrollProgressRef,
  isMobile,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[5] pointer-events-none"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        pointerEvents: "none",
        opacity: isMobile ? 0.7 : 1,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 100 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ alpha: true, antialias: !isMobile, powerPreference: "high-performance" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "transparent",
          pointerEvents: "none",
        }}
        frameloop="always"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setSize(window.innerWidth, window.innerHeight, false);
        }}
      >
        <ambientLight intensity={0.5} color="#FFFFFF" />
        <directionalLight position={[3, 5, 4]} intensity={1.2} color="#FFFFFF" castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#FF4336" />
        <pointLight position={[0, -3, 2]} intensity={0.3} color="#F5F5F5" />
        <PaperAirplaneMesh scrollProgressRef={scrollProgressRef} />
      </Canvas>
    </div>
  );
}
