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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nirvash-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-nirvash-red text-white btn-glow hover:bg-nirvash-ruby hover:-translate-y-0.5",
        secondary:
          "bg-white/5 text-white border border-white/20 backdrop-blur-sm hover:bg-white/10 hover:border-white/30",
        secondaryLight:
          "bg-[#212121]/5 text-[#212121] border border-[#212121]/15 hover:bg-[#212121]/10",
        ghost: "text-current hover:bg-white/10",
        ghostLight: "text-[#212121] hover:bg-[#212121]/5",
        danger:
          "bg-nirvash-ruby text-white hover:bg-[#8b1414] hover:-translate-y-0.5 shadow-lg shadow-nirvash-ruby/30",
        light: "bg-[#212121] text-white hover:bg-black hover:-translate-y-0.5",
        outlineRed:
          "bg-transparent text-nirvash-red border border-nirvash-red/40 hover:bg-nirvash-red/10",
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

export { brandButtonVariants };
