"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Genuine 3D folded paper airplane — Dart style.
 *
 * Built from real 3D vertices with actual depth:
 * - Sharp pointed nose at +Z
 * - Two wings angled downward (dihedral V-shape)
 * - Raised central spine/keel
 * - Wing fold creases
 * - Tail with small vertical fin
 * - Underside surfaces for thickness
 * - Proper vertex normals for lighting
 *
 * Materials: matte white paper (#F5F5F5) with ruby-red accents.
 * Lighting: key from above-left, rim from right-rear, ambient fill.
 *
 * Scroll-driven flight path with banking, pitch, and idle float.
 * Nose always faces direction of travel (including scroll-up).
 */

// ─── Geometry ─────────────────────────────────────────────

function buildAirplaneGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();

  // All vertices — coordinate system: +Z forward, +Y up, +X right
  // The model is symmetric across X=0
  const v = {
    // Nose
    noseTip:      [0,    0.00,  3.2],   // sharpest point
    noseTopL:     [-0.08, 0.12, 2.6],   // left of nose, top
    noseTopR:     [0.08,  0.12, 2.6],   // right of nose, top

    // Spine ridge (raised center fold)
    spineMid:     [0,    0.28,  1.2],   // highest point of ridge
    spineBack:    [0,    0.10, -0.8],   // where ridge meets tail

    // Wing root (where wing meets spine, at the fold line)
    wingRootL:    [-0.12, 0.08, 2.3],
    wingRootR:    [0.12,  0.08, 2.3],

    // Wing fold point (where wing surface bends)
    wingFoldL:    [-0.15, 0.06, 0.5],
    wingFoldR:    [0.15,  0.06, 0.5],

    // Wing tips (outer trailing corners)
    wingTipL:     [-1.6, -0.15, -0.6],
    wingTipR:     [1.6,  -0.15, -0.6],

    // Wing trailing center (where both wings meet at back)
    wingBackL:    [-0.08, 0.04, -1.2],
    wingBackR:    [0.08,  0.04, -1.2],

    // Tail fin (small vertical stabilizer)
    tailTop:      [0,    0.25, -1.1],
    tailBack:     [0,    0.06, -1.5],

    // Underside vertices (give the keel/spine thickness)
    underNose:    [0,   -0.06, 2.8],
    underMid:     [0,   -0.04, 0.5],
    underBack:    [0,   -0.05, -1.2],

    // Wing underside tips (for wing thickness)
    underWingTipL:[-1.55, -0.22, -0.55],
    underWingTipR:[1.55,  -0.22, -0.55],
  };

  const positions = new Float32Array(Object.values(v).flat());

  // Map vertex names to indices
  const idx: Record<string, number> = {};
  Object.keys(v).forEach((k, i) => { idx[k] = i; });

  // Faces — wound counter-clockwise when viewed from outside
  const faces: [string, string, string][] = [
    // ═══ LEFT WING TOP (upper surface, faces up-left) ═══
    ["noseTip", "wingRootL", "wingTipL"],
    ["noseTip", "wingTipL", "wingBackL"],
    ["wingTipL", "wingFoldL", "wingBackL"],
    ["wingRootL", "wingFoldL", "wingTipL"],

    // ═══ RIGHT WING TOP (upper surface, faces up-right) ═══
    ["noseTip", "wingTipR", "wingRootR"],
    ["noseTip", "wingBackR", "wingTipR"],
    ["wingTipR", "wingBackR", "wingFoldR"],
    ["wingRootR", "wingTipR", "wingFoldR"],

    // ═══ SPINE LEFT (left face of raised ridge — faces left) ═══
    ["noseTopL", "spineMid", "spineBack"],
    ["noseTopL", "spineBack", "noseTip"],
    ["noseTopL", "noseTip", "wingRootL"],
    ["noseTopL", "wingRootL", "spineMid"],

    // ═══ SPINE RIGHT (right face of raised ridge — faces right) ═══
    ["noseTopR", "spineBack", "spineMid"],
    ["noseTopR", "noseTip", "spineBack"],
    ["noseTopR", "wingRootR", "noseTip"],
    ["noseTopR", "spineMid", "wingRootR"],

    // ═══ LEFT WING UNDERSIDE (faces down) ═══
    ["underNose", "wingTipL", "wingRootL"],
    ["underNose", "underWingTipL", "wingTipL"],
    ["underMid", "underWingTipL", "underNose"],
    ["underBack", "wingBackL", "wingTipL"],
    ["underBack", "wingTipL", "underWingTipL"],

    // ═══ RIGHT WING UNDERSIDE ═══
    ["underNose", "wingRootR", "wingTipR"],
    ["underNose", "wingTipR", "underWingTipR"],
    ["underMid", "underNose", "underWingTipR"],
    ["underBack", "wingTipR", "wingBackR"],
    ["underBack", "underWingTipR", "wingTipR"],

    // ═══ KEEL UNDERSIDE (bottom of spine) ═══
    ["underNose", "underMid", "underBack"],

    // ═══ TAIL FIN (vertical stabilizer) ═══
    ["spineBack", "tailTop", "tailBack"],
    ["tailBack", "tailTop", "wingBackL"],

    // ═══ WING FILL (between spine back and wing back — closes the body) ═══
    ["spineBack", "wingBackL", "wingBackR"],
  ];

  const indices: number[] = [];
  for (const [a, b, c] of faces) {
    indices.push(idx[a], idx[b], idx[c]);
  }

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  // Center the geometry
  geo.center();
  return geo;
}

