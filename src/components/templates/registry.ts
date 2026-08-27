// Nirvash CV Maker — 54-template professional library
// Organized into 9 collections. Each template has a unique archetype + palette + typography.

export type Archetype =
  | "header-band-twocol"   // colored header band + 2-col body
  | "centered-single"      // centered single column (ATS)
  | "left-sidebar"         // colored left sidebar + right main
  | "right-sidebar"        // main left + right sidebar
  | "timeline"             // vertical timeline for experience
  | "editorial"            // magazine serif columns
  | "top-photo"            // large photo header
  | "grid-blocks"          // grid of section blocks
  | "minimal-lines"        // thin lines, pure typography
  | "split-horizontal"     // top/bottom split
  | "bold-accent"          // large accent shapes/blocks
  | "dense-compact";       // information-dense

export type PhotoShape = "circle" | "rounded" | "square" | "portrait" | "none";

export type FontPair = "inter" | "manrope" | "serif" | "mixed";

export interface TemplatePalette {
  accent: string;
  accentDark: string;
  surface: string;     // sidebar/header background
  surfaceText: string; // text on surface
  ink: string;         // main text
  muted: string;       // secondary text
  paper: string;       // page background
}

export interface TemplateDef {
  id: string;
  name: string;
  collection: string;
  archetype: Archetype;
  palette: TemplatePalette;
  font: FontPair;
  photoShape: PhotoShape;
  headerAlign: "left" | "center" | "right";
  accentStyle: "band" | "line" | "dot" | "block" | "minimal";
  description: string;
  badges?: string[];
}

