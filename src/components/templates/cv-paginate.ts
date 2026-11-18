// Page-break calculation for the CV renderer.
//
// The renderer lays the whole document out once in a hidden "measuring sheet"
// and reports every unbreakable unit (a header, an entry heading, one bullet…)
// with its natural top/bottom. This module decides which page each unit goes
// on. It is deliberately free of DOM and React so it can be reasoned about.

export interface UnitBox {
  /** stable unit id, e.g. "experience/ab12/b3" */
  key: string;
  /** column the unit flows in, e.g. "main" or "side" */
  flow: string;
  /** natural position inside the measuring sheet, px from the sheet top */
  top: number;
  bottom: number;
}

export interface FlowSpec {
  /** y where a column's content starts on continuation pages */
  contTop: number;
  /** y that content must not pass on any page */
  limit: number;
}

export interface Pagination {
  pageCount: number;
  pageOf: Record<string, number>;
  /** Height (px) of the tallest column's content on the last page; 0 for a single page. */
  lastFill: number;
}

const EPSILON = 0.75;

/**
 * Greedy fill, one column at a time. On the first page a column keeps its
 * natural position (it may sit under a header); on later pages it restarts at
 * `contTop`. A unit that does not fit moves to the next page whole. A unit
 * taller than a page stays where it is rather than looping forever.
 */
export function paginate(
  units: UnitBox[],
  flows: Record<string, FlowSpec>,
  reserve = 0
): Pagination {
  const pageOf: Record<string, number> = {};
  let pageCount = 1;
  const ends: { page: number; fill: number }[] = [];

  const byFlow = new Map<string, UnitBox[]>();
  for (const u of units) {
    const list = byFlow.get(u.flow);
    if (list) list.push(u);
    else byFlow.set(u.flow, [u]);
  }

  for (const [flow, list] of byFlow) {
    const spec = flows[flow];
    if (!spec) {
      for (const u of list) pageOf[u.key] = 0;
      continue;
    }
    const limit = spec.limit - reserve;
    let page = 0;
    let origin = 0; // natural y that maps to `offset` on the current page
    let offset = 0;
    let placed = 0;
    let fill = 0;
    for (const u of list) {
      let bottomOnPage = offset + (u.bottom - origin);
      if (placed > 0 && bottomOnPage > limit + EPSILON) {
        page += 1;
        origin = u.top;
        offset = spec.contTop;
        placed = 0;
        fill = 0;
        bottomOnPage = offset + (u.bottom - origin);
      }
      pageOf[u.key] = page;
      placed += 1;
      fill = Math.max(fill, bottomOnPage - offset);
    }
    if (page > 0) ends.push({ page, fill });
    pageCount = Math.max(pageCount, page + 1);
  }

  let lastFill = 0;
  for (const e of ends) if (e.page === pageCount - 1) lastFill = Math.max(lastFill, e.fill);

  return { pageCount, pageOf, lastFill };
}

export function samePagination(a: Pagination | null, b: Pagination | null): boolean {
  if (a === b) return true;
  if (!a || !b || a.pageCount !== b.pageCount) return false;
  const ka = Object.keys(a.pageOf);
  if (ka.length !== Object.keys(b.pageOf).length) return false;
  for (const k of ka) if (a.pageOf[k] !== b.pageOf[k]) return false;
  return true;
}

/**
 * Lookup tables for one page: which units are on it, and which key prefixes
 * have at least one unit on it (so containers know whether to render at all).
 */
export function pageIndex(pagination: Pagination, page: number): { units: Set<string>; prefixes: Set<string> } {
  const units = new Set<string>();
  const prefixes = new Set<string>();
  for (const key in pagination.pageOf) {
    if (pagination.pageOf[key] !== page) continue;
    units.add(key);
    let end = key.length;
    while (end > 0) {
      prefixes.add(key.slice(0, end));
      end = key.lastIndexOf("/", end - 1);
    }
  }
  return { units, prefixes };
}
