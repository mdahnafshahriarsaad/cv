"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import {
  CVDocument,
  DesignSettings,
  Experience,
  Education,
  Project,
  Skill,
  Certification,
  Language,
  Award,
  VolunteerItem,
  Publication,
  ProfessionalLink,
  SectionKey,
  createEmptyCV,
  createSampleCV,
  normalizeCV,
  uid,
  DEFAULT_SECTION_ORDER,
} from "@/lib/cv-data/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Lists whose entries the user can reorder. */
export type OrderedList =
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "languages"
  | "awards"
  | "volunteer"
  | "publications";

interface CVStoreState {
  /** the CV currently being edited */
  current: CVDocument | null;
  /** all saved CVs */
  docs: CVDocument[];
  saveStatus: SaveStatus;
  setSaveStatus: (s: SaveStatus) => void;

  // documents
  newCV: (name?: string) => string; // returns id
  loadCV: (id: string) => void;
  loadSample: () => string;
  deleteCV: (id: string) => void;
  duplicateCV: (id: string) => string | null;
  renameCV: (name: string) => void;
  setTemplate: (templateId: string) => void;
  setDesign: (patch: Partial<DesignSettings>) => void;
  setSectionOrder: (order: SectionKey[]) => void;
  moveItem: (list: OrderedList, id: string, direction: -1 | 1) => void;

  // personal info
  updatePersonal: (patch: Partial<CVDocument["personalInfo"]>) => void;
  setPhoto: (photo: CVDocument["personalInfo"]["photo"]) => void;
  removePhoto: () => void;
  addLink: () => void;
  updateLink: (id: string, patch: Partial<ProfessionalLink>) => void;
  removeLink: (id: string) => void;

  setSummary: (s: string) => void;
  setProfileType: (t: string) => void;

