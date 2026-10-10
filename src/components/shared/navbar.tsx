"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { NirvashBrand } from "@/components/brand/logo";
import { MagneticCTA } from "@/components/shared/magnetic-button";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", target: "home", num: "01" },
  { label: "How It Works", target: "how", num: "02" },
  { label: "Templates", target: "templates", num: "03" },
  { label: "Features", target: "features", num: "04" },
];

/**
 * Floating glass-pill island navigation.
 * Opens on HOVER (not click) with smooth spring animation.
 * Collapses automatically when the cursor leaves.
 */
export function Navbar({ onNavigate }: { onNavigate?: (target: string) => void }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [active, setActive] = React.useState("home");
  const setView = useAppStore((s) => s.setView);
  const { scrollY } = useScroll();
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  const go = (target: string) => {
    setActive(target);
    onNavigate?.(target);
  };

  const startCreate = () => {
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHovered(true);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setHovered(false), 200);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-4"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <motion.div
        animate={{
          width: hovered ? "auto" : "auto",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className={cn(
          "flex items-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "glass-nav border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
            : "bg-white/[0.04] border-white/8 backdrop-blur-xl"
        )}
      >
        {/* Brand */}
        <button
          onClick={() => go("home")}
          className="flex items-center py-2.5 pl-4 pr-2 shrink-0"
          aria-label="Nirvash home"
        >
          <NirvashBrand variant="dark" size="sm" showSub={false} />
        </button>

        {/* Expanded links — smooth width + opacity on hover */}
        <AnimatePresence initial={false}>
          {hovered && (
            <motion.nav
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="overflow-hidden flex items-center"
            >
              {NAV_LINKS.map((l, i) => {
                const isActive = active === l.target;
                return (
                  <motion.button
                    key={l.target}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: 0.03 * i, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => go(l.target)}
                    onMouseEnter={() => setActive(l.target)}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-full whitespace-nowrap",
                      isActive ? "text-white" : "text-white/55 hover:text-white/85"
                    )}
                  >
                    <span className="text-[9px] font-mono text-white/25 tabular-nums">{l.num}</span>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-island-active"
                        className="absolute inset-0 rounded-full bg-white/8 -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* CTA — appears on hover */}
        <AnimatePresence initial={false}>
          {hovered && (
            <motion.div
              initial={{ width: 0, opacity: 0, scale: 0.85 }}
              animate={{ width: "auto", opacity: 1, scale: 1 }}
              exit={{ width: 0, opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 35, delay: 0.05 }}
              className="overflow-hidden flex items-center pr-2 pl-1"
            >
              <button className="text-[13px] font-medium text-white/65 hover:text-white transition-colors px-2 py-1.5 whitespace-nowrap">
                Sign In
              </button>
              <MagneticCTA variant="primary" size="sm" onClick={startCreate}>
                Create My CV
              </MagneticCTA>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu icon — subtle, always visible */}
        <div className="p-3 shrink-0">
          <div className="relative size-5 flex flex-col items-center justify-center gap-1">
            <motion.span
              animate={{ width: hovered ? 12 : 20, opacity: hovered ? 0.4 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="h-0.5 rounded-full bg-white"
            />
            <motion.span
              animate={{ width: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="h-0.5 rounded-full bg-white"
            />
            <motion.span
              animate={{ width: hovered ? 12 : 20, opacity: hovered ? 0.4 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="h-0.5 rounded-full bg-white"
            />
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
