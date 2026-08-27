"use client";

import { NirvashBrand } from "@/components/brand/logo";
import { useAppStore } from "@/lib/store/app-store";
import { Mail } from "lucide-react";

export function Footer({ onNavigate }: { onNavigate?: (target: string) => void }) {
  const setView = useAppStore((s) => s.setView);
  const startCreate = () => {
    setView("create-start");
    window.scrollTo({ top: 0 });
  };
  const nav = (t: string) => onNavigate?.(t);

  return (
    <footer className="bg-[#212121] text-white border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <NirvashBrand variant="dark" size="md" />
            <p className="mt-5 text-white/55 text-sm leading-relaxed max-w-xs">
              Your CV. Made Effortlessly. Create a professional CV without
              struggling with complicated forms, layouts, or design.
            </p>
            <button
              onClick={startCreate}
              className="mt-6 inline-flex items-center text-nirvash-red hover:text-white transition-colors text-sm font-semibold link-underline"
            >
              Create your CV →
            </button>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] text-white/40 uppercase mb-5">
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", target: "home" },
                { label: "Templates", target: "templates" },
                { label: "Features", target: "features" },
                { label: "How It Works", target: "how" },
                { label: "Help", target: "help" },
              ].map((l) => (
                <li key={l.target}>
                  <button
                    onClick={() => nav(l.target)}
                    className="text-sm text-white/65 hover:text-white transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.18em] text-white/40 uppercase mb-5">
              Contact
            </h4>
            <a
              href="mailto:nirvash2026@gmail.com"
              className="group inline-flex items-center gap-2.5 text-sm text-white/65 hover:text-white transition-colors"
            >
              <Mail className="size-4 text-nirvash-red" />
              nirvash2026@gmail.com
            </a>
            <p className="mt-6 text-xs text-white/40 leading-relaxed">
              Building the simplest way to create a professional CV.
            </p>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/45">
            © 2026 Nirvash. All rights reserved.
          </p>
          <p className="text-xs text-white/45">
            Designed to make you stand out.
          </p>
        </div>
      </div>
    </footer>
  );
}
