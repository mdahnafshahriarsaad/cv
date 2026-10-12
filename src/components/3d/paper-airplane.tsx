"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Realistic folded paper airplane mesh.
 * Uses primitive geometry shapes (cones, boxes) to build a recognizable
 * paper airplane silhouette. Simpler and more reliable than BufferGeometry.
 *
 * - White paper body with warm tint
 * - Ruby-red accent along the center fold
 * - Wing edge highlights
 */
export function PaperAirplaneMesh({
  scrollProgressRef,
}: {
  scrollProgressRef: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.Group>(null);

  // Flight path: a smooth Catmull-Rom curve through the page
  const flightPath = useMemo(() => {
    const points: [number, number, number][] = [
      [1.8, 0.3, 0.5],
      [1.0, 1.0, 0.3],
      [0, 1.4, 0],
      [-1.2, 0.8, -0.3],
      [-1.6, 0.2, -0.5],
      [-0.6, -0.3, -0.6],
      [0.5, -0.7, -0.5],
      [1.3, -0.3, -0.3],
      [0.6, 0.2, 0],
      [0, 0.4, 0.3],
    ];
    return new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      false,
      "catmullrom",
      0.5
    );
  }, []);

  // Smoothed scroll + idle timer
  const smoothScroll = useRef(0);
  const idleTime = useRef(0);

  useFrame((state, delta) => {
    const group = meshRef.current;
    if (!group) return;

    // Damped scroll interpolation
    const target = scrollProgressRef.current;
    smoothScroll.current += (target - smoothScroll.current) * Math.min(delta * 6, 1);

    const t = Math.max(0, Math.min(0.999, smoothScroll.current));
    const isScrolling = Math.abs(target - smoothScroll.current) > 0.001;

    // Position on flight path
    const pos = flightPath.getPointAt(t);
    group.position.lerp(pos, 0.18);

    // Orientation: look toward the next point on the curve
    const tangent = flightPath.getTangentAt(t);
    const lookTarget = pos.clone().add(tangent.multiplyScalar(2));
    group.lookAt(lookTarget);

    // Banking
    const tNext = Math.min(t + 0.04, 0.999);
    const tPrev = Math.max(t - 0.04, 0);
    const tanNext = flightPath.getTangentAt(tNext);
    const tanPrev = flightPath.getTangentAt(tPrev);
    const bankDir = tanNext.x - tanPrev.x;
    const bankAngle = Math.max(-0.3, Math.min(0.3, bankDir * 3.5));
    group.rotation.z = bankAngle;

    // Pitch
    const pitchDelta = (tanNext.y - tanPrev.y) * 2.5;
    group.rotation.x += Math.max(-0.15, Math.min(0.15, pitchDelta * 0.3));

    // Idle floating
    if (!isScrolling) {
      idleTime.current += delta;
      group.position.y += Math.sin(idleTime.current * 0.7) * 0.004;
      group.rotation.z += Math.sin(idleTime.current * 0.5) * 0.006;
    } else {
      idleTime.current = 0;
    }

    // Scale
    const depthScale = (1 - t * 0.12) * 1.5;
    group.scale.setScalar(depthScale);
  });

  return (
    <group ref={meshRef}>
      {/*
        Paper airplane built from primitive shapes:
        - Main body: a cone (nose) flattened into a dart shape
        - Wings: two thin boxes angled outward
        - Keel: a thin vertical box along the center
        - Red accent: a thin red box on the spine
      */}

      {/* Nose cone (the pointed front) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.8]}>
        <coneGeometry args={[0.25, 1.2, 4]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.82}
          metalness={0.05}
          flatShading={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left wing — flat angled plane */}
      <mesh position={[-0.5, -0.02, -0.2]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.9, 0.02, 1.4]} />
        <meshStandardMaterial
          color="#F5F5F5"
          roughness={0.85}
          metalness={0.05}
          flatShading={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right wing */}
      <mesh position={[0.5, -0.02, -0.2]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.9, 0.02, 1.4]} />
        <meshStandardMaterial
          color="#F5F5F5"
          roughness={0.85}
          metalness={0.05}
          flatShading={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center keel (the folded spine) */}
      <mesh position={[0, 0.06, -0.1]}>
        <boxGeometry args={[0.04, 0.12, 1.8]} />
        <meshStandardMaterial
          color="#EFEFEF"
          roughness={0.8}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ruby-red accent line along the spine */}
      <mesh position={[0, 0.13, -0.1]}>
        <boxGeometry args={[0.02, 0.01, 1.8]} />
        <meshStandardMaterial
          color="#FF4336"
          roughness={0.35}
          metalness={0.1}
          emissive="#B71C1C"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Tail (small vertical fin at the back) */}
      <mesh position={[0, 0.08, -0.9]}>
        <boxGeometry args={[0.03, 0.15, 0.3]} />
        <meshStandardMaterial
          color="#F0F0F0"
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
