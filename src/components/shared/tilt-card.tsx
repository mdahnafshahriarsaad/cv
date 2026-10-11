"use client";

import * as React from "react";
import Atropos from "atropos/react";

/**
 * Atropos 3D tilt card — premium hover effect.
 * The card tilts in 3D following the cursor with parallax layers.
 * Uses the Atropos library for buttery-smooth 3D transforms.
 */
export function TiltCard({
  children,
  className,
  highlightColor = "rgba(255,67,54,0.3)",
}: {
  children: React.ReactNode;
  className?: string;
  highlightColor?: string;
}) {
  return (
    <Atropos
      className={className}
      highlight={false}
      shadow={false}
      rotateXMax={8}
      rotateYMax={8}
      stretch={6}
      activeOffset={40}
    >
      {/* spotlight overlay that follows the cursor */}
      <div
        className="atropos-spotlight pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at var(--atropos-pointer-x, 50%) var(--atropos-pointer-y, 50%), ${highlightColor}, transparent 60%)`,
        }}
      />
      {children}
    </Atropos>
  );
}