// ─── Component ────────────────────────────────────────────

export function PaperAirplane3D({
  scrollProgressRef,
}: {
  scrollProgressRef: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildAirplaneGeometry(), []);

  // Flight path: Catmull-Rom through 3D space
  const flightPath = useMemo(() => {
    const pts: [number, number, number][] = [
      [2.0,  0.3,  0.2],   // 0%: hero takeoff (right)
      [1.2,  1.0,  0.0],   // 10%: rising
      [0.0,  1.5, -0.2],   // 20%: features glide
      [-1.2, 0.8, -0.3],   // 35%: banking left
      [-1.7, 0.1, -0.4],   // 45%: how-it-works
      [-0.5,-0.4, -0.5],   // 55%: template gallery
      [0.7, -0.8, -0.4],   // 70%: crossing right
      [1.5, -0.3, -0.2],   // 82%: final glide
      [0.7,  0.3,  0.0],   // 92%: approaching footer
      [0.0,  0.5,  0.2],   // 100%: footer landing
    ];
    return new THREE.CatmullRomCurve3(
      pts.map(p => new THREE.Vector3(...p)),
      false, "catmullrom", 0.5
    );
  }, []);

  // Smoothed values
  const smooth = useRef(0);
  const smoothAngle = useRef(0);
  const lastSmooth = useRef(0);
  const lastDir = useRef(1);
  const idleTime = useRef(0);
  const currentBank = useRef(0);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Damped scroll
    const target = scrollProgressRef.current;
    smooth.current += (target - smooth.current) * Math.min(delta * 5, 1);
    const t = Math.max(0, Math.min(0.999, smooth.current));
    const isScrolling = Math.abs(target - smooth.current) > 0.002;

    // Position on flight path
    const pos = flightPath.getPointAt(t);
    group.position.lerp(pos, 0.15);

    // Direction: detect scroll direction
    const dir = smooth.current > lastSmooth.current + 0.0001 ? 1
              : smooth.current < lastSmooth.current - 0.0001 ? -1 : 0;
    if (dir !== 0) lastDir.current = dir;
    const effectiveDir = dir !== 0 ? dir : lastDir.current;

    // Sample next point in travel direction
    const eps = 0.005;
    const sT = effectiveDir >= 0 ? Math.min(0.999, t + eps) : Math.max(0, t - eps);
    const nextPos = flightPath.getPointAt(sT);

    // Direction vector
    const dirVec = new THREE.Vector3().subVectors(nextPos, pos).normalize();

    // Orient: model's nose is at +Z. Three.js lookAt makes -Z face target.
    // So we look at (pos - dirVec) to make +Z face the travel direction.
    const lookTarget = pos.clone().sub(dirVec);
    group.lookAt(lookTarget);

    // Banking: based on path curvature (cross product of tangents)
    const sT2 = Math.min(0.999, t + eps * 2);
    const next2 = flightPath.getPointAt(sT2);
    const dir2 = new THREE.Vector3().subVectors(next2, nextPos);
    const cross = dirVec.x * dir2.y - dirVec.y * dir2.x;
    const targetBank = Math.max(-0.3, Math.min(0.3, cross * 5));
    currentBank.current += (targetBank - currentBank.current) * 0.1;
    group.rotateZ(currentBank.current);

    // Subtle roll oscillation to show 3D structure
    const showRoll = Math.sin(t * Math.PI * 3) * 0.06;
    group.rotateX(showRoll);

    // Idle floating
    if (!isScrolling) {
      idleTime.current += delta;
      group.position.y += Math.sin(idleTime.current * 0.7) * 0.004;
      group.rotateZ(Math.sin(idleTime.current * 0.5) * 0.005);
    } else {
      idleTime.current = 0;
    }

    // Scale (depth)
    const scale = (1 - t * 0.08) * 0.9;
    group.scale.setScalar(scale);

    lastSmooth.current = smooth.current;
  });

  return (
    <group ref={groupRef}>
      {/* Main paper body — matte white with flat shading for fold definition */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#F5F5F5"
          roughness={0.85}
          metalness={0.02}
          flatShading={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ruby-red accent along the spine (thin box) */}
      <mesh position={[0, 0.16, 0.8]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.015, 0.006, 2.6]} />
        <meshStandardMaterial
          color="#FF4336"
          roughness={0.35}
          metalness={0.1}
          emissive="#B71C1C"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Red accent on left wing tip (small triangle) */}
      <mesh position={[-1.3, -0.08, -0.3]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.3, 0.004, 0.25]} />
        <meshStandardMaterial
          color="#FF4336"
          roughness={0.4}
          emissive="#B71C1C"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Wing leading edge highlights */}
      <mesh position={[-0.8, 0.0, 1.0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.003, 0.003, 2.2]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      <mesh position={[0.8, 0.0, 1.0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.003, 0.003, 2.2]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
    </group>
  );
}
