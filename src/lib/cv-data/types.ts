// Nirvash CV data model types

export type LinkType = "linkedin" | "portfolio" | "github" | "website";

export interface ProfessionalLink {
  id: string;
  type: LinkType;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  links: ProfessionalLink[];
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
export function createSampleCV(): CVDocument {
  const base = createEmptyCV("Frontend Developer CV");
  base.personalInfo = {
    fullName: "Alex Johnson",
    professionalTitle: "Frontend Developer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 248-1990",
    location: "San Francisco, CA",
    links: [
      { id: uid(), type: "linkedin", url: "linkedin.com/in/alexjohnson" },
      { id: uid(), type: "github", url: "github.com/alexjohnson" },
      { id: uid(), type: "portfolio", url: "alexjohnson.dev" },
    ],
  };
  base.summary =
    "Frontend Developer with 4+ years of experience building responsive, accessible web applications. Passionate about clean architecture, design systems, and delivering delightful user experiences.";
  base.profileType = "experienced";
  base.experience = [
    {
      id: uid(),
      jobTitle: "Senior Frontend Developer",
      company: "Nimbus Labs",
      location: "San Francisco, CA",
      startDate: "2023-02",
      endDate: "",
      current: true,
      responsibilities:
        "Led the rebuild of the core design system used across 6 products, improving delivery speed by 40%.\nMentored 4 junior developers and established frontend best practices and code review standards.\nDrove migration from legacy SPA to Next.js App Router, cutting load times by 35%.",
    },
    {
      id: uid(),
      jobTitle: "Frontend Developer",
      company: "Brightwave Studio",
      location: "Remote",
      startDate: "2020-06",
      endDate: "2023-01",
      current: false,
      responsibilities:
        "Built 20+ client web applications using React and TypeScript.\nCollaborated with designers to implement pixel-perfect, accessible UIs.\nIntroduced automated testing that reduced production bugs by 50%.",
    },
  ];
  base.education = [
    {
      id: uid(),
      degree: "B.Sc. in Computer Science",
      fieldOfStudy: "Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      startDate: "2016-09",
      endDate: "2020-05",
      description: "Graduated with honors. Focus on human-computer interaction and web technologies.",
    },
  ];
  base.skills = [
    { id: uid(), name: "React" },
    { id: uid(), name: "TypeScript" },
    { id: uid(), name: "Next.js" },
    { id: uid(), name: "Tailwind CSS" },
    { id: uid(), name: "Accessibility" },
    { id: uid(), name: "Design Systems" },
    { id: uid(), name: "Node.js" },
  ];
  base.projects = [
    {
      id: uid(),
      name: "Nimbus UI Kit",
      description: "Open-source React component library with 60+ accessible components.",
      technologies: "React, TypeScript, Radix, Tailwind",
      link: "github.com/nimbus/ui-kit",
    },
  ];
  base.certifications = [
    { id: uid(), name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", date: "2023-08" },
  ];
  base.languages = [
    { id: uid(), name: "English", level: "Native" },
    { id: uid(), name: "Spanish", level: "Professional" },
  ];
  base.design.templateId = "vertex";
  return base;
}
