"use client";

import { create } from "zustand";

export type AppView =
  | "landing"
  | "create-start"
  | "guided-builder"
  | "form-builder"
  | "templates"
  | "editor";

interface AppState {
  view: AppView;
  /** landing section to scroll to when returning home */
  builderMethod: "guided" | "form" | null;
  /** templates page origin: from review step or from editor change-template */
  templatesOrigin: "flow" | "editor-change";
  /** loading screen visibility */
  loading: boolean;
  setView: (v: AppView) => void;
  setBuilderMethod: (m: "guided" | "form") => void;
  setTemplatesOrigin: (o: "flow" | "editor-change") => void;
  showLoading: (ms?: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  view: "landing",
  builderMethod: null,
  templatesOrigin: "flow",
  loading: true,
  setView: (v) => set({ view: v }),
  setBuilderMethod: (m) => set({ builderMethod: m }),
  setTemplatesOrigin: (o) => set({ templatesOrigin: o }),
  showLoading: async (ms = 900) => {
    set({ loading: true });
    await new Promise((r) => setTimeout(r, ms));
    set({ loading: false });
  },
}));
