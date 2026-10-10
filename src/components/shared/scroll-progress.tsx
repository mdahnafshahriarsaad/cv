"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Scroll progress bar — thin red line at the very top of the page
 * that fills as the user scrolls. Uses spring physics for smooth motion.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-nirvash-red via-nirvash-red to-nirvash-ruby origin-left z-[60]"
    />
  );
}
