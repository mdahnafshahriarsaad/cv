"use client";

import { LogoIcon } from "@/components/brand/logo";
import { useAppStore } from "@/lib/store/app-store";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const loading = useAppStore((s) => s.loading);
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-[#212121] flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <LogoIcon barColor="#FFFFFF" withBackdrop className="size-14" />
            <span className="mt-5 text-white font-extrabold tracking-[0.2em] text-lg">
              NIRVASH
            </span>
            <div className="mt-5 h-0.5 w-28 bg-white/10 overflow-hidden rounded-full">
              <div className="h-full bg-nirvash-red loading-grow" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
