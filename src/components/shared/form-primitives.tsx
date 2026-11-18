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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const selectCls = cn(
  "h-11 w-full appearance-none rounded-[10px] border border-white/12 bg-white/[0.04] pl-3 pr-7 text-[14px] text-white",
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23ffffff80' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[right_0.6rem_center] bg-no-repeat",
  "outline-none transition-colors focus-visible:border-nirvash-red focus-visible:ring-[3px] focus-visible:ring-nirvash-red/20",
  "disabled:cursor-not-allowed disabled:opacity-40 [color-scheme:dark]"
);

/**
 * Month + year picker storing "YYYY-MM", or "YYYY" when no month is chosen.
 * Uses plain selects because `<input type="month">` is missing in Firefox and Safari.
 */
export function MonthInput({
  value,
  onChange,
  disabled,
  label = "Date",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  /** used for the selects' accessible names */
  label?: string;
  className?: string;
}) {
  const [y = "", m = ""] = (value || "").split("-");
  const thisYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const list: string[] = [];
    for (let yr = thisYear + 6; yr >= thisYear - 60; yr--) list.push(String(yr));
    if (y && !list.includes(y)) list.push(y);
    return list;
  }, [thisYear, y]);

  const set = (year: string, month: string) => onChange(year ? (month ? `${year}-${month}` : year) : "");

  return (
    <div className={cn("grid grid-cols-[1fr_1.1fr] gap-1.5", className)}>
      <select
        aria-label={`${label} month`}
        className={selectCls}
        value={m}
        disabled={disabled}
        onChange={(e) => set(y || String(thisYear), e.target.value)}
      >
        <option value="">Month</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, "0")}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={`${label} year`}
        className={selectCls}
        value={y}
        disabled={disabled}
        onChange={(e) => set(e.target.value, e.target.value ? m : "")}
      >
        <option value="">Year</option>
        {years.map((yr) => (
          <option key={yr} value={yr}>
            {yr}
          </option>
        ))}
      </select>
    </div>
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
