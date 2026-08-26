"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Form primitives tuned for the dark Nirvash builder UI.
 * Inputs use subtle white borders, red focus accent, clear helper text.
 */

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-white/80"
        >
          {label}
          {required && <span className="text-nirvash-red ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-nirvash-red">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-white/40">{hint}</p>
      ) : null}
    </div>
  );
}

/** Input styled for dark surfaces */
export const DarkInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      "h-11 rounded-[10px] bg-white/[0.04] border-white/12 text-white placeholder:text-white/30",
      "focus-visible:border-nirvash-red focus-visible:ring-nirvash-red/20",
      "transition-colors",
      className
    )}
    {...props}
  />
));
DarkInput.displayName = "DarkInput";

/** Textarea styled for dark surfaces */
export const DarkTextarea = React.forwardRef<
  React.ElementRef<typeof Textarea>,
  React.ComponentProps<typeof Textarea>
>(({ className, ...props }, ref) => (
  <Textarea
    ref={ref}
    className={cn(
      "min-h-[120px] rounded-[10px] bg-white/[0.04] border-white/12 text-white placeholder:text-white/30",
      "focus-visible:border-nirvash-red focus-visible:ring-nirvash-red/20",
      "transition-colors resize-y leading-relaxed",
      className
    )}
    {...props}
  />
));
DarkTextarea.displayName = "DarkTextarea";

/** Month input (YYYY-MM) */
export function MonthInput({
  value,
  onChange,
  placeholder = "Select date",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "h-11 rounded-[10px] bg-white/[0.04] border-white/12 text-white",
        "focus-visible:border-nirvash-red focus-visible:ring-nirvash-red/20",
        "[color-scheme:dark]",
        className
      )}
    />
  );
}

/** Light input styled for light surfaces */
export const LightInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      "h-11 rounded-[10px] bg-white border-[#e5e5e5] text-[#212121] placeholder:text-[#9a9a9a]",
      "focus-visible:border-nirvash-red focus-visible:ring-nirvash-red/20",
      "transition-colors",
      className
    )}
    {...props}
  />
));
LightInput.displayName = "LightInput";

export const LightTextarea = React.forwardRef<
  React.ElementRef<typeof Textarea>,
  React.ComponentProps<typeof Textarea>
>(({ className, ...props }, ref) => (
  <Textarea
    ref={ref}
    className={cn(
      "min-h-[120px] rounded-[10px] bg-white border-[#e5e5e5] text-[#212121] placeholder:text-[#9a9a9a]",
      "focus-visible:border-nirvash-red focus-visible:ring-nirvash-red/20",
      "transition-colors resize-y leading-relaxed",
      className
    )}
    {...props}
  />
));
LightTextarea.displayName = "LightTextarea";
