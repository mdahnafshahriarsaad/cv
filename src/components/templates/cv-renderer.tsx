"use client";

import * as React from "react";
import { CVDocument, Experience, Education, Project } from "@/lib/cv-data/types";
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

const TYPO_MAP: Record<string, string> = {
  modern: "font-sans",
  serif: "font-serif",
  minimal: "font-sans",
  elegant: "font-serif",
};

function densityPad(d: string): string {
  if (d === "compact") return "p-7";
  if (d === "spacious") return "p-12";
  return "p-10";
}
function marginScale(m: string): number {
  if (m === "narrow") return 0.85;
  if (m === "wide") return 1.15;
  return 1;
}

/* ---------- shared atoms ---------- */

function SectionTitle({
  children,
  accent,
  template,
}: {
  children: React.ReactNode;
  accent: string;
  template: string;
}) {
  if (template === "apex") {
    return (
      <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#212121] mb-2.5 pb-1.5 border-b border-[#e5e5e5]">
        {children}
      </h3>
    );
  }
  if (template === "canvas" || template === "orbit") {
    return (
      <h3 className="text-[12px] font-bold tracking-[0.14em] uppercase mb-2.5 flex items-center gap-2" style={{ color: accent }}>
        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        {children}
      </h3>
    );
  }
  if (template === "prism") {
    return (
      <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#212121] mb-3 text-center relative">
        {children}
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 h-0.5 w-8" style={{ background: accent }} />
      </h3>
    );
  }
  // vertex, nova default
  return (
    <h3 className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#212121] mb-2.5 flex items-center gap-2">
      <span className="inline-block w-3 h-0.5" style={{ background: accent }} />
      {children}
    </h3>
  );
}

