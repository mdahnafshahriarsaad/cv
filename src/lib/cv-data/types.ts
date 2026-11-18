// Nirvash CV data model types

export type LinkType = "linkedin" | "portfolio" | "github" | "website";

export interface ProfessionalLink {
  id: string;
  type: LinkType;
  url: string;
}

export interface ProfilePhoto {
  /** data URL of the cropped image */
  dataUrl: string;
  /** zoom factor 1 = 100% */
  zoom: number;
  /** offset x in % (0-100) */
  offsetX: number;
  /** offset y in % (0-100) */
  offsetY: number;
}

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  links: ProfessionalLink[];
  photo: ProfilePhoto | null;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string; // ISO month string e.g. "2024-01"
  endDate: string;
  current: boolean;
  responsibilities: string;
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
}

export interface VolunteerItem {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
}

export interface Interest {
  id: string;
  name: string;
}

export type SectionKey =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "awards"
  | "volunteer"
  | "publications"
  | "interests";

export type TypographyChoice = "auto" | "sans" | "display" | "serif" | "mixed";

export interface DesignSettings {
  templateId: string;
  /** Hex colour override. Empty string means "use the template's own palette". */
  accentColor: string;
  /** "auto" means "use the template's own font pairing". */
  typography: TypographyChoice;
  density: "compact" | "balanced" | "spacious";
  margins: "narrow" | "standard" | "wide";
  sectionOrder: SectionKey[];
}

export interface CVDocument {
  id: string;
  name: string;
  personalInfo: PersonalInfo;
  summary: string;
  profileType: string; // student | fresher | experienced | freelancer | career-changer
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  volunteer: VolunteerItem[];
  publications: Publication[];
  interests: Interest[];
  design: DesignSettings;
  createdAt: number;
  updatedAt: number;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "personal",
  "summary",
  "experience",
  "skills",
  "education",
  "projects",
  "certifications",
  "languages",
  "awards",
  "volunteer",
  "publications",
  "interests",
];

export function createEmptyCV(name = "Untitled CV"): CVDocument {
  const now = Date.now();
  return {
    id: uid(),
    name,
    personalInfo: {
      fullName: "",
      professionalTitle: "",
      email: "",
      phone: "",
      location: "",
      links: [],
      photo: null,
    },
    summary: "",
    profileType: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    publications: [],
    interests: [],
    design: {
      templateId: "vertex",
      accentColor: "",
      typography: "auto",
      density: "balanced",
      margins: "standard",
      sectionOrder: [...DEFAULT_SECTION_ORDER],
    },
    createdAt: now,
    updatedAt: now,
  };
}

const TYPOGRAPHY_CHOICES: TypographyChoice[] = ["auto", "sans", "display", "serif", "mixed"];

/**
 * Repair a persisted document so every field the app relies on exists.
 * `legacyDesign` is set for documents saved before typography was wired to the
 * renderer: their stored value never had a visual effect, so it is reset.
 */
export function normalizeCV(raw: CVDocument, opts: { legacyDesign?: boolean } = {}): CVDocument {
  const base = createEmptyCV(raw?.name);
  const design: DesignSettings = { ...base.design, ...(raw?.design ?? {}) };

  const known = new Set<SectionKey>(DEFAULT_SECTION_ORDER);
  const order = (Array.isArray(design.sectionOrder) ? design.sectionOrder : []).filter(
    (k, i, all) => known.has(k) && all.indexOf(k) === i
  );
  for (const k of DEFAULT_SECTION_ORDER) if (!order.includes(k)) order.push(k);
  design.sectionOrder = order;

  if (opts.legacyDesign || !TYPOGRAPHY_CHOICES.includes(design.typography)) design.typography = "auto";
  if (typeof design.accentColor !== "string") design.accentColor = "";
  // The old app stored its brand red as every document's accent, which painted
  // every template red. Treat that value as "use the template's palette".
  if (opts.legacyDesign && design.accentColor.toUpperCase() === "#FF4336") design.accentColor = "";
  if (!["compact", "balanced", "spacious"].includes(design.density)) design.density = "balanced";
  if (!["narrow", "standard", "wide"].includes(design.margins)) design.margins = "standard";

  const list = <T,>(value: T[] | undefined): T[] => (Array.isArray(value) ? value : []);
  return {
    ...base,
    ...raw,
    personalInfo: {
      ...base.personalInfo,
      ...(raw?.personalInfo ?? {}),
      links: list(raw?.personalInfo?.links),
    },
    experience: list(raw?.experience),
    education: list(raw?.education),
    skills: list(raw?.skills),
    projects: list(raw?.projects),
    certifications: list(raw?.certifications),
    languages: list(raw?.languages),
    awards: list(raw?.awards),
    volunteer: list(raw?.volunteer),
    publications: list(raw?.publications),
    interests: list(raw?.interests),
    design,
  };
}

