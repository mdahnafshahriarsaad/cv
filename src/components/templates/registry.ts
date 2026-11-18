// Nirvash CV Maker — 54-template library.
// A template is a layout archetype plus a palette, a font pairing and a few
// typographic details (section-label style, skill style, bullet glyph).

export type Archetype =
  | "header-band-twocol"   // full-bleed colour band header + main/side columns
  | "centered-single"      // centred header, single column (ATS friendly)
  | "left-sidebar"         // coloured sidebar left + main column
  | "right-sidebar"        // main column + coloured sidebar right
  | "timeline"             // single column with a dated timeline rail
  | "editorial"            // centred serif masthead, labels in a left gutter
  | "top-photo"            // tinted header with a large photo
  | "grid-blocks"          // split header, side column in a tinted panel
  | "minimal-lines"        // left-aligned header, hairline-separated sections
  | "split-horizontal"     // tall colour block holding header + summary
  | "bold-accent"          // accent edge stripe, oversized name
  | "dense-compact";       // tight spacing, divider between two columns

export type PhotoShape = "circle" | "rounded" | "square" | "portrait" | "none";

/** sans = Geist, display = Manrope headings + Geist, serif = Source Serif 4, mixed = serif headings + Geist. */
export type FontPair = "sans" | "display" | "serif" | "mixed";

export type LabelStyle = "bar" | "rule" | "dot" | "plain" | "tag" | "underline";
export type SkillStyle = "chips" | "tags" | "inline" | "list";
export type BulletStyle = "dot" | "dash" | "square" | "chevron";

export interface TemplatePalette {
  accent: string;
  accentDark: string;
  surface: string;     // sidebar / header band background
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
  label: LabelStyle;
  skills: SkillStyle;
  bullet: BulletStyle;
  /** set the name in spaced capitals */
  upperName?: boolean;
  description: string;
  badges?: string[];
}

