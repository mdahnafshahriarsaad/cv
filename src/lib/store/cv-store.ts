"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  Interest,
  ProfessionalLink,
  SectionKey,
  createEmptyCV,
  createSampleCV,
  uid,
  DEFAULT_SECTION_ORDER,
} from "@/lib/cv-data/types";

interface CVStoreState {
  /** the CV currently being edited */
  current: CVDocument | null;
  /** all saved CVs */
  docs: CVDocument[];
  saveStatus: "idle" | "saving" | "saved";
  setSaveStatus: (s: "idle" | "saving" | "saved") => void;

  // actions
  newCV: (name?: string) => string; // returns id
  loadCV: (id: string) => void;
  loadSample: () => string;
  deleteCV: (id: string) => void;
  renameCV: (name: string) => void;
  setTemplate: (templateId: string) => void;
  setDesign: (patch: Partial<DesignSettings>) => void;
  setSectionOrder: (order: SectionKey[]) => void;

  // personal info
  updatePersonal: (patch: Partial<CVDocument["personalInfo"]>) => void;
  setPhoto: (photo: CVDocument["personalInfo"]["photo"]) => void;
  removePhoto: () => void;
  addLink: () => void;
  updateLink: (id: string, patch: Partial<ProfessionalLink>) => void;
  removeLink: (id: string) => void;

  setSummary: (s: string) => void;
  setProfileType: (t: string) => void;

