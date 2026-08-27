"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { NirvashBrand } from "@/components/brand/logo";
import { BrandButton } from "@/components/shared/brand-button";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", target: "home" },
  { label: "How It Works", target: "how" },
  { label: "Templates", target: "templates" },
  { label: "Features", target: "features" },
];

export function Navbar({ onNavigate }: { onNavigate?: (target: string) => void }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("home");
  const setView = useAppStore((s) => s.setView);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (target: string) => {
    setOpen(false);
    setActive(target);
    onNavigate?.(target);
  };

  const startCreate = () => {
    setOpen(false);
    setView("create-start");
    window.scrollTo({ top: 0 });
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav border-b border-white/5" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("flex items-center justify-between transition-all", scrolled ? "h-14" : "h-16 sm:h-18")}>
          {/* Brand */}
          <button
            onClick={() => go("home")}
            className="flex items-center transition-opacity hover:opacity-90"
            aria-label="Nirvash CV Maker home"
          >
            <NirvashBrand variant="dark" size="sm" showSub />
          </button>

          {/* Desktop nav with animated underline */}
          <nav className="hidden md:flex items-center gap-1 relative">
            {NAV_LINKS.map((l) => {
              const isActive = active === l.target;
              return (
                <button
                  key={l.target}
                  onClick={() => go(l.target)}
                  onMouseEnter={() => setActive(l.target)}
                  className={cn(
                    "relative px-3.5 py-2 text-[13px] font-medium transition-colors",
                    isActive ? "text-white" : "text-white/55 hover:text-white/80"
                  )}
                >
                  {l.label}
                  {isActive && (
                    <span className="absolute left-3.5 right-3.5 -bottom-0.5 h-px bg-nirvash-red" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-[13px] font-medium text-white/60 hover:text-white transition-colors px-3 py-2">
              Sign In
            </button>
            <BrandButton variant="primary" size="sm" onClick={startCreate} className="group">
              Create My CV
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </BrandButton>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2 -mr-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-nav border-t border-white/5">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <button
                key={l.target}
                onClick={() => go(l.target)}
                className="block w-full text-left px-3 py-2.5 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {l.label}
              </button>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
              <button className="block w-full text-left px-3 py-2.5 text-[13px] font-medium text-white/80 hover:text-white">
                Sign In
              </button>
              <BrandButton variant="primary" size="lg" className="w-full" onClick={startCreate}>
                Create My CV
              </BrandButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
