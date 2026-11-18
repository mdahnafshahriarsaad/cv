import { describe, expect, test } from "bun:test";
import { paginate, type UnitBox } from "./cv-paginate";

const unit = (key: string, top: number, bottom: number, flow = "main"): UnitBox => ({ key, flow, top, bottom });
const flows = { main: { contTop: 40, limit: 1000 } };

describe("paginate", () => {
  test("keeps everything on one page when it fits", () => {
    const r = paginate([unit("a", 0, 400), unit("b", 400, 990)], flows);
    expect(r.pageCount).toBe(1);
    expect(r.pageOf).toEqual({ a: 0, b: 0 });
    expect(r.lastFill).toBe(0);
  });

  test("moves a unit that would cross the limit to the next page, restarting at contTop", () => {
    const r = paginate([unit("a", 0, 700), unit("b", 700, 1100), unit("c", 1100, 1300)], flows);
    expect(r.pageOf).toEqual({ a: 0, b: 1, c: 1 });
    expect(r.pageCount).toBe(2);
    // b and c occupy 700..1300 naturally, i.e. 600px on the continuation page
    expect(r.lastFill).toBe(600);
  });

  test("reserve shrinks the usable height", () => {
    const units = [unit("a", 0, 500), unit("b", 500, 950)];
    expect(paginate(units, flows).pageCount).toBe(1);
    expect(paginate(units, flows, 100).pageOf.b).toBe(1);
  });

  test("a unit taller than a page stays put instead of looping", () => {
    const r = paginate([unit("huge", 0, 2500), unit("next", 2500, 2600)], flows);
    expect(r.pageOf.huge).toBe(0);
    expect(r.pageOf.next).toBe(1);
    expect(r.pageCount).toBe(2);
  });

  test("columns paginate independently and page count follows the longest", () => {
    const r = paginate(
      [unit("m1", 0, 900), unit("m2", 900, 1500), unit("s1", 0, 300, "side")],
      { ...flows, side: { contTop: 40, limit: 1000 } }
    );
    expect(r.pageOf).toEqual({ m1: 0, m2: 1, s1: 0 });
    expect(r.pageCount).toBe(2);
  });

  test("units in an unknown flow stay on the first page", () => {
    expect(paginate([unit("x", 5000, 6000, "header")], flows).pageOf.x).toBe(0);
  });

  test("tolerates sub-pixel overflow", () => {
    expect(paginate([unit("a", 0, 600), unit("b", 600, 1000.5)], flows).pageCount).toBe(1);
  });
});
