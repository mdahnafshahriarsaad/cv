"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Realistic folded paper airplane mesh.
 * Classic dart-style fold with:
 * - Pointed nose, two swept wings, center keel, tail
 * - Warm white paper material with PBR
 * - Ruby-red accent along the center fold
 * - Wing edge highlights
 *
 * Uses a BufferGeometry built from folded triangular faces.
 */
export function PaperAirplaneMesh({
  scrollProgressRef,
}: {
  scrollProgressRef: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.Group>(null);

  // Build the airplane geometry once
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Vertices for a classic dart paper airplane
    const positions = new Float32Array([
      // nose
      0, 0, 2.0,
      // wing tips
      -1.4, -0.05, -0.6,
      1.4, -0.05, -0.6,
      // wing roots (near nose)
      -0.15, 0.02, 0.8,
      0.15, 0.02, 0.8,
      // keel top (spine)
      0, 0.25, -0.3,
      // keel back
      0, 0.02, -1.3,
      // tail tips
      -0.25, 0.05, -1.4,
      0.25, 0.05, -1.4,
      // tail back
      0, 0.08, -1.6,
      // underside nose (for slight thickness)
      0, -0.04, 1.9,
    ]);
    const indices = [
      // top-left wing
      0, 3, 1,
      0, 1, 5,
      // top-right wing
      0, 2, 4,
      0, 6, 2,
      // keel (center spine)
      0, 5, 6,
      6, 5, 9,
      // left wing underside
      1, 3, 10,
      10, 5, 1,
      // right wing underside
      4, 2, 10,
      10, 2, 5,
      // tail surfaces
      5, 9, 8,
      5, 6, 9,
    ];
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Flight path: a smooth Catmull-Rom curve through the page
  const flightPath = useMemo(() => {
    const points: [number, number, number][] = [
      [2.5, 0.5, 1],       // 0%: hero takeoff
      [1.5, 1.4, 0.5],     // 10%: rising
      [0, 2.0, 0],         // 20%: features glide
      [-1.8, 1.2, -0.5],   // 35%: banking left
      [-2.5, 0.4, -0.8],   // 45%: how-it-works
      [-1.0, -0.4, -1.0],  // 55%: template gallery
      [0.8, -1.0, -0.8],   // 70%: crossing right
      [2.0, -0.5, -0.5],   // 82%: final glide
      [1.0, 0.3, 0],       // 92%: approaching footer
      [0, 0.6, 0.5],       // 100%: footer landing
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

    // Damped scroll interpolation (eliminates jitter)
    const target = scrollProgressRef.current;
    smoothScroll.current += (target - smoothScroll.current) * Math.min(delta * 6, 1);

    const t = Math.max(0, Math.min(0.999, smoothScroll.current));
    const isScrolling = Math.abs(target - smoothScroll.current) > 0.001;

    // Position on flight path
    const pos = flightPath.getPointAt(t);
    group.position.lerp(pos, 0.18);

    // Orientation: look toward the next point on the curve (tangent)
    const tangent = flightPath.getTangentAt(t);
    const lookTarget = pos.clone().add(tangent.multiplyScalar(2));
    group.lookAt(lookTarget);

    // Banking: compare tangents slightly ahead/behind to detect curvature
    const tNext = Math.min(t + 0.04, 0.999);
    const tPrev = Math.max(t - 0.04, 0);
    const tanNext = flightPath.getTangentAt(tNext);
    const tanPrev = flightPath.getTangentAt(tPrev);
    const bankDir = tanNext.x - tanPrev.x;
    const bankAngle = Math.max(-0.3, Math.min(0.3, bankDir * 3.5));
    group.rotation.z = bankAngle;

    // Pitch: based on vertical tangent change
    const pitchDelta = (tanNext.y - tanPrev.y) * 2.5;
    group.rotation.x += Math.max(-0.15, Math.min(0.15, pitchDelta * 0.3));

    // Idle floating when not scrolling
    if (!isScrolling) {
      idleTime.current += delta;
      group.position.y += Math.sin(idleTime.current * 0.7) * 0.004;
      group.rotation.z += Math.sin(idleTime.current * 0.5) * 0.006;
    } else {
      idleTime.current = 0;
    }

    // Subtle depth scale (slightly smaller at end)
    const depthScale = 1 - t * 0.12;
    group.scale.setScalar(depthScale);
  });

  return (
    <group ref={meshRef}>
      {/* Main paper body */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.82}
          metalness={0.05}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ruby-red accent line along center fold */}
      <mesh position={[0, 0.015, 0.3]}>
        <boxGeometry args={[0.012, 0.006, 3.0]} />
        <meshStandardMaterial
          color="#FF4336"
          roughness={0.35}
          metalness={0.1}
          emissive="#B71C1C"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Wing edge highlights (subtle) */}
      <mesh position={[-0.7, -0.01, 0.1]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.006, 0.003, 1.6]} />
        <meshStandardMaterial color="#EFEFEF" roughness={0.55} />
      </mesh>
      <mesh position={[0.7, -0.01, 0.1]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.006, 0.003, 1.6]} />
        <meshStandardMaterial color="#EFEFEF" roughness={0.55} />
      </mesh>
    </group>
  );
}
