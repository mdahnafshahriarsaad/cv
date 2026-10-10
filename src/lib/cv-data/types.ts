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

export interface DesignSettings {
  templateId: string;
  accentColor: string; // hex
  typography: "modern" | "serif" | "minimal" | "elegant";
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
      accentColor: "#FF4336",
      typography: "modern",
      density: "balanced",
      margins: "standard",
      sectionOrder: [...DEFAULT_SECTION_ORDER],
    },
    createdAt: now,
    updatedAt: now,
  };
}

// Sample CV used for template previews & demo content
// Always includes a photo — every template supports photos
export function createSampleCV(_withPhoto = true): CVDocument {
  const base = createEmptyCV("Frontend Developer CV");
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
      degree: "BFA, Industrial Design",
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
  base.design.templateId = "vertex";
  return base;
}
