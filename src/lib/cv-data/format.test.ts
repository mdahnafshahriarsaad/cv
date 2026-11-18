import { describe, expect, test } from "bun:test";
import { dateRange, degreeTitle, displayUrl, formatMonth, isValidEmail, linkHref, splitLines, telHref } from "./format";

describe("formatMonth / dateRange", () => {
  test("formats month and year-only values", () => {
    expect(formatMonth("2024-03")).toBe("Mar 2024");
    expect(formatMonth("2024")).toBe("2024");
    expect(formatMonth("2024-13")).toBe("2024");
    expect(formatMonth("")).toBe("");
  });

  test("builds ranges with Present and missing ends", () => {
    expect(dateRange("2022-03", "2024-01")).toBe("Mar 2022 – Jan 2024");
    expect(dateRange("2022-03", "2024-01", true)).toBe("Mar 2022 – Present");
    expect(dateRange("2022", "")).toBe("2022");
    expect(dateRange("", "2020-06")).toBe("Jun 2020");
    expect(dateRange("", "")).toBe("");
  });
});

describe("text helpers", () => {
  test("splitLines drops blanks and typed bullet glyphs", () => {
    expect(splitLines("• Led team\n\n- Cut costs 12%\n3. Shipped app\r\nPlain")).toEqual([
      "Led team",
      "Cut costs 12%",
      "Shipped app",
      "Plain",
    ]);
  });

  test("urls are shortened for print and made absolute for links", () => {
    expect(displayUrl("https://www.github.com/nadia/")).toBe("github.com/nadia");
    expect(linkHref("github.com/nadia")).toBe("https://github.com/nadia");
    expect(linkHref("mailto:a@b.co")).toBe("mailto:a@b.co");
    expect(telHref("+880 1712-345 678")).toBe("tel:+8801712345678");
  });

  test("isValidEmail", () => {
    expect(isValidEmail(" nadia.islam@gmail.com ")).toBe(true);
    expect(isValidEmail("nadia@")).toBe(false);
    expect(isValidEmail("nadia@gmail.c")).toBe(false);
  });

  test("degreeTitle avoids repeating the field", () => {
    expect(degreeTitle({ degree: "B.Sc.", fieldOfStudy: "Computer Science" })).toBe("B.Sc., Computer Science");
    expect(degreeTitle({ degree: "B.Sc. in Computer Science", fieldOfStudy: "computer science" })).toBe(
      "B.Sc. in Computer Science"
    );
    expect(degreeTitle({ degree: "", fieldOfStudy: "Economics" })).toBe("Economics");
  });
});
