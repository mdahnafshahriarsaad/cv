"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Nirvash brand button system.
 * - primary: bright red #FF4336, hover deep ruby #B71C1C, soft glow + lift
 * - secondary: transparent / subtle dark glass, light border
 * - ghost: minimal hover surface
 * - danger: deep ruby for destructive actions
 * - light: for dark CTAs on light backgrounds (charcoal)
 */
const brandButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nirvash-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-nirvash-red text-white btn-glow hover:bg-nirvash-ruby hover:-translate-y-0.5",
        secondary:
          "bg-white/8 text-white border border-white/20 backdrop-blur-md hover:bg-white/15 hover:border-white/35 hover:-translate-y-0.5",
        secondaryLight:
          "bg-[#212121]/5 text-[#212121] border border-[#212121]/10 hover:bg-[#212121]/10 hover:-translate-y-0.5",
        ghost: "text-current hover:bg-white/8",
        ghostLight: "text-[#212121] hover:bg-[#212121]/5",
        danger:
          "bg-nirvash-ruby text-white hover:bg-[#8b1414] hover:-translate-y-0.5 shadow-lg shadow-nirvash-ruby/25",
        light: "bg-[#212121] text-white hover:bg-[#0a0a0a] hover:-translate-y-0.5",
        outlineRed:
          "bg-transparent text-nirvash-red border border-nirvash-red/30 hover:bg-nirvash-red/8",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[15px]",
        xl: "h-14 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface BrandButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof brandButtonVariants> {
  asChild?: boolean;
}

export function BrandButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: BrandButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="brand-button"
      className={cn(brandButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

/**
 * Button-in-Button trailing icon — the arrow sits inside its own nested
 * circular wrapper that translates diagonally on hover, creating internal
 * kinetic tension (per high-end-visual-design skill).
 */
export function ButtonArrow({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center size-5 rounded-full bg-black/10 dark:bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </span>
  );
}

export { brandButtonVariants };
