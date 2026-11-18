"use client";

// Building blocks of a CV page: the render context, pagination-aware units,
// headers, contact details and one component per CV section.

import * as React from "react";
import { Github, Globe, Link2, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import type { CVDocument, LinkType, SectionKey } from "@/lib/cv-data/types";
import {
  dateRange,
  degreeTitle,
  displayUrl,
  formatMonth,
  linkHref,
  mailHref,
  splitLines,
  telHref,
} from "@/lib/cv-data/format";
import { photoImageStyle } from "@/lib/cv-data/photo";
import { PAGE_H, type CVTheme } from "@/components/templates/cv-theme";
import type { Archetype } from "@/components/templates/registry";
import { cn } from "@/lib/utils";

/* ---------- render context ---------- */

export interface RenderContext {
  cv: CVDocument;
  theme: CVTheme;
  /** true inside the hidden sheet that is only used to measure units */
  measuring: boolean;
  /** first page, the measuring sheet, or a render that is not paginated */
  first: boolean;
  /** is this exact unit on the page being rendered? */
  show: (unitKey: string) => boolean;
  /** is any unit under this key prefix on the page being rendered? */
  any: (prefix: string) => boolean;
  /** section the editor is currently focused on */
  highlight: string | null;
}

const RenderCtx = React.createContext<RenderContext | null>(null);
export const RenderProvider = RenderCtx.Provider;

export function useRender(): RenderContext {
  const ctx = React.useContext(RenderCtx);
  if (!ctx) throw new Error("CV blocks must be rendered inside <CVRenderer>.");
  return ctx;
}

const NarrowCtx = React.createContext(false);

/** Marks a narrow column: entries stack their dates instead of right-aligning them. */
export function Narrow({ children }: { children: React.ReactNode }) {
  return <NarrowCtx.Provider value={true}>{children}</NarrowCtx.Provider>;
}

/* ---------- content helpers ---------- */

const has = (v?: string | null) => !!v && v.trim().length > 0;

type ListContent = {
  [K in Exclude<SectionKey, "personal" | "summary">]: CVDocument[K];
};

const contentCache = new WeakMap<CVDocument, ListContent>();

/** Entries that are worth printing. Rows the user added but left blank are skipped. */
export function contentOf(cv: CVDocument): ListContent {
  const cached = contentCache.get(cv);
  if (cached) return cached;
  const content: ListContent = {
    experience: cv.experience.filter((e) => has(e.jobTitle) || has(e.company) || has(e.responsibilities)),
    education: cv.education.filter((e) => has(e.degree) || has(e.fieldOfStudy) || has(e.institution)),
    skills: cv.skills.filter((s) => has(s.name)),
    projects: cv.projects.filter((p) => has(p.name) || has(p.description)),
    certifications: cv.certifications.filter((c) => has(c.name)),
    languages: cv.languages.filter((l) => has(l.name)),
    awards: cv.awards.filter((a) => has(a.title)),
    volunteer: cv.volunteer.filter((v) => has(v.role) || has(v.organization)),
    publications: cv.publications.filter((p) => has(p.title)),
    interests: cv.interests.filter((i) => has(i.name)),
  };
  contentCache.set(cv, content);
  return content;
}

export function sectionHasContent(cv: CVDocument, key: SectionKey): boolean {
  if (key === "personal") return false;
  if (key === "summary") return has(cv.summary);
  return contentOf(cv)[key].length > 0;
}

const SECTION_TITLES: Record<SectionKey, string> = {
  personal: "Contact",
  summary: "Profile",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  volunteer: "Volunteering",
  publications: "Publications",
  interests: "Interests",
};

const SUMMARY_AS_SUMMARY: Archetype[] = ["centered-single", "minimal-lines", "header-band-twocol", "dense-compact"];

function sectionTitle(key: SectionKey, archetype: Archetype): string {
  if (key === "summary" && SUMMARY_AS_SUMMARY.includes(archetype)) return "Summary";
  return SECTION_TITLES[key];
}

/** Links in the preview must not navigate away; in the exported PDF they stay clickable. */
const stayOnPage = (e: React.MouseEvent) => e.preventDefault();

/** Lets long emails and URLs wrap at punctuation rather than in the middle of a word. */
function Breakable({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "@") {
      out.push(buf, <wbr key={i} />);
      buf = ch;
    } else if (ch === "." || ch === "/" || ch === "-" || ch === "_") {
      out.push(buf + ch, <wbr key={i} />);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf) out.push(buf);
  return <>{out}</>;
}

/* ---------- pagination primitives ---------- */

/** A column of the page. Units inside it are paginated together. */
export function Flow({
  id,
  contTop,
  limit,
  className,
  style,
  children,
}: {
  id: string;
  /** y where this column starts on continuation pages (defaults to the page margin) */
  contTop?: number;
  /** y this column must not pass (defaults to page height minus the margin) */
  limit?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { theme } = useRender();
  return (
    <div
      data-cv-flow={id}
      data-cont-top={contTop ?? theme.padY}
      data-limit={limit ?? PAGE_H - theme.padY}
      className={cn("cv-flow", className)}
      style={style}
    >
      {children}
    </div>
  );
}

function Section({
  id,
  first,
  children,
}: {
  id: Exclude<SectionKey, "personal">;
  /** key of the section's first unit; the label stays on the same page as it */
  first: string;
  children: React.ReactNode;
}) {
  const { any, show, highlight, theme } = useRender();
  if (!any(id)) return null;
  return (
    <section className="cv-section" data-cv-section={id} data-cv-active={highlight === id ? "" : undefined}>
      {show(first) && (
        <h2 className="cv-label" data-u={first}>
          <span>{sectionTitle(id, theme.def.archetype)}</span>
        </h2>
      )}
      {children}
    </section>
  );
}

/* ---------- entries ---------- */

interface EntryProps {
  /** unit key, e.g. "experience/ab12" */
  k: string;
  title: string;
  org?: string;
  place?: string;
  date?: string;
  link?: string;
  /** a paragraph kept together with the heading */
  text?: string;
  /** bullet lines; two or more may break across pages one by one */
  bullets?: string[];
  /** small accent line, e.g. technologies */
  note?: string;
  /** lighter title weight for short credentials */
  light?: boolean;
  /** render on the timeline rail (dates in the left column) */
  timeline?: boolean;
}

function Entry({ k, title, org, place, date, link, text, bullets = [], note, light, timeline }: EntryProps) {
  const { show, any } = useRender();
  const narrow = React.useContext(NarrowCtx);
  if (!any(k)) return null;

  const onRail = !!timeline && !narrow;
  const split = bullets.length > 1;
  const noteKey = split ? `${k}/n` : k;
  const headOn = show(k);
  // Short credentials read best on one line: "Title · Issuer" with the date opposite.
  const inlineOrg = !!light && !narrow && !onRail && has(org);

  const titleEl = (
    <h3 className={cn("cv-entry-title", light && "cv-entry-title--light")}>
      {title}
      {inlineOrg && (
        <span className="cv-entry-org">
          <span className="cv-sep">·</span>
          {org}
        </span>
      )}
    </h3>
  );
  const sub =
    !inlineOrg && (has(org) || has(place)) ? (
      <div className="cv-entry-sub">
        {has(org) && <span className="cv-org">{org}</span>}
        {has(org) && has(place) && <span className="cv-sep">·</span>}
        {has(place) && <span>{place}</span>}
      </div>
    ) : null;
  const linkEl = has(link) ? (
    <a className="cv-link" href={linkHref(link!)} tabIndex={-1} onClick={stayOnPage}>
      <Breakable text={displayUrl(link!)} />
    </a>
  ) : null;

  const visibleBullets = bullets
    .map((line, i) => ({ line, key: i === 0 ? k : `${k}/b${i}` }))
    .filter((b) => show(b.key));

  const parts = (
    <>
      {headOn && (
        <div data-u={k} className="cv-entry-head">
          {onRail && <span className="cv-tl-dot" />}
          {narrow || onRail ? (
            <>
              {titleEl}
              {sub}
              {narrow && has(date) && <div className="cv-date">{date}</div>}
              {linkEl}
            </>
          ) : (
            <>
              <div className="cv-row">
                {titleEl}
                {has(date) ? <span className="cv-date">{date}</span> : linkEl}
              </div>
              {sub}
              {has(date) && linkEl}
            </>
          )}
        </div>
      )}
      {headOn && has(text) && (
        <p data-u={k} className="cv-entry-text">
          {text}
        </p>
      )}
      {visibleBullets.length > 0 && (
        <ul className="cv-bullets">
          {visibleBullets.map((b) => (
            <li key={b.key} data-u={b.key} className="cv-bullet">
              <span>{b.line}</span>
            </li>
          ))}
        </ul>
      )}
      {has(note) && show(noteKey) && (
        <div data-u={noteKey} className="cv-entry-meta">
          {note}
        </div>
      )}
    </>
  );

  if (onRail) {
    return (
      <div className="cv-tl-entry">
        <div className="cv-tl-date">
          {headOn && has(date) && (
            <span data-u={k} className="cv-date">
              {date}
            </span>
          )}
        </div>
        <div className="cv-tl-body">{parts}</div>
      </div>
    );
  }
  return <div className={cn("cv-entry", narrow && "cv-entry--narrow")}>{parts}</div>;
}

/** One line of prose stays a paragraph; several lines become bullets. */
function proseOrBullets(raw: string): { text?: string; bullets?: string[] } {
  const lines = splitLines(raw);
  if (lines.length === 0) return {};
  if (lines.length === 1 && lines[0].length > 110) return { text: lines[0] };
  return { bullets: lines };
}

/* ---------- sections ---------- */

function SummarySection() {
  const { cv, show } = useRender();
  if (!has(cv.summary)) return null;
  return (
    <Section id="summary" first="summary">
      {show("summary") && (
        <p data-u="summary" className="cv-text">
          {cv.summary.trim()}
        </p>
      )}
    </Section>
  );
}

function ExperienceSection() {
  const { cv, theme } = useRender();
  const items = contentOf(cv).experience;
  if (!items.length) return null;
  const timeline = theme.def.archetype === "timeline";
  return (
    <Section id="experience" first={`experience/${items[0].id}`}>
      <div className={timeline ? "cv-tl" : "cv-entries"}>
        {items.map((e) => (
          <Entry
            key={e.id}
            k={`experience/${e.id}`}
            title={has(e.jobTitle) ? e.jobTitle : e.company}
            org={has(e.jobTitle) ? e.company : ""}
            place={e.location}
            date={dateRange(e.startDate, e.endDate, e.current)}
            timeline={timeline}
            {...proseOrBullets(e.responsibilities)}
          />
        ))}
      </div>
    </Section>
  );
}

function EducationSection() {
  const { cv, theme } = useRender();
  const items = contentOf(cv).education;
  if (!items.length) return null;
  const timeline = theme.def.archetype === "timeline";
  return (
    <Section id="education" first={`education/${items[0].id}`}>
      <div className={timeline ? "cv-tl" : "cv-entries"}>
        {items.map((e) => {
          const degree = degreeTitle(e);
          return (
            <Entry
              key={e.id}
              k={`education/${e.id}`}
              title={degree || e.institution}
              org={degree ? e.institution : ""}
              place={e.location}
              date={dateRange(e.startDate, e.endDate)}
              text={e.description?.trim()}
              timeline={timeline}
            />
          );
        })}
      </div>
    </Section>
  );
}

function ProjectsSection() {
  const { cv } = useRender();
  const items = contentOf(cv).projects;
  if (!items.length) return null;
  return (
    <Section id="projects" first={`projects/${items[0].id}`}>
      <div className="cv-entries">
        {items.map((p) => (
          <Entry
            key={p.id}
            k={`projects/${p.id}`}
            title={has(p.name) ? p.name : "Project"}
            link={p.link}
            text={p.description?.trim()}
            note={p.technologies?.trim()}
          />
        ))}
      </div>
    </Section>
  );
}

function VolunteerSection() {
  const { cv, theme } = useRender();
  const items = contentOf(cv).volunteer;
  if (!items.length) return null;
  const timeline = theme.def.archetype === "timeline";
  return (
    <Section id="volunteer" first={`volunteer/${items[0].id}`}>
      <div className={timeline ? "cv-tl" : "cv-entries"}>
        {items.map((v) => (
          <Entry
            key={v.id}
            k={`volunteer/${v.id}`}
            title={has(v.role) ? v.role : v.organization}
            org={has(v.role) ? v.organization : ""}
            date={dateRange(v.startDate, v.endDate)}
            timeline={timeline}
            {...proseOrBullets(v.description)}
          />
        ))}
      </div>
    </Section>
  );
}

function CertificationsSection() {
  const { cv } = useRender();
  const items = contentOf(cv).certifications;
  if (!items.length) return null;
  return (
    <Section id="certifications" first={`certifications/${items[0].id}`}>
      <div className="cv-entries cv-entries--tight">
        {items.map((c) => (
          <Entry key={c.id} k={`certifications/${c.id}`} title={c.name} org={c.issuer} date={formatMonth(c.date)} light />
        ))}
      </div>
    </Section>
  );
}

function AwardsSection() {
  const { cv } = useRender();
  const items = contentOf(cv).awards;
  if (!items.length) return null;
  return (
    <Section id="awards" first={`awards/${items[0].id}`}>
      <div className="cv-entries cv-entries--tight">
        {items.map((a) => (
          <Entry key={a.id} k={`awards/${a.id}`} title={a.title} org={a.issuer} date={formatMonth(a.date)} light />
        ))}
      </div>
    </Section>
  );
}

function PublicationsSection() {
  const { cv } = useRender();
  const items = contentOf(cv).publications;
  if (!items.length) return null;
  return (
    <Section id="publications" first={`publications/${items[0].id}`}>
      <div className="cv-entries cv-entries--tight">
        {items.map((p) => (
          <Entry key={p.id} k={`publications/${p.id}`} title={p.title} org={p.publisher} date={formatMonth(p.date)} light />
        ))}
      </div>
    </Section>
  );
}

function InlineList({ items }: { items: { id: string; name: string; dim?: string }[] }) {
  const narrow = React.useContext(NarrowCtx);
  // In a narrow column a plain comma list wraps most naturally.
  if (narrow) {
    return (
      <p className="cv-inline">
        {items.map((it, i) => (
          <React.Fragment key={it.id}>
            {i > 0 && ", "}
            <span className="cv-nb">
              {it.name}
              {has(it.dim) && <span className="cv-dim"> ({it.dim})</span>}
            </span>
          </React.Fragment>
        ))}
      </p>
    );
  }
  // Wide: middle dots drawn by CSS, which hides the dot at the start of each line.
  return (
    <div className="cv-inline cv-inline--dots">
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            {it.name}
            {has(it.dim) && <span className="cv-dim"> ({it.dim})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillsSection() {
  const { cv, theme, show } = useRender();
  const narrow = React.useContext(NarrowCtx);
  const items = contentOf(cv).skills;
  if (!items.length) return null;
  const style = theme.def.skills;

  // A list down a sidebar may break between lines; other styles stay together.
  if (style === "list" && narrow) {
    return (
      <Section id="skills" first={`skills/${items[0].id}`}>
        <ul className="cv-dotlist">
          {items.map((s) => {
            const key = `skills/${s.id}`;
            return show(key) ? (
              <li key={s.id} data-u={key}>
                <span>{s.name}</span>
              </li>
            ) : null;
          })}
        </ul>
      </Section>
    );
  }

  const chips = style === "chips" || style === "tags";
  return (
    <Section id="skills" first="skills">
      {show("skills") && (
        <div data-u="skills">
          {chips ? (
            <ul className="cv-chips">
              {items.map((s) => (
                <li key={s.id} className="cv-chip">
                  {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <InlineList items={items} />
          )}
        </div>
      )}
    </Section>
  );
}

function LanguagesSection() {
  const { cv, show } = useRender();
  const narrow = React.useContext(NarrowCtx);
  const items = contentOf(cv).languages;
  if (!items.length) return null;
  return (
    <Section id="languages" first="languages">
      {show("languages") && (
        <div data-u="languages">
          {narrow ? (
            <div className="cv-kv">
              {items.map((l) => (
                <div key={l.id} className="cv-kv-row">
                  <span>{l.name}</span>
                  {has(l.level) && <span>{l.level}</span>}
                </div>
              ))}
            </div>
          ) : (
            <InlineList items={items.map((l) => ({ id: l.id, name: l.name, dim: l.level }))} />
          )}
        </div>
      )}
    </Section>
  );
}

function InterestsSection() {
  const { cv, show } = useRender();
  const items = contentOf(cv).interests;
  if (!items.length) return null;
  return (
    <Section id="interests" first="interests">
      {show("interests") && (
        <div data-u="interests">
          <InlineList items={items} />
        </div>
      )}
    </Section>
  );
}

const SECTION_COMPONENTS: Record<Exclude<SectionKey, "personal">, React.ComponentType> = {
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  certifications: CertificationsSection,
  languages: LanguagesSection,
  awards: AwardsSection,
  volunteer: VolunteerSection,
  publications: PublicationsSection,
  interests: InterestsSection,
};

export function Sections({ keys }: { keys: SectionKey[] }) {
  return (
    <>
      {keys.map((key) => {
        if (key === "personal") return null;
        const Component = SECTION_COMPONENTS[key];
        return <Component key={key} />;
      })}
    </>
  );
}

/* ---------- photo ---------- */

export function hasPhoto(ctx: Pick<RenderContext, "cv" | "theme">): boolean {
  return !!ctx.cv.personalInfo.photo?.dataUrl && ctx.theme.def.photoShape !== "none";
}

export function Photo({ size }: { size: number }) {
  const ctx = useRender();
  if (!hasPhoto(ctx)) return null;
  const photo = ctx.cv.personalInfo.photo!;
  const shape = ctx.theme.def.photoShape;
  const name = ctx.cv.personalInfo.fullName.trim();
  return (
    <div
      className="cv-photo"
      data-shape={shape}
      style={{ width: size, height: shape === "portrait" ? Math.round(size * 1.25) : size }}
    >
      {!ctx.measuring && (
        <img
          src={photo.dataUrl}
          alt={name ? `Portrait of ${name}` : "Profile photo"}
          draggable={false}
          style={photoImageStyle(photo)}
        />
      )}
    </div>
  );
}

/* ---------- contact ---------- */

const LINK_ICONS: Record<LinkType, typeof Link2> = {
  linkedin: Linkedin,
  github: Github,
  portfolio: Globe,
  website: Link2,
};

interface ContactItem {
  key: string;
  icon: typeof Link2;
  text: string;
  href?: string;
}

export function contactItems(cv: CVDocument): ContactItem[] {
  const p = cv.personalInfo;
  const out: ContactItem[] = [];
  if (has(p.email)) out.push({ key: "email", icon: Mail, text: p.email.trim(), href: mailHref(p.email) });
  if (has(p.phone)) out.push({ key: "phone", icon: Phone, text: p.phone.trim(), href: telHref(p.phone) });
  if (has(p.location)) out.push({ key: "location", icon: MapPin, text: p.location.trim() });
  for (const link of p.links) {
    if (!has(link.url)) continue;
    out.push({ key: link.id, icon: LINK_ICONS[link.type] ?? Link2, text: displayUrl(link.url), href: linkHref(link.url) });
  }
  return out;
}

export function Contact({
  variant = "line",
  plain = false,
}: {
  variant?: "line" | "center" | "stack" | "grid";
  /** no icons; details and links on separate centred rows, separated by dots */
  plain?: boolean;
}) {
  const { cv } = useRender();
  const items = contactItems(cv);
  if (!items.length) return null;

  const renderItem = (item: ContactItem) => {
    const Icon = item.icon;
    const inner = (
      <>
        {!plain && <Icon aria-hidden="true" strokeWidth={1.8} />}
        <span>{item.href ? <Breakable text={item.text} /> : item.text}</span>
      </>
    );
    return item.href ? (
      <a key={item.key} className="cv-contact-item" href={item.href} tabIndex={-1} onClick={stayOnPage}>
        {inner}
      </a>
    ) : (
      <span key={item.key} className="cv-contact-item">
        {inner}
      </span>
    );
  };

  if (plain) {
    const details = items.filter((it) => it.key === "email" || it.key === "phone" || it.key === "location");
    const links = items.filter((it) => !details.includes(it));
    return (
      <div className="cv-contact-rows">
        {[details, links]
          .filter((row) => row.length > 0)
          .map((row, i) => (
            <div key={i} className="cv-contact cv-contact--center cv-contact--plain">
              {row.map(renderItem)}
            </div>
          ))}
      </div>
    );
  }

  const rows = items.length > 4 ? Math.ceil(items.length / 2) : items.length;
  return (
    <div
      className={cn(
        "cv-contact",
        variant === "center" && "cv-contact--center",
        variant === "stack" && "cv-contact--stack",
        variant === "grid" && "cv-contact--grid"
      )}
      style={variant === "grid" ? ({ "--cv-contact-rows": rows } as React.CSSProperties) : undefined}
    >
      {items.map(renderItem)}
    </div>
  );
}

/* ---------- headers ---------- */

function usePersonalAttrs() {
  const { highlight } = useRender();
  return {
    "data-cv-section": "personal",
    "data-cv-active": highlight === "personal" ? "" : undefined,
  } as const;
}

function Identity() {
  const { cv } = useRender();
  const p = cv.personalInfo;
  return (
    <>
      <h1 className="cv-name">{has(p.fullName) ? p.fullName.trim() : "Your Name"}</h1>
      {has(p.professionalTitle) && <p className="cv-role">{p.professionalTitle.trim()}</p>}
    </>
  );
}

/** Photo, name, title and a contact line, left aligned. */
export function HeaderLeft({ rule = false, photoSize = 76 }: { rule?: boolean; photoSize?: number }) {
  const { show } = useRender();
  const attrs = usePersonalAttrs();
  if (!show("header")) return null;
  return (
    <header data-u="header" className={cn("cv-head", rule && "cv-head--rule")} {...attrs}>
      <Photo size={photoSize} />
      <div className="cv-head-text">
        <Identity />
        <Contact />
      </div>
    </header>
  );
}

/** Everything centred above a hairline. */
export function HeaderCentered() {
  const { show } = useRender();
  const attrs = usePersonalAttrs();
  if (!show("header")) return null;
  return (
    <header data-u="header" className="cv-head cv-head--center" {...attrs}>
      <Photo size={76} />
      <div>
        <Identity />
      </div>
      <Contact variant="center" plain />
    </header>
  );
}

/** Name on the left, contact details in a compact block on the right. */
export function HeaderSplit({ rule = false }: { rule?: boolean }) {
  const { show } = useRender();
  const attrs = usePersonalAttrs();
  if (!show("header")) return null;
  return (
    <header data-u="header" className={cn("cv-head cv-head--split", rule && "cv-head--rule")} {...attrs}>
      <div className="cv-head">
        <Photo size={64} />
        <div className="cv-head-text">
          <Identity />
        </div>
      </div>
      <Contact variant="grid" />
    </header>
  );
}

/** Text on the left, photo on the right. Used inside colour bands and for the oversized name. */
export function HeaderPhotoRight({ big = false, photoSize = 92 }: { big?: boolean; photoSize?: number }) {
  const { show } = useRender();
  const attrs = usePersonalAttrs();
  if (!show("header")) return null;
  return (
    <header data-u="header" className={cn("cv-head", big && "cv-head--big")} {...attrs}>
      <div className="cv-head-text">
        <Identity />
        <Contact />
      </div>
      <Photo size={photoSize} />
    </header>
  );
}

/** Tall colour block: photo, name, the summary and contact details. */
export function HeaderHero() {
  const { cv, show, highlight } = useRender();
  const attrs = usePersonalAttrs();
  if (!show("header")) return null;
  return (
    <header data-u="header">
      <div className="cv-head" {...attrs}>
        <Photo size={96} />
        <div className="cv-head-text">
          <Identity />
        </div>
      </div>
      {has(cv.summary) && (
        <p className="cv-hero-summary" data-cv-section="summary" data-cv-active={highlight === "summary" ? "" : undefined}>
          {cv.summary.trim()}
        </p>
      )}
      <div className="cv-hero-contact">
        <Contact />
      </div>
    </header>
  );
}

/** Name and title only: the sidebar carries the photo and contact details. */
export function HeaderName() {
  const { show } = useRender();
  const attrs = usePersonalAttrs();
  if (!show("header")) return null;
  return (
    <header data-u="header" {...attrs}>
      <Identity />
    </header>
  );
}

/** Centred serif masthead between rules. */
export function Masthead() {
  const { show } = useRender();
  const attrs = usePersonalAttrs();
  if (!show("header")) return null;
  return (
    <header data-u="header" className="cv-masthead" {...attrs}>
      <Photo size={72} />
      <div>
        <Identity />
      </div>
      <Contact variant="center" plain />
    </header>
  );
}

/** The summary as an italic lead paragraph under the masthead. */
export function LeadSummary() {
  const { cv, show, highlight } = useRender();
  if (!has(cv.summary) || !show("summary")) return null;
  return (
    <p data-u="summary" className="cv-lead" data-cv-section="summary" data-cv-active={highlight === "summary" ? "" : undefined}>
      {cv.summary.trim()}
    </p>
  );
}

/** Photo and contact details at the top of a sidebar. */
export function SidebarProfile() {
  const ctx = useRender();
  const attrs = usePersonalAttrs();
  const items = contactItems(ctx.cv);
  return (
    <>
      {hasPhoto(ctx) && ctx.show("photo") && (
        <div data-u="photo" className="cv-sidebar-photo">
          <Photo size={116} />
        </div>
      )}
      {items.length > 0 && ctx.show("contact") && (
        <section data-u="contact" className="cv-section" {...attrs}>
          <h2 className="cv-label">
            <span>Contact</span>
          </h2>
          <Contact variant="stack" />
        </section>
      )}
    </>
  );
}
