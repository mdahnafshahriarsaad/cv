"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, LayoutGroup } from "framer-motion";
import { Menu, X } from "lucide-react";
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
 * Compact pill with brand + menu trigger. Expands on click into a wider
 * glass pill with staggered link reveals + numbered indices.
 * Morphs smoothly using Framer Motion layout animations.
 */
export function Navbar({ onNavigate }: { onNavigate?: (target: string) => void }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("home");
  const setView = useAppStore((s) => s.setView);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  const go = (target: string) => {
    setActive(target);
    onNavigate?.(target);
    // auto-close on mobile, stay open on desktop
    if (window.innerWidth < 768) setOpen(false);
  };

  const startCreate = () => {
    setOpen(false);
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      {/* Floating island nav */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-4"
      >
        <LayoutGroup>
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "flex items-center rounded-full border transition-shadow duration-500",
              scrolled
                ? "glass-nav border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
                : "bg-white/[0.04] border-white/8 backdrop-blur-xl"
            )}
          >
            {/* Brand — always visible, toggles menu on click */}
            <button
              onClick={() => go("home")}
              className="flex items-center py-2.5 pl-4 pr-2 shrink-0"
              aria-label="Nirvash home"
            >
              <NirvashBrand variant="dark" size="sm" showSub={false} />
            </button>

            {/* Expanded links — animated reveal */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.nav
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  className="overflow-hidden flex items-center"
                >
                  {NAV_LINKS.map((l, i) => {
                    const isActive = active === l.target;
                    return (
                      <motion.button
                        key={l.target}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
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
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.nav>
              )}
            </AnimatePresence>

            {/* CTA — visible when open on desktop */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ width: 0, opacity: 0, scale: 0.8 }}
                  animate={{ width: "auto", opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.1 }}
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

            {/* Menu toggle — hamburger morphs to X */}
            <button
              className="p-3 text-white shrink-0"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <div className="relative size-5 flex flex-col items-center justify-center">
                <motion.span
                  animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="absolute h-0.5 w-5 rounded-full bg-white"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="absolute h-0.5 w-5 rounded-full bg-white"
                />
              </div>
            </button>
          </motion.div>
        </LayoutGroup>
      </motion.header>

      {/* Mobile dropdown (when expanded on small screens) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#212121]/80 backdrop-blur-2xl"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-20 inset-x-4 rounded-[20px] border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-2xl p-3 shadow-2xl"
            >
              {NAV_LINKS.map((l, i) => (
                <motion.button
                  key={l.target}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go(l.target)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-[12px] hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-[16px] font-medium text-white">{l.label}</span>
                  <span className="text-[11px] font-mono text-white/30">{l.num}</span>
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + NAV_LINKS.length * 0.06 + 0.05 }}
                className="pt-3 mt-2 border-t border-white/8 space-y-2"
              >
                <button className="block w-full text-left px-4 py-3 text-[15px] font-medium text-white/75">
                  Sign In
                </button>
                <MagneticCTA variant="primary" size="lg" className="w-full" onClick={startCreate}>
                  Create My CV
                </MagneticCTA>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