// Curated professional palettes
const P = {
  redRuby: { accent: "#FF4336", accentDark: "#B71C1C", surface: "#212121", surfaceText: "#FFFFFF", ink: "#212121", muted: "#6b6b6b", paper: "#FFFFFF" },
  charcoal: { accent: "#212121", accentDark: "#000000", surface: "#212121", surfaceText: "#FFFFFF", ink: "#212121", muted: "#6b6b6b", paper: "#FFFFFF" },
  navy: { accent: "#1E3A5F", accentDark: "#0F2438", surface: "#1E3A5F", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a7a", paper: "#FFFFFF" },
  blue: { accent: "#2563EB", accentDark: "#1E40AF", surface: "#1E40AF", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a7a", paper: "#FFFFFF" },
  indigo: { accent: "#4F46E5", accentDark: "#3730A3", surface: "#4F46E5", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a5a6a", paper: "#FFFFFF" },
  lavender: { accent: "#7C6FE8", accentDark: "#5B4FD1", surface: "#6D5FD3", surfaceText: "#FFFFFF", ink: "#2a2440", muted: "#6a6480", paper: "#FBFAFF" },
  teal: { accent: "#0D9488", accentDark: "#0F766E", surface: "#0D9488", surfaceText: "#FFFFFF", ink: "#1a2a28", muted: "#5a6a68", paper: "#FFFFFF" },
  cyan: { accent: "#0891B2", accentDark: "#155E75", surface: "#0891B2", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a6a", paper: "#FFFFFF" },
  emerald: { accent: "#059669", accentDark: "#047857", surface: "#065F46", surfaceText: "#FFFFFF", ink: "#1a2a22", muted: "#5a6a5e", paper: "#FFFFFF" },
  forest: { accent: "#166534", accentDark: "#14532D", surface: "#166534", surfaceText: "#FFFFFF", ink: "#1a2a1e", muted: "#5a6a5a", paper: "#FFFFFF" },
  orange: { accent: "#EA580C", accentDark: "#C2410C", surface: "#EA580C", surfaceText: "#FFFFFF", ink: "#2a1a10", muted: "#7a5a4a", paper: "#FFFBF7" },
  gold: { accent: "#CA8A04", accentDark: "#A16207", surface: "#A16207", surfaceText: "#FFFFFF", ink: "#2a2410", muted: "#7a6a4a", paper: "#FFFCF5" },
  purple: { accent: "#7C3AED", accentDark: "#6D28D9", surface: "#6D28D9", surfaceText: "#FFFFFF", ink: "#2a1a3a", muted: "#6a5a7a", paper: "#FFFFFF" },
  burgundy: { accent: "#9F1239", accentDark: "#881337", surface: "#881337", surfaceText: "#FFFFFF", ink: "#2a1a1e", muted: "#7a5a5e", paper: "#FFFBFC" },
  coral: { accent: "#F97066", accentDark: "#E2493E", surface: "#F97066", surfaceText: "#FFFFFF", ink: "#2a1a18", muted: "#7a5a58", paper: "#FFF8F7" },
  pink: { accent: "#DB2777", accentDark: "#BE185D", surface: "#BE185D", surfaceText: "#FFFFFF", ink: "#2a1a22", muted: "#7a5a6a", paper: "#FFFBFD" },
  slate: { accent: "#475569", accentDark: "#334155", surface: "#334155", surfaceText: "#FFFFFF", ink: "#1e293b", muted: "#64748b", paper: "#FFFFFF" },
  slateLight: { accent: "#64748b", accentDark: "#475569", surface: "#F1F5F9", surfaceText: "#1e293b", ink: "#1e293b", muted: "#64748b", paper: "#FFFFFF" },
  horizon: { accent: "#2563EB", accentDark: "#1E40AF", surface: "#1E40AF", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a7a", paper: "#FFFFFF" },
  cream: { accent: "#D97706", accentDark: "#B45309", surface: "#FEF3C7", surfaceText: "#78350F", ink: "#292524", muted: "#78716c", paper: "#FFFBEB" },
  mono: { accent: "#000000", accentDark: "#000000", surface: "#000000", surfaceText: "#FFFFFF", ink: "#0a0a0a", muted: "#6b6b6b", paper: "#FFFFFF" },
  ocean: { accent: "#0E7490", accentDark: "#155E75", surface: "#0E7490", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a6a", paper: "#FFFFFF" },
} as const;

export const TEMPLATE_COLLECTIONS = [
  "Minimal", "Modern", "Professional", "Creative", "Tech",
  "Student", "Bold", "Editorial", "Unique",
] as const;

export const TEMPLATES: TemplateDef[] = [
  // ===== MINIMAL (6) =====
  { id: "apex", name: "Apex", collection: "Minimal", archetype: "centered-single", palette: P.charcoal, font: "inter", photoShape: "none", headerAlign: "center", accentStyle: "line", description: "A distraction-free single-column layout that passes every ATS scan.", badges: ["ATS Friendly"] },
  { id: "pure", name: "Pure", collection: "Minimal", archetype: "minimal-lines", palette: P.slateLight, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "minimal", description: "Pure typography with hairline dividers. Nothing extra." },
  { id: "mono", name: "Mono", collection: "Minimal", archetype: "centered-single", palette: P.mono, font: "inter", photoShape: "none", headerAlign: "center", accentStyle: "minimal", description: "Monochrome minimalism. Black, white, and nothing else." },
  { id: "slate", name: "Slate", collection: "Minimal", archetype: "minimal-lines", palette: P.slate, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Cool slate tones with refined line work." },
  { id: "linear", name: "Linear", collection: "Minimal", archetype: "minimal-lines", palette: P.charcoal, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Linear structure with thin section rules." },
  { id: "focus", name: "Focus", collection: "Minimal", archetype: "centered-single", palette: P.slateLight, font: "inter", photoShape: "none", headerAlign: "center", accentStyle: "dot", description: "Centered focus layout that draws the eye down." },

  // ===== MODERN (6) =====
  { id: "vertex", name: "Vertex", collection: "Modern", archetype: "header-band-twocol", palette: P.redRuby, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Clean, modern, and designed for almost any profession.", badges: ["Recommended"] },
  { id: "nova", name: "Nova", collection: "Modern", archetype: "header-band-twocol", palette: P.indigo, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Contemporary indigo layout with strong hierarchy." },
  { id: "axis", name: "Axis", collection: "Modern", archetype: "left-sidebar", palette: P.navy, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "Axis-aligned sidebar with a confident navy identity." },
  { id: "frame", name: "Frame", collection: "Modern", archetype: "minimal-lines", palette: P.charcoal, font: "manrope", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Framed layout with a typographic border treatment." },
  { id: "shift", name: "Shift", collection: "Modern", archetype: "right-sidebar", palette: P.blue, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Shifted sidebar on the right for a modern asymmetry." },
  { id: "flow", name: "Flow", collection: "Modern", archetype: "header-band-twocol", palette: P.teal, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Fluid teal layout that guides the reader naturally." },

  // ===== PROFESSIONAL (6) =====
  { id: "executive", name: "Executive", collection: "Professional", archetype: "left-sidebar", palette: P.charcoal, font: "serif", photoShape: "circle", headerAlign: "left", accentStyle: "block", description: "Formal executive layout with a circular photo and serif type.", badges: ["Popular"] },
  { id: "summit", name: "Summit", collection: "Professional", archetype: "header-band-twocol", palette: P.navy, font: "serif", photoShape: "none", headerAlign: "center", accentStyle: "band", description: "Summit-grade professional layout for senior roles." },
  { id: "capital", name: "Capital", collection: "Professional", archetype: "centered-single", palette: P.slate, font: "serif", photoShape: "none", headerAlign: "center", accentStyle: "line", description: "Corporate center-aligned layout with serif dignity." },
  { id: "board", name: "Board", collection: "Professional", archetype: "dense-compact", palette: P.charcoal, font: "serif", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Dense board-ready layout maximizing every inch." },
  { id: "prime", name: "Prime", collection: "Professional", archetype: "left-sidebar", palette: P.navy, font: "inter", photoShape: "circle", headerAlign: "left", accentStyle: "block", description: "Prime professional layout with photo and navy sidebar." },
  { id: "legacy", name: "Legacy", collection: "Professional", archetype: "minimal-lines", palette: P.slate, font: "serif", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Timeless serif layout with traditional spacing." },

  // ===== CREATIVE (6) =====
  { id: "canvas", name: "Canvas", collection: "Creative", archetype: "left-sidebar", palette: P.redRuby, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "A bold creative layout with a full-color sidebar.", badges: ["New"] },
  { id: "studio", name: "Studio", collection: "Creative", archetype: "top-photo", palette: P.coral, font: "inter", photoShape: "portrait", headerAlign: "left", accentStyle: "band", description: "Studio-style creative layout with a portrait photo." },
  { id: "muse", name: "Muse", collection: "Creative", archetype: "left-sidebar", palette: P.pink, font: "inter", photoShape: "rounded", headerAlign: "left", accentStyle: "block", description: "Expressive pink-burgundy layout for creatives." },
  { id: "gallery", name: "Gallery", collection: "Creative", archetype: "top-photo", palette: P.lavender, font: "inter", photoShape: "square", headerAlign: "left", accentStyle: "band", description: "Portfolio-inspired layout with a gallery-style photo." },
  { id: "prism", name: "Prism", collection: "Creative", archetype: "bold-accent", palette: P.purple, font: "manrope", photoShape: "none", headerAlign: "center", accentStyle: "block", description: "Prismatic layout with bold accent geometry." },
  { id: "story", name: "Story", collection: "Creative", archetype: "editorial", palette: P.burgundy, font: "serif", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Narrative editorial layout that tells your story." },

  // ===== TECH (6) =====
  { id: "stack", name: "Stack", collection: "Tech", archetype: "left-sidebar", palette: P.charcoal, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "Stacked tech layout with a dark skills sidebar." },
  { id: "devgrid", name: "DevGrid", collection: "Tech", archetype: "grid-blocks", palette: P.blue, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Grid-based layout structured like a dev dashboard." },
  { id: "signal", name: "Signal", collection: "Tech", archetype: "header-band-twocol", palette: P.teal, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Clear signal tech layout with teal accents." },
  { id: "system", name: "System", collection: "Tech", archetype: "dense-compact", palette: P.slate, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "dot", description: "Systematic dense layout optimized for information." },
  { id: "byte", name: "Byte", collection: "Tech", archetype: "minimal-lines", palette: P.charcoal, font: "manrope", photoShape: "none", headerAlign: "left", accentStyle: "dot", description: "Compact byte-sized layout with mono-inspired detail." },
  { id: "quantum", name: "Quantum", collection: "Tech", archetype: "header-band-twocol", palette: P.indigo, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Modern two-column tech layout with indigo identity." },

  // ===== STUDENT (6) =====
  { id: "launch", name: "Launch", collection: "Student", archetype: "timeline", palette: P.blue, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "dot", description: "Launch your career with a friendly timeline layout." },
  { id: "future", name: "Future", collection: "Student", archetype: "left-sidebar", palette: P.teal, font: "inter", photoShape: "rounded", headerAlign: "left", accentStyle: "block", description: "Forward-looking layout for students and freshers." },
  { id: "scholar", name: "Scholar", collection: "Student", archetype: "centered-single", palette: P.navy, font: "serif", photoShape: "none", headerAlign: "center", accentStyle: "line", description: "Academic scholar layout with education-first hierarchy." },
  { id: "momentum", name: "Momentum", collection: "Student", archetype: "header-band-twocol", palette: P.orange, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Energetic layout that builds momentum for new grads." },
  { id: "intern", name: "Intern", collection: "Student", archetype: "minimal-lines", palette: P.slateLight, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Clean intern-friendly layout emphasizing potential." },
  { id: "firststep", name: "FirstStep", collection: "Student", archetype: "timeline", palette: P.emerald, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "dot", description: "Your first step — a gentle timeline for beginners." },

  // ===== BOLD (6) =====
  { id: "impact", name: "Impact", collection: "Bold", archetype: "bold-accent", palette: P.redRuby, font: "manrope", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "Maximum impact with bold red accent blocks." },
  { id: "crimson", name: "Crimson", collection: "Bold", archetype: "left-sidebar", palette: P.redRuby, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "Bold crimson sidebar with strong section blocks." },
  { id: "royal", name: "Royal", collection: "Bold", archetype: "bold-accent", palette: P.purple, font: "manrope", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "Royal purple layout with confident typography." },
  { id: "horizon", name: "Horizon", collection: "Bold", archetype: "split-horizontal", palette: P.horizon, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Split horizon layout with blue-orange energy." },
  { id: "ember", name: "Ember", collection: "Bold", archetype: "bold-accent", palette: P.orange, font: "manrope", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "Warm ember layout with orange-gold confidence." },
  { id: "pulse", name: "Pulse", collection: "Bold", archetype: "header-band-twocol", palette: P.burgundy, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Pulsing burgundy layout with rhythm and energy." },

  // ===== EDITORIAL (6) =====
  { id: "journal", name: "Journal", collection: "Editorial", archetype: "editorial", palette: P.charcoal, font: "serif", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Magazine-inspired serif layout with sophisticated columns." },
  { id: "column", name: "Column", collection: "Editorial", archetype: "centered-single", palette: P.slate, font: "serif", photoShape: "none", headerAlign: "center", accentStyle: "line", description: "Single editorial column with refined serifs." },
  { id: "folio", name: "Folio", collection: "Editorial", archetype: "minimal-lines", palette: P.cream, font: "serif", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Folio layout with warm cream paper and gold accents." },
  { id: "modernist", name: "Modernist", collection: "Editorial", archetype: "editorial", palette: P.charcoal, font: "mixed", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Modernist editorial mixing serif headings with sans body." },
  { id: "classic", name: "Classic", collection: "Editorial", archetype: "centered-single", palette: P.slate, font: "serif", photoShape: "none", headerAlign: "center", accentStyle: "line", description: "Classic editorial layout with timeless proportions." },
  { id: "archive", name: "Archive", collection: "Editorial", archetype: "left-sidebar", palette: P.cream, font: "serif", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Archival editorial layout with a cream sidebar." },

  // ===== UNIQUE (6) =====
  { id: "timeline", name: "Timeline", collection: "Unique", archetype: "timeline", palette: P.charcoal, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "dot", description: "Career history as a beautiful vertical timeline." },
  { id: "split", name: "Split", collection: "Unique", archetype: "split-horizontal", palette: P.charcoal, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "band", description: "Dramatic top-bottom split for a distinctive look." },
  { id: "orbit", name: "Orbit", collection: "Unique", archetype: "top-photo", palette: P.blue, font: "inter", photoShape: "circle", headerAlign: "left", accentStyle: "band", description: "Orbital layout with a circular photo centerpiece." },
  { id: "profile", name: "Profile", collection: "Unique", archetype: "top-photo", palette: P.redRuby, font: "inter", photoShape: "portrait", headerAlign: "left", accentStyle: "band", description: "Large professional portrait at the top. Bold and personal." },
  { id: "grid", name: "Grid", collection: "Unique", archetype: "grid-blocks", palette: P.charcoal, font: "inter", photoShape: "none", headerAlign: "left", accentStyle: "line", description: "Structured grid layout with modular section blocks." },
  { id: "elevate", name: "Elevate", collection: "Unique", archetype: "bold-accent", palette: P.gold, font: "manrope", photoShape: "none", headerAlign: "left", accentStyle: "block", description: "Elevated layout with gold accents and confident geometry." },
];

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES.find((t) => t.id === "vertex")!;
}

export function templatesByCollection(collection: string): TemplateDef[] {
  if (collection === "All") return TEMPLATES;
  return TEMPLATES.filter((t) => t.collection === collection);
}

export const FILTER_CATEGORIES = ["All", ...TEMPLATE_COLLECTIONS] as const;

// Curated accent color options for the design panel (professional palettes)
export const ACCENT_COLORS = [
  { name: "Red", value: "#FF4336" },
  { name: "Ruby", value: "#B71C1C" },
  { name: "Charcoal", value: "#212121" },
  { name: "Navy", value: "#1E3A5F" },
  { name: "Blue", value: "#2563EB" },
  { name: "Indigo", value: "#4F46E5" },
  { name: "Teal", value: "#0D9488" },
  { name: "Emerald", value: "#059669" },
  { name: "Forest", value: "#166534" },
  { name: "Orange", value: "#EA580C" },
  { name: "Gold", value: "#CA8A04" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Pink", value: "#DB2777" },
  { name: "Slate", value: "#475569" },
];
