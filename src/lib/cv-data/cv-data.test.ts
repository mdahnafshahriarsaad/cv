import { describe, expect, test } from "bun:test";
import { createEmptyCV, createSampleCV, normalizeCV, DEFAULT_SECTION_ORDER, type CVDocument } from "./types";
import { pdfFileName, personalErrors, preflight } from "./checks";

const filled = (): CVDocument => {
  const cv = createEmptyCV();
  cv.personalInfo = { ...cv.personalInfo, fullName: "Nadia Islam", professionalTitle: "Data Analyst", email: "nadia@gmail.com" };
  cv.education = [{ id: "e1" } as CVDocument["education"][number]];
  return cv;
};

describe("normalizeCV", () => {
  test("fills missing lists and repairs section order", () => {
    const raw = { name: "Old", personalInfo: { fullName: "A" }, design: { sectionOrder: ["skills", "skills", "bogus"] } };
    const cv = normalizeCV(raw as unknown as CVDocument);
    expect(cv.experience).toEqual([]);
    expect(cv.personalInfo.links).toEqual([]);
    expect(cv.personalInfo.fullName).toBe("A");
    expect(cv.design.sectionOrder[0]).toBe("skills");
    expect([...cv.design.sectionOrder].sort()).toEqual([...DEFAULT_SECTION_ORDER].sort());
  });

  test("legacy documents drop the old brand-red accent and stored typography", () => {
    const raw = createEmptyCV();
    raw.design = { ...raw.design, accentColor: "#ff4336", typography: "serif" };
    expect(normalizeCV(raw, { legacyDesign: true }).design).toMatchObject({ accentColor: "", typography: "auto" });
    expect(normalizeCV(raw).design).toMatchObject({ accentColor: "#ff4336", typography: "serif" });
  });

  test("invalid density and margins fall back to defaults", () => {
    const raw = createEmptyCV();
    raw.design = { ...raw.design, density: "huge" as never, margins: "none" as never };
    expect(normalizeCV(raw).design).toMatchObject({ density: "balanced", margins: "standard" });
  });
});

test("createSampleCV is deterministic so server and client markup match", () => {
  expect(JSON.stringify(createSampleCV())).toBe(JSON.stringify(createSampleCV()));
});

describe("checks", () => {
  test("personalErrors requires a name and validates only a given email", () => {
    expect(personalErrors({ fullName: "", email: "" })).toHaveProperty("fullName");
    expect(personalErrors({ fullName: "Nadia", email: "" })).toEqual({});
    expect(personalErrors({ fullName: "Nadia", email: "nadia@" })).toHaveProperty("email");
  });

  test("preflight passes a complete CV and flags long or unreachable ones", () => {
    expect(preflight(filled(), 1)).toEqual([{ level: "ok", text: expect.any(String) }]);
    const cv = filled();
    cv.personalInfo.email = "";
    const texts = preflight(cv, 3).map((c) => c.text).join("\n");
    expect(texts).toContain("email or phone");
    expect(texts).toContain("3 pages");
  });

  test("pdfFileName strips characters file systems reject", () => {
    const cv = filled();
    cv.personalInfo.fullName = 'Nadia: "Islam"/QA';
    expect(pdfFileName(cv)).toBe("Nadia IslamQA - CV");
    cv.personalInfo.fullName = "";
    cv.name = "???";
    expect(pdfFileName(cv)).toBe("CV");
  });
});
