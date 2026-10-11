"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { BrandButton, ButtonArrow } from "@/components/shared/brand-button";
import { cn } from "@/lib/utils";

/**
 * Magnetic button — physically pulls toward the cursor using spring physics.
 * Per high-end-visual-design skill: uses useMotionValue/useSpring (NOT useState)
 * to avoid React re-render performance collapse on mobile.
 *
 * The motion.div wrapper handles the magnetic transform; the inner button
 * handles its own hover/active states.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.25,
  ...props
}: React.ComponentProps<typeof BrandButton> & {
  strength?: number;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 18, mass: 0.3 });
  const sy = useSpring(my, { stiffness: 200, damping: 18, mass: 0.3 });

  const handleMove = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    mx.set((e.clientX - cx) * strength);
    my.set((e.clientY - cy) * strength);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="inline-block"
    >
      <BrandButton className={className} {...props}>
        {children}
      </BrandButton>
    </motion.div>
  );
}

/**
 * Magnetic CTA with the button-in-button trailing arrow.
 */
export function MagneticCTA({
  children,
  className,
  withArrow = true,
  ...props
}: React.ComponentProps<typeof BrandButton> & {
  withArrow?: boolean;
}) {
  return (
    <MagneticButton className={cn("group", className)} {...props}>
      {children}
      {withArrow && <ButtonArrow />}
    </MagneticButton>
  );
}
