"use client";

import { cn } from "@/lib/utils";

/**
 * Nirvash CV Maker logo system.
 * Icon: geometric "N" mark with a red diagonal slash.
 * Wordmark: "NIRVASH" heavy type with a red triangle "A" + "CV MAKER" spaced subtext flanked by red rules.
 */

type IconProps = {
  className?: string;
  /** color of the N structural bars. defaults to currentColor */
  barColor?: string;
  /** show the filled rounded-square backdrop (for favicons / empty states) */
  withBackdrop?: boolean;
};

export function LogoIcon({
  className,
  barColor = "currentColor",
  withBackdrop = false,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      {withBackdrop && <rect width="48" height="48" rx="11" fill="#212121" />}
      {/* N structural bars */}
      <path
        d="M11 36 V12 H17 V26 L31 12 H37 V36 H31 V22 L17 36 Z"
        fill={barColor}
      />
      {/* Red diagonal slash through the N */}
      <path d="M14 36 L34 12 L37.2 12 L17.2 36 Z" fill="#FF4336" />
    </svg>
  );
}

type WordmarkProps = {
  className?: string;
  /** text color of NIRVASH letters (excl. red A) */
  color?: string;
  /** color of "CV MAKER" subtext. defaults to a muted tone */
  subColor?: string;
  /** show the "CV MAKER" subtext line */
  showSub?: boolean;
  /** size scale */
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { h: 18, sub: 7.5, gap: 4 },
  md: { h: 24, sub: 9.5, gap: 5 },
  lg: { h: 34, sub: 13, gap: 7 },
};

export function LogoWordmark({
  className,
  color = "currentColor",
  subColor,
  size = "md",
  showSub = true,
}: WordmarkProps) {
  const s = sizeMap[size];
  const W = 320;
  const H = 96;
  const subC = subColor ?? color;
  const subOpacity = subColor ? 1 : 0.55;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      style={{ height: s.h }}
      role="img"
      aria-label="Nirvash CV Maker"
    >
      <text
        x="0"
        y="60"
        fontFamily="var(--font-geist-sans), Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="74"
        letterSpacing="-2"
        fill={color}
      >
        NIRV
      </text>
      {/* Red triangle 'A' positioned after NIRV */}
      <path d="M176 60 L196 14 L216 60 L208 60 L196 32 L184 60 Z" fill="#FF4336" />
      <text
        x="216"
        y="60"
        fontFamily="var(--font-geist-sans), Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="74"
        letterSpacing="-2"
        fill={color}
      >
        SH
      </text>

      {showSub && (
        <g opacity={subOpacity}>
          <rect x="40" y="80" width="56" height="2.4" rx="1.2" fill="#FF4336" />
          <text
            x="106"
            y="85"
            fontFamily="var(--font-geist-sans), Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="20"
            letterSpacing="6"
            fill={subC}
          >
            CV MAKER
          </text>
          <rect x="224" y="80" width="56" height="2.4" rx="1.2" fill="#FF4336" />
        </g>
      )}
    </svg>
  );
}

/** Compact brand lockup used in navbars / footers */
export function NirvashBrand({
  className,
  variant = "dark",
  size = "md",
  showSub = true,
}: {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  showSub?: boolean;
}) {
  const barColor = variant === "dark" ? "#FFFFFF" : "#212121";
  const textColor = variant === "dark" ? "#FFFFFF" : "#212121";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon barColor={barColor} className={size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8"} />
      <LogoWordmark color={textColor} subColor={textColor} size={size} showSub={showSub} />
    </div>
  );
}