  // repeatable sections — every add* returns the new entry's id
  addExperience: (exp?: Partial<Experience>) => string;
  updateExperience: (id: string, patch: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  duplicateExperience: (id: string) => void;

  addEducation: (edu?: Partial<Education>) => string;
  updateEducation: (id: string, patch: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addProject: (p?: Partial<Project>) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;

  addSkill: (name: string) => void;
  removeSkill: (id: string) => void;
  setSkills: (skills: Skill[]) => void;

  addCertification: (c?: Partial<Certification>) => string;
  updateCertification: (id: string, patch: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  addLanguage: (l?: Partial<Language>) => string;
  updateLanguage: (id: string, patch: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  addAward: (a?: Partial<Award>) => string;
  updateAward: (id: string, patch: Partial<Award>) => void;
  removeAward: (id: string) => void;

  addVolunteer: (v?: Partial<VolunteerItem>) => string;
  updateVolunteer: (id: string, patch: Partial<VolunteerItem>) => void;
  removeVolunteer: (id: string) => void;

  addPublication: (p?: Partial<Publication>) => string;
  updatePublication: (id: string, patch: Partial<Publication>) => void;
  removePublication: (id: string) => void;

  addInterest: (name: string) => void;
  removeInterest: (id: string) => void;
}

/**
 * localStorage that never throws. A full or blocked store must not crash an
 * edit; the failure is remembered so the UI can say the CV was not saved.
 */
let lastWriteFailed = false;
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
      lastWriteFailed = false;
    } catch {
      lastWriteFailed = true;
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* nothing to remove */
    }
  },
};

type Row = { id: string };

export const useCVStore = create<CVStoreState>()(
  persist(
    (set, get) => {
      /** Apply a change to the CV being edited and stamp it as updated. */
      const edit = (fn: (c: CVDocument) => CVDocument) => {
        const c = get().current;
        if (!c) return;
        const next = fn(c);
        if (next !== c) set({ current: { ...next, updatedAt: Date.now() } });
      };

      const addRow = <K extends OrderedList>(list: K, row: CVDocument[K][number]): string => {
        edit((c) => ({ ...c, [list]: [...c[list], row] }));
        return row.id;
      };
      const updateRow = <K extends OrderedList>(list: K, id: string, patch: Partial<CVDocument[K][number]>) =>
        edit((c) => ({
          ...c,
          [list]: (c[list] as Row[]).map((row) => (row.id === id ? { ...row, ...patch } : row)),
        }));
      const removeRow = (list: OrderedList | "skills" | "interests", id: string) =>
        edit((c) => ({ ...c, [list]: (c[list] as Row[]).filter((row) => row.id !== id) }));

      return {
        current: null,
        docs: [],
        saveStatus: "idle",
        setSaveStatus: (s) => set({ saveStatus: s }),

        newCV: (name) => {
          const doc = createEmptyCV(name);
          set({ current: doc, saveStatus: "saved" });
          return doc.id;
        },

        loadCV: (id) => {
          const doc = get().docs.find((d) => d.id === id);
          if (doc) set({ current: doc, saveStatus: "saved" });
        },

        loadSample: () => {
          const now = Date.now();
          const doc: CVDocument = { ...createSampleCV(), id: uid(), createdAt: now, updatedAt: now };
          set({ current: doc, saveStatus: "saved" });
          return doc.id;
        },

        deleteCV: (id) =>
          set((s) => ({
            docs: s.docs.filter((d) => d.id !== id),
            current: s.current?.id === id ? null : s.current,
          })),

        duplicateCV: (id) => {
          const source = get().docs.find((d) => d.id === id);
          if (!source) return null;
          const now = Date.now();
          const copy: CVDocument = {
            ...source,
            id: uid(),
            name: `${source.name || "Untitled CV"} (copy)`,
            createdAt: now,
            updatedAt: now,
          };
          set((s) => ({ docs: [...s.docs, copy] }));
          return copy.id;
        },

        renameCV: (name) => edit((c) => ({ ...c, name })),

        // A template brings its own palette and fonts, so picking a new one
        // drops colour/typography overrides made for the previous template.
        setTemplate: (templateId) =>
          edit((c) =>
            c.design.templateId === templateId
              ? c
              : { ...c, design: { ...c.design, templateId, accentColor: "", typography: "auto" } }
          ),

        setDesign: (patch) => edit((c) => ({ ...c, design: { ...c.design, ...patch } })),

        setSectionOrder: (order) => edit((c) => ({ ...c, design: { ...c.design, sectionOrder: order } })),

        moveItem: (list, id, direction) =>
          edit((c) => {
            const rows = c[list] as Row[];
            const from = rows.findIndex((row) => row.id === id);
            const to = from + direction;
            if (from < 0 || to < 0 || to >= rows.length) return c;
            const next = rows.slice();
            [next[from], next[to]] = [next[to], next[from]];
            return { ...c, [list]: next };
          }),

        updatePersonal: (patch) => edit((c) => ({ ...c, personalInfo: { ...c.personalInfo, ...patch } })),
        setPhoto: (photo) => edit((c) => ({ ...c, personalInfo: { ...c.personalInfo, photo } })),
        removePhoto: () => edit((c) => ({ ...c, personalInfo: { ...c.personalInfo, photo: null } })),
        addLink: () =>
          edit((c) => ({
            ...c,
            personalInfo: {
              ...c.personalInfo,
              links: [...c.personalInfo.links, { id: uid(), type: "linkedin", url: "" }],
            },
          })),
        updateLink: (id, patch) =>
          edit((c) => ({
            ...c,
            personalInfo: {
              ...c.personalInfo,
              links: c.personalInfo.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
            },
          })),
        removeLink: (id) =>
          edit((c) => ({
            ...c,
            personalInfo: { ...c.personalInfo, links: c.personalInfo.links.filter((l) => l.id !== id) },
          })),

        setSummary: (s) => edit((c) => ({ ...c, summary: s })),
        setProfileType: (t) => edit((c) => ({ ...c, profileType: t })),

        addExperience: (exp) =>
          addRow("experience", {
            id: uid(),
            jobTitle: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            responsibilities: "",
            ...exp,
          }),
        updateExperience: (id, patch) => updateRow("experience", id, patch),
        removeExperience: (id) => removeRow("experience", id),
        duplicateExperience: (id) =>
          edit((c) => {
            const orig = c.experience.find((e) => e.id === id);
            if (!orig) return c;
            return { ...c, experience: [...c.experience, { ...orig, id: uid(), current: false }] };
          }),

        addEducation: (edu) =>
          addRow("education", {
            id: uid(),
            degree: "",
            fieldOfStudy: "",
            institution: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
            ...edu,
          }),
        updateEducation: (id, patch) => updateRow("education", id, patch),
        removeEducation: (id) => removeRow("education", id),

        addProject: (p) =>
          addRow("projects", { id: uid(), name: "", description: "", technologies: "", link: "", ...p }),
        updateProject: (id, patch) => updateRow("projects", id, patch),
        removeProject: (id) => removeRow("projects", id),

        addSkill: (name) =>
          edit((c) => {
            const trimmed = name.trim();
            if (!trimmed) return c;
            if (c.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return c;
            return { ...c, skills: [...c.skills, { id: uid(), name: trimmed }] };
          }),
        removeSkill: (id) => removeRow("skills", id),
        setSkills: (skills) => edit((c) => ({ ...c, skills })),

        addCertification: (cert) =>
          addRow("certifications", { id: uid(), name: "", issuer: "", date: "", ...cert }),
        updateCertification: (id, patch) => updateRow("certifications", id, patch),
        removeCertification: (id) => removeRow("certifications", id),

        addLanguage: (l) => addRow("languages", { id: uid(), name: "", level: "", ...l }),
        updateLanguage: (id, patch) => updateRow("languages", id, patch),
        removeLanguage: (id) => removeRow("languages", id),

        addAward: (a) => addRow("awards", { id: uid(), title: "", issuer: "", date: "", ...a }),
        updateAward: (id, patch) => updateRow("awards", id, patch),
        removeAward: (id) => removeRow("awards", id),

        addVolunteer: (v) =>
          addRow("volunteer", {
            id: uid(),
            role: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            ...v,
          }),
        updateVolunteer: (id, patch) => updateRow("volunteer", id, patch),
        removeVolunteer: (id) => removeRow("volunteer", id),

        addPublication: (p) => addRow("publications", { id: uid(), title: "", publisher: "", date: "", ...p }),
        updatePublication: (id, patch) => updateRow("publications", id, patch),
        removePublication: (id) => removeRow("publications", id),

        addInterest: (name) =>
          edit((c) => {
            const trimmed = name.trim();
            if (!trimmed) return c;
            if (c.interests.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return c;
            return { ...c, interests: [...c.interests, { id: uid(), name: trimmed }] };
          }),
        removeInterest: (id) => removeRow("interests", id),
      };
    },
    {
      name: "nirvash-cv-store",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ docs: s.docs, current: s.current }),
      version: 1,
      // v0 documents predate working typography and may miss newer fields.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<Pick<CVStoreState, "docs" | "current">>;
        const legacyDesign = version < 1;
        return {
          docs: Array.isArray(state.docs) ? state.docs.map((d) => normalizeCV(d, { legacyDesign })) : [],
          current: state.current ? normalizeCV(state.current, { legacyDesign }) : null,
        };
      },
    }
  )
);

/**
 * Copy the CV being edited into the saved list (called by autosave).
 * Returns false when the browser refused to store it.
 */
/** True when nothing has been typed into the CV yet. */
export function isBlankCV(c: CVDocument): boolean {
  const p = c.personalInfo;
  if ([p.fullName, p.professionalTitle, p.email, p.phone, p.location, c.summary].some((v) => v?.trim())) return false;
  if (p.photo || p.links.some((l) => l.url.trim())) return false;
  const lists = [
    c.experience, c.education, c.skills, c.projects, c.certifications,
    c.languages, c.awards, c.volunteer, c.publications, c.interests,
  ] as unknown[][];
  return lists.every((l) => l.length === 0);
}

export function persistCurrent(): boolean {
  const { current, docs } = useCVStore.getState();
  if (!current) return true;
  const exists = docs.some((d) => d.id === current.id);
  // An untouched new CV is not worth a slot in "Your CVs".
  if (!exists && isBlankCV(current)) return true;
  const next = exists
    ? docs.map((d) => (d.id === current.id ? current : d))
    : [...docs, current];
  useCVStore.setState({ docs: next });
  return !lastWriteFailed;
}

export { DEFAULT_SECTION_ORDER };
