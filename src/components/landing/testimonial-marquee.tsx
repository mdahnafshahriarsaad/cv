"use client";

import * as React from "react";

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Product Designer at Figma", text: "I've tried every CV builder. Nirvash is the only one that made me actually enjoy the process. The templates are genuinely beautiful.", initial: "S", color: "#FF4336" },
  { name: "Marcus Webb", role: "Senior Engineer at Vercel", text: "The guided flow is brilliant. I had a professional CV ready in 8 minutes. The Vertex template got me three interviews.", initial: "M", color: "#B71C1C" },
  { name: "Aisha Patel", role: "Marketing Lead at Notion", text: "Finally a CV maker that doesn't look like it was built in 2015. The dark mode + red accent is exactly my aesthetic.", initial: "A", color: "#FF4336" },
  { name: "James O'Brien", role: "UX Researcher at Linear", text: "The live preview is a game-changer. Seeing changes instantly without saving is how every tool should work.", initial: "J", color: "#B71C1C" },
  { name: "Yuki Tanaka", role: "Frontend Developer at Stripe", text: "54 templates and they're all actually different. Not just color swaps. Each one has a real, distinct layout.", initial: "Y", color: "#FF4336" },
  { name: "Elena Rodriguez", role: "Product Manager at Airbnb", text: "I downloaded my CV as PDF and it looked identical to the preview. No surprises, no broken formatting. Professional.", initial: "E", color: "#B71C1C" },
];

/**
 * Infinite-scroll testimonial marquee.
 * Two rows scrolling in opposite directions for dynamic visual interest.
 * Pure CSS animation for 60fps performance.
 */
export function TestimonialMarquee() {
  return (
    <section className="relative bg-[#212121] text-white overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 red-ambient opacity-30" />
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-14">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-nirvash-red uppercase">
            Loved by Professionals
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Don't just take our word for it.
          </h2>
        </div>

        {/* Row 1 — scrolls left */}
        <div className="relative flex overflow-hidden">
          <div className="flex gap-5 animate-marquee-left shrink-0">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right (offset start) */}
        <div className="relative flex overflow-hidden mt-5">
          <div className="flex gap-5 animate-marquee-right shrink-0">
            {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>

        {/* edge fade overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#212121] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#212121] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="w-[340px] shrink-0 rounded-[14px] border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-nirvash-red/25 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="size-10 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0"
          style={{ background: t.color }}
        >
          {t.initial}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-white">{t.name}</p>
          <p className="text-[11px] text-white/45">{t.role}</p>
        </div>
      </div>
      <p className="text-[13px] text-white/70 leading-relaxed">{t.text}</p>
    </div>
  );
}