/** True once the document holds enough real content to be worth previewing. */
export function hasMeaningfulContent(cv: CVDocument | null | undefined): boolean {
  if (!cv || !cv.personalInfo.fullName.trim()) return false;
  const filled = [
    cv.summary.trim().length > 0,
    cv.experience.length > 0,
    cv.education.length > 0,
    cv.skills.length > 0,
    cv.projects.length > 0,
  ].filter(Boolean).length;
  return filled >= 2;
}

// Sample CV used for template previews & demo content
// Always includes a photo — every template supports photos
export function createSampleCV(_withPhoto = true): CVDocument {
  const base = createEmptyCV("Product Designer CV");
  base.personalInfo = {
    fullName: "Alex Morgan",
    professionalTitle: "Senior Product Designer",
    email: "alex.morgan@email.com",
    phone: "+1 (415) 555-0142",
    location: "San Francisco, CA",
    links: [
      { id: uid(), type: "linkedin", url: "linkedin.com/in/alexmorgan" },
      { id: uid(), type: "portfolio", url: "alexmorgan.design" },
      { id: uid(), type: "github", url: "github.com/alexmorgan" },
    ],
    photo: { dataUrl: "/sample-avatar.jpg", zoom: 1, offsetX: 0, offsetY: 0 },
  };
  base.summary =
    "Multidisciplinary product designer with 8+ years of experience creating intuitive digital products and scalable design systems. Passionate about turning complex problems into elegant, human-centered experiences.";
  base.profileType = "experienced";
  base.experience = [
    {
      id: uid(),
      jobTitle: "Senior Product Designer",
      company: "Lumen",
      location: "San Francisco, CA",
      startDate: "2022-03",
      endDate: "",
      current: true,
      responsibilities:
        "Led the end-to-end redesign of the core product, increasing activation by 28%.\nBuilt and maintained a 120-component design system adopted across 5 product teams.\nMentored 3 junior designers and established the team's design review process.",
    },
    {
      id: uid(),
      jobTitle: "Product Designer",
      company: "Northwind",
      location: "Remote",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      responsibilities:
        "Designed and shipped 15+ features from research to handoff.\nRan usability tests that informed a 40% reduction in support tickets.\nCollaborated closely with engineering to implement pixel-perfect, accessible UIs.",
    },
    {
      id: uid(),
      jobTitle: "Junior Designer",
      company: "Atelier",
      location: "Oakland, CA",
      startDate: "2017-01",
      endDate: "2019-05",
      current: false,
      responsibilities:
        "Created marketing sites and brand systems for early-stage startups.\nProduced interactive prototypes that secured 3 major client contracts.",
    },
  ];
  base.education = [
    {
      id: uid(),
      degree: "BFA",
      fieldOfStudy: "Industrial Design",
      institution: "California College of the Arts",
      location: "San Francisco, CA",
      startDate: "2013-09",
      endDate: "2017-05",
      description: "Graduated with honors. Focus on interaction design and human-centered research.",
    },
  ];
  base.skills = [
    { id: uid(), name: "Figma" },
    { id: uid(), name: "Product Strategy" },
    { id: uid(), name: "UI Design" },
    { id: uid(), name: "UX Research" },
    { id: uid(), name: "Design Systems" },
    { id: uid(), name: "Prototyping" },
    { id: uid(), name: "Accessibility" },
  ];
  base.projects = [
    {
      id: uid(),
      name: "Atlas Design System",
      description: "Open-source design system with 120+ accessible components and tokens.",
      technologies: "Figma, React, Storybook",
      link: "atlas.design",
    },
  ];
  base.certifications = [
    { id: uid(), name: "Certified UX Professional", issuer: "NN/g", date: "2021-05" },
  ];
  base.languages = [
    { id: uid(), name: "English", level: "Native" },
    { id: uid(), name: "French", level: "Professional" },
  ];
  base.interests = [
    { id: uid(), name: "Type design" },
    { id: uid(), name: "Trail running" },
    { id: uid(), name: "Ceramics" },
  ];
  base.design.templateId = "vertex";
  return withStableIds(base);
}

/**
 * Give every id in a sample document a fixed value, so previews rendered on the
 * server and hydrated on the client produce identical markup.
 */
function withStableIds(cv: CVDocument): CVDocument {
  let n = 0;
  const visit = (v: unknown, key?: string): unknown => {
    if (Array.isArray(v)) return v.map((x) => visit(x));
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v)) out[k] = visit(x, k);
      return out;
    }
    if (key === "id" && typeof v === "string") return `sample-${n++}`;
    return v;
  };
  const stable = visit(cv) as CVDocument;
  stable.createdAt = 0;
  stable.updatedAt = 0;
  return stable;
}