  // repeatable sections
  addExperience: (exp?: Partial<Experience>) => void;
  updateExperience: (id: string, patch: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  duplicateExperience: (id: string) => void;

  addEducation: (edu?: Partial<Education>) => void;
  updateEducation: (id: string, patch: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addProject: (p?: Partial<Project>) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;

  addSkill: (name: string) => void;
  removeSkill: (id: string) => void;
  setSkills: (skills: Skill[]) => void;

  addCertification: (c?: Partial<Certification>) => void;
  updateCertification: (id: string, patch: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  addLanguage: (l?: Partial<Language>) => void;
  updateLanguage: (id: string, patch: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  addAward: (a?: Partial<Award>) => void;
  updateAward: (id: string, patch: Partial<Award>) => void;
  removeAward: (id: string) => void;

  addVolunteer: (v?: Partial<VolunteerItem>) => void;
  updateVolunteer: (id: string, patch: Partial<VolunteerItem>) => void;
  removeVolunteer: (id: string) => void;

  addPublication: (p?: Partial<Publication>) => void;
  updatePublication: (id: string, patch: Partial<Publication>) => void;
  removePublication: (id: string) => void;

  addInterest: (name: string) => void;
  removeInterest: (id: string) => void;
}

function touch(doc: CVDocument): CVDocument {
  return { ...doc, updatedAt: Date.now() };
}

export const useCVStore = create<CVStoreState>()(
  persist(
    (set, get) => ({
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
        const doc = createSampleCV();
        set({ current: doc, saveStatus: "saved" });
        return doc.id;
      },

      deleteCV: (id) =>
        set((s) => ({ docs: s.docs.filter((d) => d.id !== id) })),

      renameCV: (name) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, name }) });
      },

      setTemplate: (templateId) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({ ...c, design: { ...c.design, templateId } }),
        });
      },

      setDesign: (patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({ ...c, design: { ...c.design, ...patch } }),
        });
      },

      setSectionOrder: (order) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({ ...c, design: { ...c.design, sectionOrder: order } }),
        });
      },

      updatePersonal: (patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({ ...c, personalInfo: { ...c.personalInfo, ...patch } }),
        });
      },

      setPhoto: (photo) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            personalInfo: { ...c.personalInfo, photo },
          }),
        });
      },
      removePhoto: () => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            personalInfo: { ...c.personalInfo, photo: null },
          }),
        });
      },
      addLink: () => {
        const c = get().current;
        if (!c) return;
        const link: ProfessionalLink = { id: uid(), type: "linkedin", url: "" };
        set({
          current: touch({
            ...c,
            personalInfo: { ...c.personalInfo, links: [...c.personalInfo.links, link] },
          }),
        });
      },
      updateLink: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            personalInfo: {
              ...c.personalInfo,
              links: c.personalInfo.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
            },
          }),
        });
      },
      removeLink: (id) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            personalInfo: {
              ...c.personalInfo,
              links: c.personalInfo.links.filter((l) => l.id !== id),
            },
          }),
        });
      },

      setSummary: (s) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, summary: s }) });
      },
      setProfileType: (t) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, profileType: t }) });
      },

      addExperience: (exp) => {
        const c = get().current;
        if (!c) return;
        const e: Experience = {
          id: uid(),
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          responsibilities: "",
          ...exp,
        };
        set({ current: touch({ ...c, experience: [...c.experience, e] }) });
      },
      updateExperience: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            experience: c.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removeExperience: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, experience: c.experience.filter((e) => e.id !== id) }) });
      },
      duplicateExperience: (id) => {
        const c = get().current;
        if (!c) return;
        const orig = c.experience.find((e) => e.id === id);
        if (!orig) return;
        set({
          current: touch({
            ...c,
            experience: [...c.experience, { ...orig, id: uid(), current: false }],
          }),
        });
      },

      addEducation: (edu) => {
        const c = get().current;
        if (!c) return;
        const e: Education = {
          id: uid(),
          degree: "",
          fieldOfStudy: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          ...edu,
        };
        set({ current: touch({ ...c, education: [...c.education, e] }) });
      },
      updateEducation: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            education: c.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removeEducation: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, education: c.education.filter((e) => e.id !== id) }) });
      },

      addProject: (p) => {
        const c = get().current;
        if (!c) return;
        const e: Project = {
          id: uid(),
          name: "",
          description: "",
          technologies: "",
          link: "",
          ...p,
        };
        set({ current: touch({ ...c, projects: [...c.projects, e] }) });
      },
      updateProject: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            projects: c.projects.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removeProject: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, projects: c.projects.filter((e) => e.id !== id) }) });
      },

      addSkill: (name) => {
        const c = get().current;
        if (!c) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        if (c.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
        set({ current: touch({ ...c, skills: [...c.skills, { id: uid(), name: trimmed }] }) });
      },
      removeSkill: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, skills: c.skills.filter((s) => s.id !== id) }) });
      },
      setSkills: (skills) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, skills }) });
      },

      addCertification: (c2) => {
        const c = get().current;
        if (!c) return;
        const e: Certification = { id: uid(), name: "", issuer: "", date: "", ...c2 };
        set({ current: touch({ ...c, certifications: [...c.certifications, e] }) });
      },
      updateCertification: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            certifications: c.certifications.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removeCertification: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, certifications: c.certifications.filter((e) => e.id !== id) }) });
      },

      addLanguage: (l) => {
        const c = get().current;
        if (!c) return;
        const e: Language = { id: uid(), name: "", level: "", ...l };
        set({ current: touch({ ...c, languages: [...c.languages, e] }) });
      },
      updateLanguage: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            languages: c.languages.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removeLanguage: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, languages: c.languages.filter((e) => e.id !== id) }) });
      },

      addAward: (a) => {
        const c = get().current;
        if (!c) return;
        const e: Award = { id: uid(), title: "", issuer: "", date: "", ...a };
        set({ current: touch({ ...c, awards: [...c.awards, e] }) });
      },
      updateAward: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            awards: c.awards.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removeAward: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, awards: c.awards.filter((e) => e.id !== id) }) });
      },

      addVolunteer: (v) => {
        const c = get().current;
        if (!c) return;
        const e: VolunteerItem = {
          id: uid(),
          role: "",
          organization: "",
          startDate: "",
          endDate: "",
          description: "",
          ...v,
        };
        set({ current: touch({ ...c, volunteer: [...c.volunteer, e] }) });
      },
      updateVolunteer: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            volunteer: c.volunteer.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removeVolunteer: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, volunteer: c.volunteer.filter((e) => e.id !== id) }) });
      },

      addPublication: (p) => {
        const c = get().current;
        if (!c) return;
        const e: Publication = { id: uid(), title: "", publisher: "", date: "", ...p };
        set({ current: touch({ ...c, publications: [...c.publications, e] }) });
      },
      updatePublication: (id, patch) => {
        const c = get().current;
        if (!c) return;
        set({
          current: touch({
            ...c,
            publications: c.publications.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        });
      },
      removePublication: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, publications: c.publications.filter((e) => e.id !== id) }) });
      },

      addInterest: (name) => {
        const c = get().current;
        if (!c) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        if (c.interests.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
        set({ current: touch({ ...c, interests: [...c.interests, { id: uid(), name: trimmed }] }) });
      },
      removeInterest: (id) => {
        const c = get().current;
        if (!c) return;
        set({ current: touch({ ...c, interests: c.interests.filter((e) => e.id !== id) }) });
      },
    }),
    {
      name: "nirvash-cv-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ docs: s.docs, current: s.current }),
    }
  )
);

// Helper to persist the current doc into docs list (called on autosave)
export function persistCurrent() {
  const { current, docs } = useCVStore.getState();
  if (!current) return;
  const exists = docs.some((d) => d.id === current.id);
  const next = exists
    ? docs.map((d) => (d.id === current.id ? current : d))
    : [...docs, current];
  useCVStore.setState({ docs: next });
}

export { DEFAULT_SECTION_ORDER };