const P = {
  redRuby: { accent: "#FF4336", accentDark: "#B71C1C", surface: "#212121", surfaceText: "#FFFFFF", ink: "#212121", muted: "#6b6b6b", paper: "#FFFFFF" },
  crimson: { accent: "#DC2626", accentDark: "#991B1B", surface: "#8F1D1D", surfaceText: "#FFFFFF", ink: "#231A1A", muted: "#6f5f5f", paper: "#FFFFFF" },
  charcoal: { accent: "#212121", accentDark: "#000000", surface: "#212121", surfaceText: "#FFFFFF", ink: "#212121", muted: "#6b6b6b", paper: "#FFFFFF" },
  navy: { accent: "#1E3A5F", accentDark: "#0F2438", surface: "#1E3A5F", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a7a", paper: "#FFFFFF" },
  blue: { accent: "#2563EB", accentDark: "#1E40AF", surface: "#1E40AF", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a7a", paper: "#FFFFFF" },
  indigo: { accent: "#4F46E5", accentDark: "#3730A3", surface: "#4338CA", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a5a6a", paper: "#FFFFFF" },
  lavender: { accent: "#7C6FE8", accentDark: "#5B4FD1", surface: "#6D5FD3", surfaceText: "#FFFFFF", ink: "#2a2440", muted: "#6a6480", paper: "#FBFAFF" },
  teal: { accent: "#0D9488", accentDark: "#0F766E", surface: "#0F766E", surfaceText: "#FFFFFF", ink: "#1a2a28", muted: "#5a6a68", paper: "#FFFFFF" },
  cyan: { accent: "#0891B2", accentDark: "#155E75", surface: "#155E75", surfaceText: "#FFFFFF", ink: "#1a1a1a", muted: "#5a6a6a", paper: "#FFFFFF" },
  emerald: { accent: "#059669", accentDark: "#047857", surface: "#065F46", surfaceText: "#FFFFFF", ink: "#1a2a22", muted: "#5a6a5e", paper: "#FFFFFF" },
  orange: { accent: "#EA580C", accentDark: "#C2410C", surface: "#C2410C", surfaceText: "#FFFFFF", ink: "#2a1a10", muted: "#7a5a4a", paper: "#FFFBF7" },
  gold: { accent: "#CA8A04", accentDark: "#A16207", surface: "#854D0E", surfaceText: "#FFFFFF", ink: "#2a2410", muted: "#7a6a4a", paper: "#FFFCF5" },
  purple: { accent: "#7C3AED", accentDark: "#6D28D9", surface: "#5B21B6", surfaceText: "#FFFFFF", ink: "#2a1a3a", muted: "#6a5a7a", paper: "#FFFFFF" },
  burgundy: { accent: "#9F1239", accentDark: "#881337", surface: "#881337", surfaceText: "#FFFFFF", ink: "#2a1a1e", muted: "#7a5a5e", paper: "#FFFBFC" },
  coral: { accent: "#F97066", accentDark: "#C83A30", surface: "#E2493E", surfaceText: "#FFFFFF", ink: "#2a1a18", muted: "#7a5a58", paper: "#FFF8F7" },
  pink: { accent: "#DB2777", accentDark: "#BE185D", surface: "#9D174D", surfaceText: "#FFFFFF", ink: "#2a1a22", muted: "#7a5a6a", paper: "#FFFBFD" },
  slate: { accent: "#475569", accentDark: "#334155", surface: "#334155", surfaceText: "#FFFFFF", ink: "#1e293b", muted: "#64748b", paper: "#FFFFFF" },
  slateLight: { accent: "#64748b", accentDark: "#475569", surface: "#F1F5F9", surfaceText: "#1e293b", ink: "#1e293b", muted: "#64748b", paper: "#FFFFFF" },
  cream: { accent: "#B45309", accentDark: "#92400E", surface: "#FEF3C7", surfaceText: "#78350F", ink: "#292524", muted: "#78716c", paper: "#FFFBEB" },
  mono: { accent: "#000000", accentDark: "#000000", surface: "#0a0a0a", surfaceText: "#FFFFFF", ink: "#0a0a0a", muted: "#6b6b6b", paper: "#FFFFFF" },
} as const;

export const TEMPLATE_COLLECTIONS = [
  "Minimal", "Modern", "Professional", "Creative", "Tech",
  "Student", "Bold", "Editorial", "Unique",
] as const;

export const TEMPLATES: TemplateDef[] = [
  // ===== MINIMAL (6) =====
  { id: "apex", name: "Apex", collection: "Minimal", archetype: "centered-single", palette: P.charcoal, font: "sans", photoShape: "circle", label: "rule", skills: "inline", bullet: "dot", description: "A single uninterrupted column that applicant tracking systems read without trouble.", badges: ["ATS Friendly"] },
  { id: "pure", name: "Pure", collection: "Minimal", archetype: "minimal-lines", palette: P.slateLight, font: "sans", photoShape: "circle", label: "plain", skills: "inline", bullet: "dash", description: "Typography and hairlines. Nothing else on the page." },
  { id: "mono", name: "Mono", collection: "Minimal", archetype: "centered-single", palette: P.mono, font: "sans", photoShape: "circle", label: "plain", skills: "inline", bullet: "square", upperName: true, description: "Black on white, with your name set in spaced capitals." },
  { id: "slate", name: "Slate", collection: "Minimal", archetype: "minimal-lines", palette: P.slate, font: "sans", photoShape: "circle", label: "rule", skills: "chips", bullet: "dot", description: "Cool slate tones and quiet section rules." },
  { id: "linear", name: "Linear", collection: "Minimal", archetype: "minimal-lines", palette: P.charcoal, font: "sans", photoShape: "circle", label: "underline", skills: "inline", bullet: "dash", description: "Underlined section headings on a strict left edge." },
  { id: "focus", name: "Focus", collection: "Minimal", archetype: "centered-single", palette: P.slateLight, font: "sans", photoShape: "circle", label: "dot", skills: "chips", bullet: "dot", description: "A centred header that leads the eye straight into your experience." },

  // ===== MODERN (6) =====
  { id: "vertex", name: "Vertex", collection: "Modern", archetype: "header-band-twocol", palette: P.redRuby, font: "sans", photoShape: "circle", label: "bar", skills: "chips", bullet: "dot", description: "A charcoal header band over two balanced columns. Works for almost any profession.", badges: ["Recommended"] },
  { id: "nova", name: "Nova", collection: "Modern", archetype: "header-band-twocol", palette: P.indigo, font: "sans", photoShape: "circle", label: "underline", skills: "tags", bullet: "dot", description: "An indigo header band with tinted skill tags." },
  { id: "axis", name: "Axis", collection: "Modern", archetype: "left-sidebar", palette: P.navy, font: "sans", photoShape: "circle", label: "bar", skills: "chips", bullet: "dot", description: "A navy sidebar for contact details and skills, with your story on the right." },
  { id: "frame", name: "Frame", collection: "Modern", archetype: "minimal-lines", palette: P.charcoal, font: "display", photoShape: "circle", label: "tag", skills: "chips", bullet: "square", description: "Filled section tags and a heavy display name." },
  { id: "shift", name: "Shift", collection: "Modern", archetype: "right-sidebar", palette: P.blue, font: "sans", photoShape: "circle", label: "rule", skills: "list", bullet: "dash", description: "The sidebar moves to the right, so your experience leads." },
  { id: "flow", name: "Flow", collection: "Modern", archetype: "header-band-twocol", palette: P.teal, font: "sans", photoShape: "circle", label: "dot", skills: "tags", bullet: "chevron", description: "A teal header band with soft tags and chevron bullets." },

  // ===== PROFESSIONAL (6) =====
  { id: "executive", name: "Executive", collection: "Professional", archetype: "left-sidebar", palette: P.charcoal, font: "serif", photoShape: "circle", label: "rule", skills: "list", bullet: "dot", description: "A formal serif layout with a charcoal sidebar, built for senior roles.", badges: ["Popular"] },
  { id: "summit", name: "Summit", collection: "Professional", archetype: "header-band-twocol", palette: P.navy, font: "serif", photoShape: "circle", label: "underline", skills: "inline", bullet: "dot", description: "A navy header band with serif type throughout." },
  { id: "capital", name: "Capital", collection: "Professional", archetype: "centered-single", palette: P.slate, font: "serif", photoShape: "circle", label: "rule", skills: "inline", bullet: "dot", upperName: true, description: "A centred serif layout with your name in capitals." },
  { id: "board", name: "Board", collection: "Professional", archetype: "dense-compact", palette: P.charcoal, font: "serif", photoShape: "circle", label: "underline", skills: "inline", bullet: "dash", description: "Tight spacing that fits a long career on fewer pages." },
  { id: "prime", name: "Prime", collection: "Professional", archetype: "left-sidebar", palette: P.navy, font: "sans", photoShape: "circle", label: "underline", skills: "chips", bullet: "dot", description: "A navy sidebar with underlined headings in the main column." },
  { id: "legacy", name: "Legacy", collection: "Professional", archetype: "minimal-lines", palette: P.slate, font: "serif", photoShape: "circle", label: "rule", skills: "inline", bullet: "dot", description: "Traditional serif type with generous spacing." },

  // ===== CREATIVE (6) =====
  { id: "canvas", name: "Canvas", collection: "Creative", archetype: "left-sidebar", palette: P.redRuby, font: "sans", photoShape: "circle", label: "tag", skills: "chips", bullet: "dot", description: "A charcoal sidebar with red section tags.", badges: ["New"] },
  { id: "studio", name: "Studio", collection: "Creative", archetype: "top-photo", palette: P.coral, font: "sans", photoShape: "portrait", label: "bar", skills: "tags", bullet: "dot", description: "A warm tinted header with a portrait photo." },
  { id: "muse", name: "Muse", collection: "Creative", archetype: "left-sidebar", palette: P.pink, font: "sans", photoShape: "rounded", label: "dot", skills: "chips", bullet: "dot", description: "A deep pink sidebar with a rounded photo." },
  { id: "gallery", name: "Gallery", collection: "Creative", archetype: "top-photo", palette: P.lavender, font: "sans", photoShape: "square", label: "underline", skills: "tags", bullet: "dot", description: "A lavender header with a square photo, in the manner of a portfolio cover." },
  { id: "prism", name: "Prism", collection: "Creative", archetype: "bold-accent", palette: P.purple, font: "display", photoShape: "circle", label: "tag", skills: "tags", bullet: "square", description: "A purple edge stripe, an oversized name and filled tags." },
  { id: "story", name: "Story", collection: "Creative", archetype: "editorial", palette: P.burgundy, font: "serif", photoShape: "circle", label: "plain", skills: "inline", bullet: "dash", description: "A serif masthead with section labels in the margin." },

  // ===== TECH (6) =====
  { id: "stack", name: "Stack", collection: "Tech", archetype: "left-sidebar", palette: P.charcoal, font: "sans", photoShape: "circle", label: "bar", skills: "list", bullet: "chevron", description: "A dark sidebar that lists your stack line by line." },
  { id: "devgrid", name: "DevGrid", collection: "Tech", archetype: "grid-blocks", palette: P.blue, font: "sans", photoShape: "circle", label: "tag", skills: "chips", bullet: "chevron", description: "Skills and credentials in a tinted side panel." },
  { id: "signal", name: "Signal", collection: "Tech", archetype: "header-band-twocol", palette: P.cyan, font: "sans", photoShape: "circle", label: "bar", skills: "chips", bullet: "dash", description: "A deep cyan header band over two columns." },
  { id: "system", name: "System", collection: "Tech", archetype: "dense-compact", palette: P.slate, font: "sans", photoShape: "circle", label: "dot", skills: "inline", bullet: "dot", description: "Compact, information-dense, and easy to scan." },
  { id: "byte", name: "Byte", collection: "Tech", archetype: "minimal-lines", palette: P.charcoal, font: "display", photoShape: "circle", label: "dot", skills: "tags", bullet: "chevron", description: "A display name, dot headings and chevron bullets." },
  { id: "quantum", name: "Quantum", collection: "Tech", archetype: "header-band-twocol", palette: P.indigo, font: "display", photoShape: "circle", label: "tag", skills: "chips", bullet: "chevron", description: "An indigo header band with filled section tags." },

  // ===== STUDENT (6) =====
  { id: "launch", name: "Launch", collection: "Student", archetype: "timeline", palette: P.blue, font: "sans", photoShape: "circle", label: "dot", skills: "tags", bullet: "dot", description: "Your studies and first roles on a dated timeline." },
  { id: "future", name: "Future", collection: "Student", archetype: "left-sidebar", palette: P.teal, font: "sans", photoShape: "rounded", label: "bar", skills: "chips", bullet: "dot", description: "A teal sidebar that puts skills beside your education." },
  { id: "scholar", name: "Scholar", collection: "Student", archetype: "centered-single", palette: P.navy, font: "serif", photoShape: "circle", label: "underline", skills: "inline", bullet: "dot", description: "A centred serif layout suited to academic applications." },
  { id: "momentum", name: "Momentum", collection: "Student", archetype: "header-band-twocol", palette: P.orange, font: "sans", photoShape: "circle", label: "bar", skills: "tags", bullet: "dot", description: "A burnt-orange header band for new graduates." },
  { id: "intern", name: "Intern", collection: "Student", archetype: "minimal-lines", palette: P.slateLight, font: "sans", photoShape: "circle", label: "rule", skills: "chips", bullet: "dot", description: "A light, simple layout that works with a short history." },
  { id: "firststep", name: "FirstStep", collection: "Student", archetype: "timeline", palette: P.emerald, font: "sans", photoShape: "circle", label: "bar", skills: "chips", bullet: "dot", description: "A green timeline for a first CV." },

  // ===== BOLD (6) =====
  { id: "impact", name: "Impact", collection: "Bold", archetype: "bold-accent", palette: P.redRuby, font: "display", photoShape: "circle", label: "tag", skills: "tags", bullet: "square", description: "A red edge stripe and a name you cannot miss." },
  { id: "crimson", name: "Crimson", collection: "Bold", archetype: "left-sidebar", palette: P.crimson, font: "sans", photoShape: "circle", label: "bar", skills: "list", bullet: "dot", description: "A deep red sidebar." },
  { id: "royal", name: "Royal", collection: "Bold", archetype: "bold-accent", palette: P.purple, font: "display", photoShape: "circle", label: "underline", skills: "chips", bullet: "dot", description: "A purple edge stripe with underlined headings." },
  { id: "horizon", name: "Horizon", collection: "Bold", archetype: "split-horizontal", palette: P.blue, font: "sans", photoShape: "circle", label: "bar", skills: "tags", bullet: "dot", description: "A tall blue block carries your name and summary." },
  { id: "ember", name: "Ember", collection: "Bold", archetype: "bold-accent", palette: P.orange, font: "display", photoShape: "circle", label: "bar", skills: "chips", bullet: "dash", description: "A burnt-orange edge stripe on warm paper." },
  { id: "pulse", name: "Pulse", collection: "Bold", archetype: "header-band-twocol", palette: P.burgundy, font: "sans", photoShape: "circle", label: "rule", skills: "chips", bullet: "dot", description: "A burgundy header band with ruled headings." },

  // ===== EDITORIAL (6) =====
  { id: "journal", name: "Journal", collection: "Editorial", archetype: "editorial", palette: P.charcoal, font: "serif", photoShape: "circle", label: "plain", skills: "inline", bullet: "dot", upperName: true, description: "A magazine masthead with labels set in the margin." },
  { id: "column", name: "Column", collection: "Editorial", archetype: "centered-single", palette: P.slate, font: "serif", photoShape: "circle", label: "plain", skills: "inline", bullet: "dash", description: "One serif column under a centred header." },
  { id: "folio", name: "Folio", collection: "Editorial", archetype: "minimal-lines", palette: P.cream, font: "serif", photoShape: "circle", label: "underline", skills: "inline", bullet: "dot", description: "Cream paper with amber accents." },
  { id: "modernist", name: "Modernist", collection: "Editorial", archetype: "editorial", palette: P.charcoal, font: "mixed", photoShape: "circle", label: "rule", skills: "inline", bullet: "square", description: "Serif headings over a sans-serif body." },
  { id: "classic", name: "Classic", collection: "Editorial", archetype: "centered-single", palette: P.charcoal, font: "serif", photoShape: "circle", label: "rule", skills: "inline", bullet: "dash", description: "Centred, serif and unhurried." },
  { id: "archive", name: "Archive", collection: "Editorial", archetype: "left-sidebar", palette: P.cream, font: "serif", photoShape: "circle", label: "rule", skills: "list", bullet: "dot", description: "A cream sidebar with serif type." },

  // ===== UNIQUE (6) =====
  { id: "timeline", name: "Timeline", collection: "Unique", archetype: "timeline", palette: P.charcoal, font: "sans", photoShape: "circle", label: "rule", skills: "chips", bullet: "dot", description: "Your career laid out on a dated vertical rail." },
  { id: "split", name: "Split", collection: "Unique", archetype: "split-horizontal", palette: P.charcoal, font: "sans", photoShape: "circle", label: "underline", skills: "chips", bullet: "dot", description: "A charcoal block holds your name and summary." },
  { id: "orbit", name: "Orbit", collection: "Unique", archetype: "top-photo", palette: P.blue, font: "sans", photoShape: "circle", label: "dot", skills: "chips", bullet: "dot", description: "A pale blue header built around a round photo." },
  { id: "profile", name: "Profile", collection: "Unique", archetype: "top-photo", palette: P.redRuby, font: "sans", photoShape: "portrait", label: "bar", skills: "chips", bullet: "dot", description: "A large portrait beside your name." },
  { id: "grid", name: "Grid", collection: "Unique", archetype: "grid-blocks", palette: P.charcoal, font: "sans", photoShape: "circle", label: "rule", skills: "chips", bullet: "dot", description: "A modular layout with a grey side panel." },
  { id: "elevate", name: "Elevate", collection: "Unique", archetype: "bold-accent", palette: P.gold, font: "display", photoShape: "circle", label: "underline", skills: "tags", bullet: "dot", description: "A gold edge stripe on warm paper." },
];

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES.find((t) => t.id === "vertex")!;
}

export function templatesByCollection(collection: string): TemplateDef[] {
  if (collection === "All") return TEMPLATES;
  return TEMPLATES.filter((t) => t.collection === collection);
}

export const FILTER_CATEGORIES = ["All", ...TEMPLATE_COLLECTIONS] as const;

const ARCHETYPE_LABELS: Record<Archetype, string> = {
  "header-band-twocol": "Header band, two columns",
  "centered-single": "Centred single column",
  "left-sidebar": "Left sidebar",
  "right-sidebar": "Right sidebar",
  timeline: "Timeline",
  editorial: "Editorial",
  "top-photo": "Photo header",
  "grid-blocks": "Side panel",
  "minimal-lines": "Minimal lines",
  "split-horizontal": "Split header",
  "bold-accent": "Accent stripe",
  "dense-compact": "Compact two columns",
};

export function archetypeLabel(a: Archetype): string {
  return ARCHETYPE_LABELS[a];
}

// Curated accent colour options for the design panel
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

export const FONT_PAIRS: { id: FontPair; name: string; desc: string }[] = [
  { id: "sans", name: "Geist", desc: "Clean and neutral" },
  { id: "display", name: "Manrope + Geist", desc: "Strong headings" },
  { id: "serif", name: "Source Serif", desc: "Traditional and formal" },
  { id: "mixed", name: "Serif + Geist", desc: "Serif headings, sans body" },
];
