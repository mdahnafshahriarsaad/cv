"use client";

import * as React from "react";
import * as THREE from "three";
import { createPaperPlane, NIRVASH } from "./paper-plane-model";

/**
 * ScrollPaperAirplane — a real 3D folded-paper airplane that flies along a
 * smooth 3D path driven by scroll progress.
 *
 * - One fixed, pointer-events-none WebGL canvas (single renderer, imperative
 *   loop — no React state updates per scroll/frame).
 * - Flight path: centripetal Catmull-Rom curve in world space. Scroll progress
 *   is the curve parameter, so scrolling up retraces the same path.
 * - Orientation: the model's forward axis is +Z. Each frame we build a basis
 *   from the path tangent (flipped when the scroll direction reverses), turn
 *   it into a quaternion and slerp toward it → the nose always faces the
 *   direction of travel, with no per-waypoint hacks, flips or snapping.
 * - Banking comes from the horizontal turn rate; pitch comes from the tangent.
 */

// Waypoints: [x, y] in normalised viewport units (-1..1, y up), z in world units.
const WAYPOINTS: ReadonlyArray<readonly [number, number, number]> = [
  [0.52, 0.48, 0.0],
  [0.12, 0.68, -1.5],
  [-0.44, 0.44, 0.5],
  [-0.92, 0.14, 1.8],
  [-1.16, -0.12, 1.0],
  [-0.92, -0.34, -0.5],
  [-0.44, -0.42, -1.2],
  [0.06, -0.14, 0.2],
  [-0.24, 0.18, 1.2],
  [-0.6, 0.02, 0.5],
];

const TRAIL_POINTS = 28;
const CAM_Y = 5.2;
const CAM_Z = 13;
const FOV = 32;