function ExperienceBlock({
  exp,
  accent,
  template,
}: {
  exp: Experience;
  accent: string;
  template: string;
}) {
  const range = dateRange(exp.startDate, exp.endDate, exp.current);
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-[#212121] text-[13.5px] leading-tight">
          {exp.jobTitle || "Job Title"}
          {exp.company ? (
            <span className="font-normal text-[#6b6b6b]"> · {exp.company}</span>
          ) : null}
        </h4>
        {range && (
          <span className="text-[11px] text-[#6b6b6b] whitespace-nowrap shrink-0">
            {range}
          </span>
        )}
      </div>
      {exp.location && (
        <p className="text-[11px] text-[#9a9a9a] mb-1">{exp.location}</p>
      )}
      {exp.responsibilities && (
        <ul className="mt-1 space-y-1">
          {exp.responsibilities
            .split("\n")
            .filter((l) => l.trim())
            .map((line, i) => (
              <li key={i} className="text-[12px] leading-[1.55] text-[#3a3a3a] flex gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />
                <span>{line.replace(/^[-•]\s*/, "")}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function EducationBlock({ edu, accent }: { edu: Education; accent: string }) {
  const range = dateRange(edu.startDate, edu.endDate);
  const title = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ");
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-[#212121] text-[13px] leading-tight">
          {title || "Degree"}
        </h4>
        {range && (
          <span className="text-[11px] text-[#6b6b6b] whitespace-nowrap shrink-0">
            {range}
          </span>
        )}
      </div>
      {edu.institution && (
        <p className="text-[12px] text-[#6b6b6b]">{edu.institution}</p>
      )}
      {edu.description && (
        <p className="text-[11.5px] text-[#7a7a7a] mt-0.5 leading-[1.5]">{edu.description}</p>
      )}
    </div>
  );
}

function ProjectBlock({ p }: { p: Project }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-[#212121] text-[12.5px]">{p.name || "Project"}</h4>
        {p.link && (
          <span className="text-[11px] text-[#6b6b6b] truncate max-w-[45%]">{p.link}</span>
        )}
      </div>
      {p.description && (
        <p className="text-[11.5px] text-[#5a5a5a] mt-0.5 leading-[1.5]">{p.description}</p>
      )}
      {p.technologies && (
        <p className="text-[11px] text-[#9a9a9a] mt-0.5">Tech: {p.technologies}</p>
      )}
    </div>
  );
}

/* ---------- main renderer ---------- */

export interface CVRendererProps {
  cv: CVDocument;
  className?: string;
  /** page width in px (A4 base = 794). height auto-derived. */
  width?: number;
  showShadow?: boolean;
}

export function CVRenderer({ cv, className, width = 794, showShadow = true }: CVRendererProps) {
  const { design, personalInfo: p } = cv;
  const accent = design.accentColor || "#FF4336";
  const template = design.templateId;
  const typo = TYPO_MAP[design.typography] || "font-sans";
  const pad = densityPad(design.density);
  const mScale = marginScale(design.margins);

  const W = width;
  const H = width * 1.414; // A4 ratio

  // content
  const exp = cv.experience;
  const edu = cv.education;
  const skills = cv.skills;
  const projects = cv.projects;
  const certs = cv.certifications;
  const langs = cv.languages;
  const awards = cv.awards;
  const interests = cv.interests;

  const containerStyle: React.CSSProperties = {
    width: W,
    minHeight: H,
    background: "#ffffff",
    color: "#212121",
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
  };

  const inner = (
    <div className={cn("bg-white text-[#212121]", typo, pad)} style={{ fontSize: 12.5 }}>
      {renderTemplate()}
    </div>
  );

  function renderTemplate() {
    switch (template) {
      case "apex":
        return <ApexLayout />;
      case "canvas":
        return <CanvasLayout />;
      case "nova":
        return <NovaLayout />;
      case "prism":
        return <PrismLayout />;
      case "orbit":
        return <OrbitLayout />;
      default:
        return <VertexLayout />;
    }
  }

  /* ===== VERTEX ===== */
  function VertexLayout() {
    return (
      <div>
        {/* Header */}
        <header className="pb-4 mb-5 border-b-2" style={{ borderColor: accent }}>
          <h1 className="text-[28px] font-extrabold tracking-tight leading-none text-[#212121]">
            {p.fullName || "Your Name"}
          </h1>
          {p.professionalTitle && (
            <p className="text-[14px] font-medium mt-1.5" style={{ color: accent }}>
              {p.professionalTitle}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#6b6b6b]">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.links.map((l) => (
              <span key={l.id}>{l.url}</span>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-[1.7fr_1fr] gap-7">
          <div className="space-y-5">
            {cv.summary && (
              <section>
                <SectionTitle accent={accent} template={template}>Summary</SectionTitle>
                <p className="text-[12px] leading-[1.6] text-[#3a3a3a]">{cv.summary}</p>
              </section>
            )}
            {exp.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Experience</SectionTitle>
                {exp.map((e) => (
                  <ExperienceBlock key={e.id} exp={e} accent={accent} template={template} />
                ))}
              </section>
            )}
            {projects.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Projects</SectionTitle>
                {projects.map((pr) => (
                  <ProjectBlock key={pr.id} p={pr} />
                ))}
              </section>
            )}
          </div>
          <div className="space-y-5">
            {skills.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Skills</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s.id} className="text-[11px] px-2 py-0.5 rounded border" style={{ borderColor: "#e5e5e5", color: "#3a3a3a" }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {edu.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Education</SectionTitle>
                {edu.map((e) => (
                  <EducationBlock key={e.id} edu={e} accent={accent} />
                ))}
              </section>
            )}
            {certs.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Certifications</SectionTitle>
                {certs.map((c) => (
                  <div key={c.id} className="mb-1.5">
                    <p className="text-[12px] font-medium text-[#212121]">{c.name}</p>
                    <p className="text-[11px] text-[#6b6b6b]">{c.issuer}{c.date ? ` · ${formatMonth(c.date)}` : ""}</p>
                  </div>
                ))}
              </section>
            )}
            {langs.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Languages</SectionTitle>
                {langs.map((l) => (
                  <div key={l.id} className="flex justify-between text-[12px]">
                    <span className="text-[#3a3a3a]">{l.name}</span>
                    <span className="text-[#9a9a9a]">{l.level}</span>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ===== APEX (minimal / ATS) ===== */
  function ApexLayout() {
    return (
      <div className="max-w-[520px] mx-auto">
        <header className="text-center pb-4 mb-5">
          <h1 className="text-[26px] font-bold tracking-tight text-[#212121]">
            {p.fullName || "Your Name"}
          </h1>
          {p.professionalTitle && (
            <p className="text-[13px] text-[#6b6b6b] mt-1">{p.professionalTitle}</p>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 text-[11px] text-[#7a7a7a]">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>· {p.phone}</span>}
            {p.location && <span>· {p.location}</span>}
          </div>
        </header>
        {cv.summary && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Summary</SectionTitle>
            <p className="text-[12px] leading-[1.6] text-[#3a3a3a]">{cv.summary}</p>
          </section>
        )}
        {exp.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Experience</SectionTitle>
            {exp.map((e) => (
              <ExperienceBlock key={e.id} exp={e} accent={accent} template={template} />
            ))}
          </section>
        )}
        {edu.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Education</SectionTitle>
            {edu.map((e) => (
              <EducationBlock key={e.id} edu={e} accent={accent} />
            ))}
          </section>
        )}
        {skills.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Skills</SectionTitle>
            <p className="text-[12px] text-[#3a3a3a]">{skills.map((s) => s.name).join(" · ")}</p>
          </section>
        )}
        {projects.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Projects</SectionTitle>
            {projects.map((pr) => (
              <ProjectBlock key={pr.id} p={pr} />
            ))}
          </section>
        )}
        {certs.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Certifications</SectionTitle>
            {certs.map((c) => (
              <div key={c.id} className="mb-1">
                <span className="text-[12px] font-medium text-[#212121]">{c.name}</span>
                <span className="text-[11px] text-[#6b6b6b]"> — {c.issuer}{c.date ? `, ${formatMonth(c.date)}` : ""}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    );
  }

  /* ===== CANVAS (creative / bold) ===== */
  function CanvasLayout() {
    return (
      <div>
        <header className="text-white px-1 py-5 mb-5 -mx-1 rounded-md" style={{ background: accent }}>
          <h1 className="text-[30px] font-extrabold tracking-tight leading-none">
            {p.fullName || "Your Name"}
          </h1>
          {p.professionalTitle && (
            <p className="text-[14px] font-medium mt-1 text-white/85">{p.professionalTitle}</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-x-4 text-[11px] text-white/80">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
          </div>
        </header>
        <div className="grid grid-cols-[1fr_1.6fr] gap-6">
          <div className="space-y-5">
            {skills.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Skills</SectionTitle>
                <div className="space-y-1.5">
                  {skills.map((s) => (
                    <div key={s.id} className="text-[12px] text-[#3a3a3a] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full" style={{ background: accent }} />
                      {s.name}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {langs.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Languages</SectionTitle>
                {langs.map((l) => (
                  <div key={l.id} className="text-[12px] flex justify-between">
                    <span className="text-[#3a3a3a]">{l.name}</span>
                    <span className="text-[#9a9a9a]">{l.level}</span>
                  </div>
                ))}
              </section>
            )}
            {interests.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Interests</SectionTitle>
                <p className="text-[12px] text-[#3a3a3a]">{interests.map((i) => i.name).join(", ")}</p>
              </section>
            )}
          </div>
          <div className="space-y-5">
            {cv.summary && (
              <section>
                <SectionTitle accent={accent} template={template}>Profile</SectionTitle>
                <p className="text-[12px] leading-[1.6] text-[#3a3a3a]">{cv.summary}</p>
              </section>
            )}
            {exp.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Experience</SectionTitle>
                {exp.map((e) => (
                  <ExperienceBlock key={e.id} exp={e} accent={accent} template={template} />
                ))}
              </section>
            )}
            {edu.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Education</SectionTitle>
                {edu.map((e) => (
                  <EducationBlock key={e.id} edu={e} accent={accent} />
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ===== NOVA (tech) ===== */
  function NovaLayout() {
    return (
      <div>
        <header className="pb-4 mb-5 flex items-end justify-between gap-4 border-b border-[#e5e5e5]">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight leading-none text-[#212121]">
              {p.fullName || "Your Name"}
            </h1>
            {p.professionalTitle && (
              <p className="text-[13px] font-mono mt-1.5" style={{ color: accent }}>
                {"<"} {p.professionalTitle} {" />"}
              </p>
            )}
          </div>
          <div className="text-right text-[11px] text-[#6b6b6b] space-y-0.5">
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.location && <div>{p.location}</div>}
          </div>
        </header>
        <div className="grid grid-cols-[1.5fr_1fr] gap-7">
          <div className="space-y-5">
            {cv.summary && (
              <section>
                <SectionTitle accent={accent} template={template}>About</SectionTitle>
                <p className="text-[12px] leading-[1.6] text-[#3a3a3a]">{cv.summary}</p>
              </section>
            )}
            {exp.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Experience</SectionTitle>
                {exp.map((e) => (
                  <ExperienceBlock key={e.id} exp={e} accent={accent} template={template} />
                ))}
              </section>
            )}
            {projects.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Projects</SectionTitle>
                {projects.map((pr) => (
                  <ProjectBlock key={pr.id} p={pr} />
                ))}
              </section>
            )}
          </div>
          <div className="space-y-5">
            {skills.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Stack</SectionTitle>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => (
                    <span key={s.id} className="font-mono text-[10.5px] px-1.5 py-0.5 rounded" style={{ background: `${accent}14`, color: "#212121" }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {edu.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Education</SectionTitle>
                {edu.map((e) => (
                  <EducationBlock key={e.id} edu={e} accent={accent} />
                ))}
              </section>
            )}
            {certs.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Certs</SectionTitle>
                {certs.map((c) => (
                  <div key={c.id} className="mb-1.5">
                    <p className="text-[12px] font-medium text-[#212121]">{c.name}</p>
                    <p className="text-[11px] text-[#6b6b6b]">{c.issuer}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ===== PRISM (executive serif) ===== */
  function PrismLayout() {
    return (
      <div className="font-serif">
        <header className="text-center pb-5 mb-6">
          <h1 className="text-[28px] font-bold tracking-tight text-[#212121]">
            {p.fullName || "Your Name"}
          </h1>
          {p.professionalTitle && (
            <p className="text-[13px] tracking-[0.15em] uppercase text-[#6b6b6b] mt-1.5">
              {p.professionalTitle}
            </p>
          )}
          <div className="mt-3 flex justify-center">
            <span className="h-0.5 w-12" style={{ background: accent }} />
          </div>
          <div className="mt-2.5 flex flex-wrap justify-center gap-x-4 text-[11px] text-[#7a7a7a]">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>· {p.phone}</span>}
            {p.location && <span>· {p.location}</span>}
          </div>
        </header>
        <div className="space-y-5">
          {cv.summary && (
            <section>
              <SectionTitle accent={accent} template={template}>Profile</SectionTitle>
              <p className="text-[12.5px] leading-[1.7] text-[#3a3a3a] text-center px-4">{cv.summary}</p>
            </section>
          )}
          {exp.length > 0 && (
            <section>
              <SectionTitle accent={accent} template={template}>Experience</SectionTitle>
              {exp.map((e) => (
                <ExperienceBlock key={e.id} exp={e} accent={accent} template={template} />
              ))}
            </section>
          )}
          <div className="grid grid-cols-2 gap-6">
            {edu.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Education</SectionTitle>
                {edu.map((e) => (
                  <EducationBlock key={e.id} edu={e} accent={accent} />
                ))}
              </section>
            )}
            {skills.length > 0 && (
              <section>
                <SectionTitle accent={accent} template={template}>Skills</SectionTitle>
                <p className="text-[12px] text-[#3a3a3a] leading-[1.6]">{skills.map((s) => s.name).join(", ")}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ===== ORBIT (student) ===== */
  function OrbitLayout() {
    return (
      <div>
        <header className="flex items-center gap-4 pb-4 mb-5 border-b-2" style={{ borderColor: accent }}>
          <div className="size-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: accent }}>
            {(p.fullName || "Y").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold tracking-tight leading-none text-[#212121] truncate">
              {p.fullName || "Your Name"}
            </h1>
            {p.professionalTitle && (
              <p className="text-[13px] font-medium mt-1" style={{ color: accent }}>{p.professionalTitle}</p>
            )}
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-[#6b6b6b]">
              {p.email && <span>{p.email}</span>}
              {p.location && <span>· {p.location}</span>}
            </div>
          </div>
        </header>
        {cv.summary && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>About Me</SectionTitle>
            <p className="text-[12px] leading-[1.6] text-[#3a3a3a]">{cv.summary}</p>
          </section>
        )}
        {edu.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Education</SectionTitle>
            {edu.map((e) => (
              <EducationBlock key={e.id} edu={e} accent={accent} />
            ))}
          </section>
        )}
        {exp.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Experience</SectionTitle>
            {exp.map((e) => (
              <ExperienceBlock key={e.id} exp={e} accent={accent} template={template} />
            ))}
          </section>
        )}
        {projects.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Projects</SectionTitle>
            {projects.map((pr) => (
              <ProjectBlock key={pr.id} p={pr} />
            ))}
          </section>
        )}
        {skills.length > 0 && (
          <section className="mb-4">
            <SectionTitle accent={accent} template={template}>Skills</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s.id} className="text-[11px] px-2.5 py-1 rounded-full text-white" style={{ background: accent }}>
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("relative bg-white", showShadow && "paper-shadow", typo, className)}
      style={containerStyle}
    >
      {inner}
    </div>
  );
}
