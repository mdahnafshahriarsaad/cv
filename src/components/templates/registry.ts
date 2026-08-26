export interface TemplateMeta {
  id: string;
  name: string;
  category: string; // e.g. "Modern · Professional"
  categories: string[]; // for filtering: ["modern","professional"]
  description: string;
  badges?: string[]; // "New" | "Popular" | "Recommended" | "ATS Friendly"
  editorChoice?: boolean;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "vertex",
    name: "VERTEX",
    category: "Modern · Professional",
    categories: ["modern", "professional"],
    description: "Clean, modern, and designed for almost any profession.",
    badges: ["Recommended"],
    editorChoice: true,
  },
  {
    id: "apex",
    name: "APEX",
    category: "Minimal · ATS Friendly",
    categories: ["minimal", "ats", "professional"],
    description: "A distraction-free layout that passes every ATS scan.",
    badges: ["ATS Friendly", "Popular"],
  },
  {
    id: "canvas",
    name: "CANVAS",
    category: "Creative · Bold",
    categories: ["creative"],
    description: "A bold creative layout for designers and creators.",
    badges: ["New"],
  },
  {
    id: "nova",
    name: "NOVA",
    category: "Tech · Modern",
    categories: ["tech", "modern"],
    description: "Built for engineers and developers.",
  },
  {
    id: "prism",
    name: "PRISM",
    category: "Executive · Professional",
    categories: ["executive", "professional"],
    description: "An elegant serif layout for senior leadership.",
  },
  {
    id: "orbit",
    name: "ORBIT",
    category: "Student · Creative",
    categories: ["student", "creative"],
    description: "A friendly layout for students and freshers.",
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "Minimal",
  "Modern",
  "Professional",
  "Creative",
  "Tech",
  "Student",
  "Executive",
  "ATS Friendly",
] as const;

export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