export function ScrollPaperAirplane() {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = () => window.innerWidth < 768;
    const weak = isMobile() || (navigator.hardwareConcurrency ?? 8) <= 4;

    // ── renderer (graceful fallback: if WebGL is unavailable we simply render nothing)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile(),
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    const useShadows = !weak;
    renderer.shadowMap.enabled = useShadows;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const canvas = renderer.domElement;
    canvas.style.cssText = "width:100%;height:100%;display:block;pointer-events:none;";
    canvas.setAttribute("aria-hidden", "true");
    mount.appendChild(canvas);

    // ── scene / camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, CAM_Y, CAM_Z);
    camera.lookAt(0, 0, 0);

    // ── lighting: soft key (top/side), gentle ambient, subtle ruby rim
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 0.7);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-4, 7, 5);
    if (useShadows) {
      key.castShadow = true;
      key.shadow.mapSize.set(512, 512);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 30;
      key.shadow.camera.left = key.shadow.camera.bottom = -2.5;
      key.shadow.camera.right = key.shadow.camera.top = 2.5;
      key.shadow.bias = -0.0006;
      key.shadow.normalBias = 0.02;
    }
    const fill = new THREE.DirectionalLight(0xdfe6ff, 0.45);
    fill.position.set(5, 2, 4);
    const rim = new THREE.DirectionalLight(new THREE.Color(NIRVASH.red), 0.35);
    rim.position.set(3, 3, -6);
    const under = new THREE.DirectionalLight(0xffffff, 0.5);
    under.position.set(-2, -6, 3);
    scene.add(hemi, key, fill, rim, under, key.target);

    // ── model (geometry & materials created once and reused)
    const plane = createPaperPlane({ simple: weak });
    const model = plane.group;
    const root = new THREE.Group();
    root.add(model);
    scene.add(root);

    // ── restrained fading trail (preallocated, never reallocated per frame)
    const showTrail = !isMobile() && !reduceMotion;
    const trailPos = new Float32Array(TRAIL_POINTS * 3);
    const trailCol = new Float32Array(TRAIL_POINTS * 4);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3).setUsage(THREE.DynamicDrawUsage));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 4).setUsage(THREE.DynamicDrawUsage));
    const trailMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
    const trail = new THREE.Line(trailGeo, trailMat);
    trail.frustumCulled = false;
    trail.visible = showTrail;
    scene.add(trail);
    const trailC = new THREE.Color(NIRVASH.red);
    for (let i = 0; i < TRAIL_POINTS; i++) {
      trailCol[i * 4] = trailC.r;
      trailCol[i * 4 + 1] = trailC.g;
      trailCol[i * 4 + 2] = trailC.b;
    }

    // ── flight path (rebuilt only on resize)
    let curve = new THREE.CatmullRomCurve3(
      WAYPOINTS.map(() => new THREE.Vector3()),
      false,
      "centripetal",
    );
    let baseScale = 0.2;
    const buildPath = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setPixelRatio(weak ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const dist = Math.hypot(CAM_Y, CAM_Z);
      const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * dist;
      const halfW = halfH * camera.aspect;
      curve = new THREE.CatmullRomCurve3(
        WAYPOINTS.map(([x, y, z]) => new THREE.Vector3(x * halfW, y * halfH, z)),
        false,
        "centripetal",
      );
      baseScale = (2 * halfH * (isMobile() ? 0.13 : 0.2)) / plane.length;
    };
    buildPath();

    // ── scratch objects (no per-frame allocation)
    const pos = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const tanAhead = new THREE.Vector3();
    const f = new THREE.Vector3();
    const fa = new THREE.Vector3();
    const bx = new THREE.Vector3();
    const by = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const zAxis = new THREE.Vector3(0, 0, 1);
    const basis = new THREE.Matrix4();
    const qTarget = new THREE.Quaternion();
    const qRoll = new THREE.Quaternion();
    const qIdle = new THREE.Quaternion();
    const eIdle = new THREE.Euler();
    const turn = new THREE.Vector3();

    const state = {
      target: 0,
      smooth: 0,
      last: 0,
      dir: 1,
      bank: 0,
      idle: 0,
      speed: 0,
      raf: 0,
      running: false,
      lastFrame: 0,
    };

    // ── scroll progress (ref only — no React state)
    let scrollRaf = -1;
    const readScroll = () => {
      const sh = document.documentElement.scrollHeight - window.innerHeight;
      state.target = sh > 0 ? Math.max(0, Math.min(1, window.scrollY / sh)) : 0;
      scrollRaf = -1;
    };
    const onScroll = () => {
      if (scrollRaf === -1) scrollRaf = requestAnimationFrame(readScroll);
    };

    const place = (t: number, dt: number, snap: boolean) => {
      curve.getPointAt(t, pos);
      curve.getTangentAt(t, tan);
      const tAhead = Math.max(0, Math.min(1, t + 0.012 * state.dir));
      curve.getTangentAt(tAhead, tanAhead);

      // travel direction: tangent, flipped when scrolling backwards
      f.copy(tan).multiplyScalar(state.dir).normalize();
      fa.copy(tanAhead).multiplyScalar(state.dir).normalize();

      // basis: z = forward, x = up × forward, y = forward × x  (nose = +Z)
      bx.crossVectors(up, f).normalize();
      by.crossVectors(f, bx);
      basis.makeBasis(bx, by, f);
      qTarget.setFromRotationMatrix(basis);

      // banking from horizontal turn rate; +0.42 rad base roll shows the top & V-section
      turn.crossVectors(f, fa);
      const rawBank = THREE.MathUtils.clamp(-turn.y * 14, -0.55, 0.55);
      state.bank += (rawBank - state.bank) * Math.min(dt * 4, 1);
      qRoll.setFromAxisAngle(zAxis, state.bank + 0.42);
      qTarget.multiply(qRoll);

      // gentle idle hover
      const hover = Math.sin(state.idle * 1.1);
      eIdle.set(Math.sin(state.idle * 0.9) * 0.03, 0, Math.sin(state.idle * 0.7) * 0.05);
      qIdle.setFromEuler(eIdle);
      qTarget.multiply(qIdle);

      if (snap) root.quaternion.copy(qTarget);
      else root.quaternion.slerp(qTarget, 1 - Math.exp(-dt * 6));

      // perspective-based scale: closer to camera → naturally larger; add a touch of taper over the journey
      const s = baseScale * (1 - t * 0.05);
      root.scale.setScalar(s);
      root.position.set(pos.x, pos.y + hover * 0.045, pos.z);
    };

    const updateTrail = (strength: number) => {
      if (!showTrail) return;
      // newest point at index 0 (slightly behind the tail), older points shift down
      trailPos.copyWithin(3, 0, (TRAIL_POINTS - 1) * 3);
      trailPos[0] = root.position.x - f.x * 0.25;
      trailPos[1] = root.position.y - f.y * 0.25;
      trailPos[2] = root.position.z - f.z * 0.25;
      for (let i = 0; i < TRAIL_POINTS; i++) {
        const k = 1 - i / (TRAIL_POINTS - 1);
        trailCol[i * 4 + 3] = k * k * 0.28 * strength;
      }
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.color.needsUpdate = true;
    };

    const frame = (now: number) => {
      if (!state.running) return;
      const dt = Math.min((now - state.lastFrame) / 1000, 0.05);
      state.lastFrame = now;

      state.smooth += (state.target - state.smooth) * Math.min(dt * 8, 1);
      const t = THREE.MathUtils.clamp(state.smooth, 0, 1);
      const dv = state.smooth - state.last;
      if (Math.abs(dv) > 0.00002) state.dir = dv > 0 ? 1 : -1;
      state.last = state.smooth;

      const gap = Math.abs(state.target - state.smooth);
      const moving = gap > 0.003;
      state.speed += ((moving ? 1 : 0) - state.speed) * Math.min(dt * 4, 1);
      if (!moving) state.idle += dt;
      else state.idle *= 0.92;

      place(t, dt, false);
      if (moving) updateTrail(Math.min(1, gap * 8 + 0.3) * state.speed);
      else if (showTrail && state.speed > 0.01) updateTrail(state.speed);

      renderer.render(scene, camera);
      state.raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (state.running || reduceMotion) return;
      state.running = true;
      state.lastFrame = performance.now();
      state.raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      state.running = false;
      cancelAnimationFrame(state.raf);
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        buildPath();
        readScroll();
        if (reduceMotion) renderStatic();
      }, 120);
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      stop();
    };
    const onContextRestored = () => start();

    // reduced motion: draw one static, well-lit frame; no loop
    const renderStatic = () => {
      place(0.12, 0.016, true);
      renderer.render(scene, camera);
    };

    readScroll();
    state.smooth = state.last = state.target;
    if (reduceMotion) renderStatic();
    else start();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      stop();
      if (scrollRaf !== -1) cancelAnimationFrame(scrollRaf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      plane.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-[5] pointer-events-none"
    />
  );
}
