"use client";

import * as React from "react";
import { CVDocument, Experience, Education, Project, ProfilePhoto } from "@/lib/cv-data/types";
import { getTemplate, TemplateDef, PhotoShape, FontPair } from "@/components/templates/registry";
import { cn } from "@/lib/utils";

/* ---------- helpers ---------- */

export function formatMonth(iso: string): string {
  if (!iso) return "";
  const [y, m] = iso.split("-");
  if (!y) return iso;
  if (!m) return y;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = parseInt(m, 10) - 1;
  if (idx < 0 || idx > 11) return y;
  return `${months[idx]} ${y}`;
}

export function dateRange(start: string, end: string, current?: boolean): string {
  const s = formatMonth(start);
  const e = current ? "Present" : formatMonth(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} — ${e}`;
}

function fontStack(f: FontPair): { heading: string; body: string } {
  switch (f) {
    case "serif":
      return { heading: "Georgia, 'Times New Roman', serif", body: "Georgia, 'Times New Roman', serif" };
    case "manrope":
      return { heading: "var(--font-manrope), var(--font-inter), sans-serif", body: "var(--font-inter), sans-serif" };
    case "mixed":
      return { heading: "var(--font-manrope), sans-serif", body: "Georgia, serif" };
    case "inter":
    default:
      return { heading: "var(--font-inter), sans-serif", body: "var(--font-inter), sans-serif" };
  }
}

function densityPad(d: string): string {
  if (d === "compact") return "py-2.5";
  if (d === "spacious") return "py-4";
  return "py-3";
}
function densityGap(d: string): string {
  if (d === "compact") return "gap-4";
  if (d === "spacious") return "gap-7";
  return "gap-5";
}
function marginScale(m: string): number {
  if (m === "narrow") return 0.88;
  if (m === "wide") return 1.12;
  return 1;
}

/* ---------- photo rendering ---------- */

function PhotoView({
  photo,
  shape,
  size = 96,
  className,
}: {
  photo: ProfilePhoto | null;
  shape: PhotoShape;
  size?: number;
  className?: string;
}) {
  if (!photo || !photo.dataUrl) return null;
  const radius =
    shape === "circle" ? "9999px"
    : shape === "rounded" ? "14%"
    : shape === "portrait" ? "8px"
    : shape === "square" ? "8px"
    : "8px";
  return (
    <div
      className={cn("overflow-hidden bg-neutral-200 shrink-0", className)}
      style={{
        width: size,
        height: shape === "portrait" ? size * 1.25 : size,
        borderRadius: radius,
        position: "relative",
      }}
    >
      <img
        src={photo.dataUrl}
        alt="Profile"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${50 + (photo.offsetX || 0) * 0.3}% ${50 + (photo.offsetY || 0) * 0.3}%`,
          transform: `scale(${photo.zoom || 1})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

/* ---------- shared section atoms ---------- */

function SectionLabel({
  children,
  def,
}: {
  children: React.ReactNode;
  def: TemplateDef;
}) {
  const { accent, accentDark } = def.palette;
  const style = def.accentStyle;
  if (style === "line") {
    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-neutral-800">{children}</span>
        <span className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.1)" }} />
      </div>
    );
  }
  if (style === "dot") {
    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="size-1.5 rounded-full" style={{ background: accent }} />
        <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-neutral-800">{children}</span>
      </div>
    );
  }
  if (style === "minimal") {
    return <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-neutral-500 mb-2">{children}</p>;
  }
  // block / band
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="inline-block w-4 h-0.5 rounded" style={{ background: accent }} />
      <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: accentDark }}>{children}</span>
    </div>
  );
}

function ExperienceItem({
  exp,
  def,
  variant = "default",
}: {
  exp: Experience;
  def: TemplateDef;
  variant?: "default" | "timeline";
}) {
  const { accent } = def.palette;
  const range = dateRange(exp.startDate, exp.endDate, exp.current);
  if (variant === "timeline") {
    return (
      <div className="relative pl-5 pb-4 last:pb-0">
        <span className="absolute left-0 top-1.5 size-2.5 rounded-full border-2 bg-white" style={{ borderColor: accent }} />
        <span className="absolute left-[5px] top-4 bottom-0 w-px" style={{ background: "rgba(0,0,0,0.1)" }} />
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-semibold text-[13px] leading-tight" style={{ color: def.palette.ink }}>
            {exp.jobTitle || "Job Title"}
            {exp.company && <span className="font-normal" style={{ color: def.palette.muted }}> · {exp.company}</span>}
          </h4>
          {range && <span className="text-[10.5px] whitespace-nowrap shrink-0" style={{ color: def.palette.muted }}>{range}</span>}
        </div>
        {exp.location && <p className="text-[10.5px] mt-0.5" style={{ color: def.palette.muted }}>{exp.location}</p>}
        {exp.responsibilities && (
          <ul className="mt-1.5 space-y-1">
            {exp.responsibilities.split("\n").filter(l => l.trim()).map((line, i) => (
              <li key={i} className="text-[11.5px] leading-[1.5] flex gap-1.5" style={{ color: def.palette.ink }}>
                <span style={{ color: accent }}>›</span><span>{line.replace(/^[-•]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-[12.5px] leading-tight" style={{ color: def.palette.ink }}>
          {exp.jobTitle || "Job Title"}
          {exp.company && <span className="font-normal" style={{ color: def.palette.muted }}> · {exp.company}</span>}
        </h4>
        {range && <span className="text-[10.5px] whitespace-nowrap shrink-0" style={{ color: def.palette.muted }}>{range}</span>}
      </div>
      {exp.location && <p className="text-[10.5px] mt-0.5" style={{ color: def.palette.muted }}>{exp.location}</p>}
      {exp.responsibilities && (
        <ul className="mt-1 space-y-0.5">
          {exp.responsibilities.split("\n").filter(l => l.trim()).map((line, i) => (
            <li key={i} className="text-[11.5px] leading-[1.5] flex gap-1.5" style={{ color: def.palette.ink }}>
              <span style={{ color: accent }}>•</span><span>{line.replace(/^[-•]\s*/, "")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationItem({ edu, def }: { edu: Education; def: TemplateDef }) {
  const range = dateRange(edu.startDate, edu.endDate);
  const title = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ");
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-[12.5px] leading-tight" style={{ color: def.palette.ink }}>
          {title || "Degree"}
        </h4>
        {range && <span className="text-[10.5px] whitespace-nowrap shrink-0" style={{ color: def.palette.muted }}>{range}</span>}
      </div>
      {edu.institution && <p className="text-[11.5px] mt-0.5" style={{ color: def.palette.muted }}>{edu.institution}{edu.location ? `, ${edu.location}` : ""}</p>}
      {edu.description && <p className="text-[11px] mt-0.5 leading-[1.5]" style={{ color: def.palette.muted }}>{edu.description}</p>}
    </div>
  );
}

function ProjectItem({ p, def }: { p: Project; def: TemplateDef }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-[12px]" style={{ color: def.palette.ink }}>{p.name || "Project"}</h4>
        {p.link && <span className="text-[10.5px] truncate max-w-[45%]" style={{ color: def.palette.muted }}>{p.link}</span>}
      </div>
      {p.description && <p className="text-[11px] mt-0.5 leading-[1.5]" style={{ color: def.palette.muted }}>{p.description}</p>}
      {p.technologies && <p className="text-[10.5px] mt-0.5" style={{ color: def.palette.accent }}>{p.technologies}</p>}
    </div>
  );
}

function SkillsCloud({ cv, def }: { cv: CVDocument; def: TemplateDef }) {
  if (cv.skills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {cv.skills.map((s) => (
        <span key={s.id} className="text-[10.5px] px-2 py-0.5 rounded border" style={{ borderColor: "rgba(0,0,0,0.1)", color: def.palette.ink }}>
          {s.name}
        </span>
      ))}
    </div>
  );
}

function ContactLine({ cv, def, onDark = false }: { cv: CVDocument; def: TemplateDef; onDark?: boolean }) {
  const p = cv.personalInfo;
  const items = [p.email, p.phone, p.location].filter(Boolean);
  const color = onDark ? "rgba(255,255,255,0.7)" : def.palette.muted;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px]" style={{ color }}>
      {items.map((it, i) => <span key={i}>{it}</span>)}
      {p.links.slice(0, 2).map((l) => <span key={l.id}>{l.url}</span>)}
    </div>
  );
}

/* ---------- main renderer ---------- */

export interface CVRendererProps {
  cv: CVDocument;
  className?: string;
  width?: number;
  showShadow?: boolean;
  /** highlight a section by key */
  highlightSection?: string | null;
  /** when true, the document height shrinks to fit content (no A4 minHeight) */
  fitContent?: boolean;
}

export function CVRenderer({ cv, className, width = 794, showShadow = true, highlightSection, fitContent = false }: CVRendererProps) {
  const def = getTemplate(cv.design.templateId);
  const { palette: pal } = def;
  // user override of accent color
  const userAccent = cv.design.accentColor;
  const effectiveDef: TemplateDef = userAccent
    ? { ...def, palette: { ...pal, accent: userAccent, accentDark: shadeColor(userAccent, -25) } }
    : def;

  const fonts = fontStack(effectiveDef.font);
  const pad = densityPad(cv.design.density);
  const gap = densityGap(cv.design.density);
  const mScale = marginScale(cv.design.margins);

  const W = width;
  const H = width * 1.414;

  const containerStyle: React.CSSProperties = {
    width: W,
    minHeight: fitContent ? "auto" : H,
    background: effectiveDef.palette.paper,
    color: effectiveDef.palette.ink,
    fontFamily: fonts.body,
    fontSize: 12,
  };

  const sectionHighlight = (key: string) =>
    highlightSection === key
      ? { boxShadow: `inset 0 0 0 2px ${effectiveDef.palette.accent}`, borderRadius: 6, transition: "box-shadow 0.3s" }
      : undefined;

  return (
    <div
      className={cn("relative", showShadow && "paper-shadow", className)}
      style={containerStyle}
      data-template={effectiveDef.id}
    >
      <div style={{ fontFamily: fonts.body, padding: `${48 * mScale}px ${56 * mScale}px`, flex: "1 1 auto", display: "flex", flexDirection: "column", minHeight: fitContent ? "auto" : H }} className={cn(pad, gap, "flex flex-col")}>
        <ArchetypeRenderer def={effectiveDef} cv={cv} fonts={fonts} sectionHighlight={sectionHighlight} />
      </div>
    </div>
  );
}

/* shade helper for accent dark */
function shadeColor(hex: string, percent: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + Math.round(255 * (percent / 100))));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * (percent / 100))));
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round(255 * (percent / 100))));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/* ---------- archetype router ---------- */

function ArchetypeRenderer({
  def,
  cv,
  fonts,
  sectionHighlight,
}: {
  def: TemplateDef;
  cv: CVDocument;
  fonts: { heading: string; body: string };
  sectionHighlight: (k: string) => React.CSSProperties | undefined;
}) {
  const HeadingTag: React.ElementType = "div";
  const headingStyle: React.CSSProperties = { fontFamily: fonts.heading };
  switch (def.archetype) {
    case "centered-single": return <CenteredSingle def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "minimal-lines": return <MinimalLines def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "left-sidebar": return <LeftSidebar def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "right-sidebar": return <RightSidebar def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "header-band-twocol": return <HeaderBandTwoCol def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "timeline": return <TimelineArch def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "editorial": return <Editorial def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "top-photo": return <TopPhoto def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "grid-blocks": return <GridBlocks def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "split-horizontal": return <SplitHorizontal def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "bold-accent": return <BoldAccent def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    case "dense-compact": return <DenseCompact def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
    default: return <HeaderBandTwoCol def={def} cv={cv} headingStyle={headingStyle} sectionHighlight={sectionHighlight} />;
  }
}

/* ---------- shared header components ---------- */

function NameHeader({
  cv,
  def,
  align,
  onDark = false,
  headingStyle,
}: {
  cv: CVDocument;
  def: TemplateDef;
  align: "left" | "center" | "right";
  onDark?: boolean;
  headingStyle: React.CSSProperties;
}) {
  const p = cv.personalInfo;
  const nameColor = onDark ? def.palette.surfaceText : def.palette.ink;
  const titleColor = onDark ? "rgba(255,255,255,0.8)" : def.palette.accent;
  return (
    <div style={{ textAlign: align, ...headingStyle }}>
      <h1 className="text-[26px] font-extrabold tracking-tight leading-none" style={{ color: nameColor }}>
        {p.fullName || "Your Name"}
      </h1>
      {p.professionalTitle && (
        <p className="text-[13px] font-medium mt-1" style={{ color: titleColor }}>{p.professionalTitle}</p>
      )}
    </div>
  );
}

/* ===== 1. CENTERED SINGLE ===== */
function CenteredSingle({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  return (
    <div className="max-w-[460px] mx-auto w-full">
      <header className="text-center pb-4 mb-5" style={sectionHighlight("personal")}>
        <NameHeader cv={cv} def={def} align="center" headingStyle={headingStyle} />
        <div className="mt-2"><ContactLine cv={cv} def={def} /></div>
      </header>
      {cv.summary && <section className="mb-4" style={sectionHighlight("summary")}><SectionLabel def={def}>Summary</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
      {cv.experience.length > 0 && <section className="mb-4" style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
      {cv.education.length > 0 && <section className="mb-4" style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
      {cv.skills.length > 0 && <section className="mb-4" style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><p className="text-[11.5px]" style={{ color: def.palette.ink }}>{cv.skills.map(s => s.name).join(" · ")}</p></section>}
      {cv.projects.length > 0 && <section className="mb-4" style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
      {cv.certifications.length > 0 && <section className="mb-4"><SectionLabel def={def}>Certifications</SectionLabel>{cv.certifications.map(c => <div key={c.id} className="mb-1"><span className="text-[11.5px] font-medium" style={{ color: def.palette.ink }}>{c.name}</span><span className="text-[10.5px]" style={{ color: def.palette.muted }}> — {c.issuer}{c.date ? `, ${formatMonth(c.date)}` : ""}</span></div>)}</section>}
      {cv.languages.length > 0 && <section className="mb-4"><SectionLabel def={def}>Languages</SectionLabel><p className="text-[11.5px]" style={{ color: def.palette.ink }}>{cv.languages.map(l => `${l.name} (${l.level})`).join(" · ")}</p></section>}
    </div>
  );
}

/* ===== 2. MINIMAL LINES ===== */
function MinimalLines({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  return (
    <div className="w-full">
      <header className="pb-4 mb-5 border-b" style={{ borderColor: "rgba(0,0,0,0.12)", ...sectionHighlight("personal") }}>
        <NameHeader cv={cv} def={def} align="left" headingStyle={headingStyle} />
        <div className="mt-1.5"><ContactLine cv={cv} def={def} /></div>
      </header>
      {cv.summary && <section className="mb-5" style={sectionHighlight("summary")}><SectionLabel def={def}>Summary</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
      {cv.experience.length > 0 && <section className="mb-5" style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
      <div className="grid grid-cols-2 gap-6">
        {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
        {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><SkillsCloud cv={cv} def={def} /></section>}
      </div>
      {cv.projects.length > 0 && <section className="mt-5" style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
    </div>
  );
}

/* ===== 3. LEFT SIDEBAR ===== */
function LeftSidebar({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { surface, surfaceText, accent } = def.palette;
  return (
    <div className="grid grid-cols-[1fr_1.6fr] -mx-14 -my-12 flex-1" style={{ minHeight: "100%" }}>
      {/* sidebar */}
      <aside className="p-7 flex flex-col" style={{ background: surface, color: surfaceText }}>
        {def.photoShape !== "none" && p.photo && (
          <div className="mb-5 flex justify-center">
            <PhotoView photo={p.photo} shape={def.photoShape} size={100} />
          </div>
        )}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2">Contact</p>
          <div className="space-y-1 text-[11px] opacity-90">
            {p.email && <p>{p.email}</p>}
            {p.phone && <p>{p.phone}</p>}
            {p.location && <p>{p.location}</p>}
            {p.links.map(l => <p key={l.id}>{l.url}</p>)}
          </div>
        </div>
        {cv.skills.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2">Skills</p>
            <div className="space-y-1">
              {cv.skills.map(s => (
                <div key={s.id} className="text-[11px] flex items-center gap-2 opacity-90">
                  <span className="size-1 rounded-full" style={{ background: accent }} />{s.name}
                </div>
              ))}
            </div>
          </div>
        )}
        {cv.languages.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2">Languages</p>
            {cv.languages.map(l => <div key={l.id} className="text-[11px] flex justify-between opacity-90"><span>{l.name}</span><span className="opacity-60">{l.level}</span></div>)}
          </div>
        )}
        {cv.interests.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2">Interests</p>
            <p className="text-[11px] opacity-90">{cv.interests.map(i => i.name).join(", ")}</p>
          </div>
        )}
      </aside>
      {/* main */}
      <main className="p-8" style={{ background: def.palette.paper, color: def.palette.ink }}>
        <header className="pb-4 mb-5" style={sectionHighlight("personal")}>
          <NameHeader cv={cv} def={def} align="left" headingStyle={headingStyle} />
        </header>
        {cv.summary && <section className="mb-5" style={sectionHighlight("summary")}><SectionLabel def={def}>Profile</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
        {cv.experience.length > 0 && <section className="mb-5" style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
        {cv.education.length > 0 && <section className="mb-5" style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
        {cv.projects.length > 0 && <section style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
      </main>
    </div>
  );
}

/* ===== 4. RIGHT SIDEBAR ===== */
function RightSidebar({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { surface, surfaceText, accent } = def.palette;
  return (
    <div className="grid grid-cols-[1.6fr_1fr] -mx-14 -my-12 flex-1" style={{ minHeight: "100%" }}>
      <main className="p-8" style={{ background: def.palette.paper, color: def.palette.ink }}>
        <header className="pb-4 mb-5" style={sectionHighlight("personal")}>
          <NameHeader cv={cv} def={def} align="left" headingStyle={headingStyle} />
          <div className="mt-1.5"><ContactLine cv={cv} def={def} /></div>
        </header>
        {cv.summary && <section className="mb-5" style={sectionHighlight("summary")}><SectionLabel def={def}>Profile</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
        {cv.experience.length > 0 && <section className="mb-5" style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
        {cv.education.length > 0 && <section className="mb-5" style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
        {cv.projects.length > 0 && <section style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
      </main>
      <aside className="p-7" style={{ background: surface, color: surfaceText }}>
        {def.photoShape !== "none" && p.photo && (
          <div className="mb-5"><PhotoView photo={p.photo} shape={def.photoShape} size={100} /></div>
        )}
        {cv.skills.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2">Skills</p>
            <div className="space-y-1">{cv.skills.map(s => <div key={s.id} className="text-[11px] flex items-center gap-2 opacity-90"><span className="size-1 rounded-full" style={{ background: accent }} />{s.name}</div>)}</div>
          </div>
        )}
        {cv.languages.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2">Languages</p>
            {cv.languages.map(l => <div key={l.id} className="text-[11px] flex justify-between opacity-90"><span>{l.name}</span><span className="opacity-60">{l.level}</span></div>)}
          </div>
        )}
        {cv.certifications.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2">Certifications</p>
            {cv.certifications.map(c => <div key={c.id} className="text-[11px] mb-1 opacity-90"><p>{c.name}</p><p className="opacity-60 text-[10px]">{c.issuer}</p></div>)}
          </div>
        )}
      </aside>
    </div>
  );
}

/* ===== 5. HEADER BAND TWO COL ===== */
function HeaderBandTwoCol({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { accent, accentDark } = def.palette;
  return (
    <div>
      <header className="pb-4 mb-5 border-b-2" style={{ borderColor: accent, ...sectionHighlight("personal") }}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <NameHeader cv={cv} def={def} align="left" headingStyle={headingStyle} />
            <div className="mt-1.5"><ContactLine cv={cv} def={def} /></div>
          </div>
          {def.photoShape !== "none" && p.photo && <PhotoView photo={p.photo} shape={def.photoShape} size={80} />}
        </div>
      </header>
      <div className="grid grid-cols-[1.7fr_1fr] gap-7">
        <div className="space-y-5">
          {cv.summary && <section style={sectionHighlight("summary")}><SectionLabel def={def}>Summary</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
          {cv.experience.length > 0 && <section style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
          {cv.projects.length > 0 && <section style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
        </div>
        <div className="space-y-5">
          {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><SkillsCloud cv={cv} def={def} /></section>}
          {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
          {cv.certifications.length > 0 && <section><SectionLabel def={def}>Certifications</SectionLabel>{cv.certifications.map(c => <div key={c.id} className="mb-1.5"><p className="text-[11.5px] font-medium" style={{ color: def.palette.ink }}>{c.name}</p><p className="text-[10.5px]" style={{ color: def.palette.muted }}>{c.issuer}{c.date ? ` · ${formatMonth(c.date)}` : ""}</p></div>)}</section>}
          {cv.languages.length > 0 && <section><SectionLabel def={def}>Languages</SectionLabel>{cv.languages.map(l => <div key={l.id} className="flex justify-between text-[11.5px]"><span style={{ color: def.palette.ink }}>{l.name}</span><span style={{ color: def.palette.muted }}>{l.level}</span></div>)}</section>}
        </div>
      </div>
    </div>
  );
}

/* ===== 6. TIMELINE ===== */
function TimelineArch({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { accent } = def.palette;
  return (
    <div>
      <header className="flex items-center gap-4 pb-4 mb-5 border-b-2" style={{ borderColor: accent, ...sectionHighlight("personal") }}>
        {def.photoShape !== "none" && p.photo && <PhotoView photo={p.photo} shape={def.photoShape} size={64} />}
        <div>
          <NameHeader cv={cv} def={def} align="left" headingStyle={headingStyle} />
          <div className="mt-1.5"><ContactLine cv={cv} def={def} /></div>
        </div>
      </header>
      {cv.summary && <section className="mb-5" style={sectionHighlight("summary")}><SectionLabel def={def}>About</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
      {cv.experience.length > 0 && <section className="mb-5" style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} variant="timeline" />)}</section>}
      <div className="grid grid-cols-2 gap-6">
        {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
        {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><SkillsCloud cv={cv} def={def} /></section>}
      </div>
      {cv.projects.length > 0 && <section className="mt-5" style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
    </div>
  );
}

/* ===== 7. EDITORIAL ===== */
function Editorial({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  return (
    <div>
      <header className="pb-5 mb-6 text-center" style={sectionHighlight("personal")}>
        <NameHeader cv={cv} def={def} align="center" headingStyle={headingStyle} />
        <div className="mt-2 flex justify-center"><span className="h-0.5 w-10" style={{ background: def.palette.accent }} /></div>
        <div className="mt-2.5"><ContactLine cv={cv} def={def} /></div>
      </header>
      {cv.summary && <section className="mb-5" style={sectionHighlight("summary")}><p className="text-[12.5px] leading-[1.7] text-center px-6 italic" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
      <div className="grid grid-cols-2 gap-7">
        <div className="space-y-5">
          {cv.experience.length > 0 && <section style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
          {cv.projects.length > 0 && <section style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
        </div>
        <div className="space-y-5">
          {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
          {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><p className="text-[11.5px] leading-[1.7]" style={{ color: def.palette.ink }}>{cv.skills.map(s => s.name).join(", ")}</p></section>}
          {cv.languages.length > 0 && <section><SectionLabel def={def}>Languages</SectionLabel>{cv.languages.map(l => <div key={l.id} className="flex justify-between text-[11.5px]"><span style={{ color: def.palette.ink }}>{l.name}</span><span style={{ color: def.palette.muted }}>{l.level}</span></div>)}</section>}
        </div>
      </div>
    </div>
  );
}

/* ===== 8. TOP PHOTO ===== */
function TopPhoto({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { accent, surface } = def.palette;
  const photoSize = def.photoShape === "portrait" ? 110 : 96;
  return (
    <div>
      <header className="flex items-center gap-5 pb-5 mb-5" style={{ borderBottom: `2px solid ${accent}`, ...sectionHighlight("personal") }}>
        {def.photoShape !== "none" && (
          p.photo ? <PhotoView photo={p.photo} shape={def.photoShape} size={photoSize} /> :
          <div className="shrink-0 flex items-center justify-center text-neutral-300" style={{ width: photoSize, height: def.photoShape === "portrait" ? photoSize * 1.25 : photoSize, borderRadius: def.photoShape === "circle" ? "9999px" : "8px", border: "2px dashed rgba(0,0,0,0.12)" }}>
            <span className="text-[10px]">Photo</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <NameHeader cv={cv} def={def} align="left" headingStyle={headingStyle} />
          <div className="mt-1.5"><ContactLine cv={cv} def={def} /></div>
        </div>
      </header>
      {cv.summary && <section className="mb-5" style={sectionHighlight("summary")}><SectionLabel def={def}>About</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
      {cv.experience.length > 0 && <section className="mb-5" style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
      <div className="grid grid-cols-2 gap-6">
        {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
        {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><SkillsCloud cv={cv} def={def} /></section>}
      </div>
      {cv.projects.length > 0 && <section className="mt-5" style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
    </div>
  );
}

/* ===== 9. GRID BLOCKS ===== */
function GridBlocks({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  return (
    <div>
      <header className="pb-4 mb-5 flex items-end justify-between gap-4 border-b" style={{ borderColor: "rgba(0,0,0,0.1)", ...sectionHighlight("personal") }}>
        <div>
          <NameHeader cv={cv} def={def} align="left" headingStyle={headingStyle} />
          <div className="mt-1.5"><ContactLine cv={cv} def={def} /></div>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-5">
        {cv.summary && <section className="col-span-2" style={sectionHighlight("summary")}><SectionLabel def={def}>Profile</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
        {cv.experience.length > 0 && <section className="col-span-2" style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
        {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><SkillsCloud cv={cv} def={def} /></section>}
        {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
        {cv.projects.length > 0 && <section className="col-span-2" style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
      </div>
    </div>
  );
}

/* ===== 10. SPLIT HORIZONTAL ===== */
function SplitHorizontal({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { accent, surface, surfaceText } = def.palette;
  return (
    <div className="-mx-14 -my-12 flex-1 flex flex-col" style={{ minHeight: "100%" }}>
      <header className="p-8 pb-6" style={{ background: surface, color: surfaceText, ...sectionHighlight("personal") }}>
        <div className="flex items-center gap-4">
          {def.photoShape !== "none" && p.photo && <PhotoView photo={p.photo} shape={def.photoShape} size={72} />}
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight leading-none" style={{ color: surfaceText }}>{p.fullName || "Your Name"}</h1>
            {p.professionalTitle && <p className="text-[13px] mt-1 opacity-80">{p.professionalTitle}</p>}
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-[10.5px] opacity-75">
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.location && <span>{p.location}</span>}
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 p-8 grid grid-cols-2 gap-7" style={{ background: def.palette.paper, color: def.palette.ink }}>
        <div className="space-y-5">
          {cv.summary && <section style={sectionHighlight("summary")}><SectionLabel def={def}>Profile</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
          {cv.experience.length > 0 && <section style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
        </div>
        <div className="space-y-5">
          {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><SkillsCloud cv={cv} def={def} /></section>}
          {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
          {cv.projects.length > 0 && <section style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
        </div>
      </div>
    </div>
  );
}

/* ===== 11. BOLD ACCENT ===== */
function BoldAccent({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { accent, accentDark, surface } = def.palette;
  return (
    <div>
      <header className="relative mb-6 p-6 -mx-4 rounded-md overflow-hidden" style={{ background: surface, color: "#fff", ...sectionHighlight("personal") }}>
        <div className="absolute -right-8 -top-8 size-32 rounded-full opacity-20" style={{ background: accent }} />
        <div className="relative flex items-center gap-4">
          {def.photoShape !== "none" && p.photo && <PhotoView photo={p.photo} shape={def.photoShape} size={80} />}
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight leading-none" style={{ fontFamily: headingStyle.fontFamily, color: "#fff" }}>{p.fullName || "Your Name"}</h1>
            {p.professionalTitle && <p className="text-[14px] mt-1.5 font-medium opacity-90">{p.professionalTitle}</p>}
            <div className="mt-2 flex flex-wrap gap-x-3 text-[10.5px] opacity-75">
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.location && <span>{p.location}</span>}
            </div>
          </div>
        </div>
      </header>
      {cv.summary && <section className="mb-5" style={sectionHighlight("summary")}><SectionLabel def={def}>Profile</SectionLabel><p className="text-[11.5px] leading-[1.6]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
      <div className="grid grid-cols-[1.6fr_1fr] gap-7">
        <div className="space-y-5">
          {cv.experience.length > 0 && <section style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
          {cv.projects.length > 0 && <section style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
        </div>
        <div className="space-y-5">
          {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><div className="space-y-1.5">{cv.skills.map(s => <div key={s.id} className="text-[11.5px] flex items-center gap-2" style={{ color: def.palette.ink }}><span className="size-1.5 rounded-full" style={{ background: accent }} />{s.name}</div>)}</div></section>}
          {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
        </div>
      </div>
    </div>
  );
}

/* ===== 12. DENSE COMPACT ===== */
function DenseCompact({ def, cv, headingStyle, sectionHighlight }: any) {
  const p = cv.personalInfo;
  const { accent } = def.palette;
  return (
    <div>
      <header className="pb-3 mb-4 flex items-end justify-between gap-4 border-b" style={{ borderColor: accent, ...sectionHighlight("personal") }}>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight leading-none" style={{ ...headingStyle, color: def.palette.ink }}>{p.fullName || "Your Name"}</h1>
          {p.professionalTitle && <p className="text-[12px] mt-0.5" style={{ color: accent }}>{p.professionalTitle}</p>}
        </div>
        <div className="text-right text-[10px] space-y-0.5" style={{ color: def.palette.muted }}>
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
        </div>
      </header>
      {cv.summary && <section className="mb-4" style={sectionHighlight("summary")}><SectionLabel def={def}>Profile</SectionLabel><p className="text-[11px] leading-[1.5]" style={{ color: def.palette.ink }}>{cv.summary}</p></section>}
      <div className="grid grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-4">
          {cv.experience.length > 0 && <section style={sectionHighlight("experience")}><SectionLabel def={def}>Experience</SectionLabel>{cv.experience.map((e: Experience) => <ExperienceItem key={e.id} exp={e} def={def} />)}</section>}
          {cv.projects.length > 0 && <section style={sectionHighlight("projects")}><SectionLabel def={def}>Projects</SectionLabel>{cv.projects.map((pr: Project) => <ProjectItem key={pr.id} p={pr} def={def} />)}</section>}
        </div>
        <div className="space-y-4">
          {cv.skills.length > 0 && <section style={sectionHighlight("skills")}><SectionLabel def={def}>Skills</SectionLabel><p className="text-[11px]" style={{ color: def.palette.ink }}>{cv.skills.map(s => s.name).join(", ")}</p></section>}
          {cv.education.length > 0 && <section style={sectionHighlight("education")}><SectionLabel def={def}>Education</SectionLabel>{cv.education.map((e: Education) => <EducationItem key={e.id} edu={e} def={def} />)}</section>}
          {cv.certifications.length > 0 && <section><SectionLabel def={def}>Certs</SectionLabel>{cv.certifications.map(c => <div key={c.id} className="mb-1"><p className="text-[11px] font-medium" style={{ color: def.palette.ink }}>{c.name}</p><p className="text-[10px]" style={{ color: def.palette.muted }}>{c.issuer}</p></div>)}</section>}
        </div>
      </div>
    </div>
  );
}
