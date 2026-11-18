"use client";

// The twelve page layouts. Each one renders a single page: either the whole
// document (measuring sheet, thumbnails) or just the units assigned to it.
// Every column of content is a <Flow>; continuation pages always start a
// column at the page margin, which is what the paginator assumes.

import * as React from "react";
import type { SectionKey } from "@/lib/cv-data/types";
import type { Archetype } from "@/components/templates/registry";
import { PAGE_H } from "@/components/templates/cv-theme";
import {
  Flow,
  HeaderCentered,
  HeaderHero,
  HeaderLeft,
  HeaderName,
  HeaderPhotoRight,
  HeaderSplit,
  LeadSummary,
  Masthead,
  Narrow,
  Sections,
  SidebarProfile,
  sectionHasContent,
  useRender,
} from "@/components/templates/cv-blocks";

/** Sections that live in the narrow column of two-column layouts. */
const SIDE_SECTIONS: Partial<Record<Archetype, SectionKey[]>> = {
  "header-band-twocol": ["skills", "education", "certifications", "languages", "awards", "interests"],
  "split-horizontal": ["skills", "education", "certifications", "languages", "awards", "interests"],
  "bold-accent": ["skills", "education", "certifications", "languages", "interests"],
  "dense-compact": ["skills", "education", "certifications", "languages", "awards", "interests"],
  "grid-blocks": ["skills", "languages", "certifications", "interests"],
  "left-sidebar": ["skills", "languages", "certifications", "interests"],
  "right-sidebar": ["skills", "languages", "certifications", "interests"],
};

/** Layouts that print the summary inside the header instead of as a section. */
const SUMMARY_IN_HEADER: Archetype[] = ["split-horizontal", "editorial"];

/** Where a section is placed by a layout; used by the editor to explain the order. */
export function sectionPlacement(archetype: Archetype, key: SectionKey): "main" | "side" | "header" {
  if (key === "summary" && SUMMARY_IN_HEADER.includes(archetype)) return "header";
  return SIDE_SECTIONS[archetype]?.includes(key) ? "side" : "main";
}

export function sideColumnLabel(archetype: Archetype): string | null {
  if (!SIDE_SECTIONS[archetype]) return null;
  if (archetype === "left-sidebar") return "Left column";
  return "Right column";
}

const SIDEBAR_W = 250;
const PANEL_PAD = 16;

/**
 * The user's section order, limited to sections that have content, split into
 * the main and side columns. `two` is false when one of the columns would be
 * empty, so a sparse CV never shows a blank column.
 */
function useColumns(keepSideWhenEmpty = false): { main: SectionKey[]; side: SectionKey[]; two: boolean } {
  const { cv, theme } = useRender();
  const archetype = theme.def.archetype;
  return React.useMemo(() => {
    const order = cv.design.sectionOrder.filter(
      (k) => k !== "personal" && sectionHasContent(cv, k) && !(k === "summary" && SUMMARY_IN_HEADER.includes(archetype))
    );
    const sideKeys = SIDE_SECTIONS[archetype] ?? [];
    const main = order.filter((k) => !sideKeys.includes(k));
    const side = order.filter((k) => sideKeys.includes(k));
    if (keepSideWhenEmpty) return { main, side, two: true };
    if (side.length === 0) return { main, side, two: false };
    if (main.length === 0) return { main: side, side: [], two: false };
    return { main, side, two: true };
  }, [cv, archetype, keepSideWhenEmpty]);
}

const firstPagePad = (first: boolean): React.CSSProperties | undefined =>
  first ? { paddingTop: "var(--cv-gap-header)" } : undefined;

/* ---------- single column ---------- */

function CenteredSingle() {
  const { main } = useColumns();
  return (
    <div className="cv-frame">
      <div className="cv-pad" style={{ paddingLeft: "calc(var(--cv-pad-x) + 14px)", paddingRight: "calc(var(--cv-pad-x) + 14px)" }}>
        <Flow id="main">
          <HeaderCentered />
          <Sections keys={main} />
        </Flow>
      </div>
    </div>
  );
}

function MinimalLines() {
  const { main } = useColumns();
  return (
    <div className="cv-frame" data-divider="">
      <div className="cv-pad">
        <Flow id="main">
          <HeaderLeft photoSize={72} />
          <Sections keys={main} />
        </Flow>
      </div>
    </div>
  );
}

function Timeline() {
  const { main } = useColumns();
  return (
    <div className="cv-frame">
      <div className="cv-pad">
        <Flow id="main">
          <HeaderLeft rule photoSize={80} />
          <Sections keys={main} />
        </Flow>
      </div>
    </div>
  );
}

function Editorial() {
  const { main } = useColumns();
  return (
    <div className="cv-frame" data-gutter="">
      <div className="cv-pad">
        <Flow id="main">
          <Masthead />
          <LeadSummary />
          <Sections keys={main} />
        </Flow>
      </div>
    </div>
  );
}

function TopPhoto() {
  const { first, any, theme } = useRender();
  const { main } = useColumns();
  const size = theme.def.photoShape === "portrait" ? 104 : 116;
  return (
    <div className="cv-frame">
      {any("header") && (
        <Flow id="head" className="cv-band cv-band--tint">
          <HeaderLeft photoSize={size} />
        </Flow>
      )}
      <div className="cv-pad" style={firstPagePad(first)}>
        <Flow id="main">
          <Sections keys={main} />
        </Flow>
      </div>
    </div>
  );
}

/* ---------- sidebar ---------- */

function Sidebar({ side: where }: { side: "left" | "right" }) {
  const { main, side } = useColumns(true);
  const aside = (
    <aside className="cv-surface cv-sidebar" style={{ padding: "var(--cv-pad-y) 26px" }}>
      <Narrow>
        <Flow id="side">
          <SidebarProfile />
          <Sections keys={side} />
        </Flow>
      </Narrow>
    </aside>
  );
  const body = (
    <div
      style={{
        minWidth: 0,
        padding:
          where === "left"
            ? "var(--cv-pad-y) var(--cv-pad-x) var(--cv-pad-y) 34px"
            : "var(--cv-pad-y) 34px var(--cv-pad-y) var(--cv-pad-x)",
      }}
    >
      <Flow id="main">
        <HeaderName />
        <Sections keys={main} />
      </Flow>
    </div>
  );
  return (
    <div
      className="cv-frame"
      style={{
        display: "grid",
        gridTemplateColumns: where === "left" ? `${SIDEBAR_W}px minmax(0, 1fr)` : `minmax(0, 1fr) ${SIDEBAR_W}px`,
      }}
    >
      {where === "left" ? (
        <>
          {aside}
          {body}
        </>
      ) : (
        <>
          {body}
          {aside}
        </>
      )}
    </div>
  );
}

/* ---------- header + two columns ---------- */

function Columns({
  sideWidth,
  divided = false,
  panel = false,
  className,
  style,
}: {
  sideWidth: number;
  divided?: boolean;
  /** put the side column in a tinted panel */
  panel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { any, theme } = useRender();
  const { main, side, two } = useColumns();
  const sideOnPage = side.some((k) => any(k));
  return (
    <div
      className={["cv-cols", divided && two ? "cv-cols--divided" : "", className ?? ""].join(" ")}
      style={{ gridTemplateColumns: two ? `minmax(0, 1fr) ${sideWidth}px` : "minmax(0, 1fr)", ...style }}
    >
      <Flow id="main">
        <Sections keys={main} />
      </Flow>
      {two && !panel && (
        <Narrow>
          <Flow id="side">
            <Sections keys={side} />
          </Flow>
        </Narrow>
      )}
      {two && panel && (
        sideOnPage ? (
          <div className="cv-panel" style={{ padding: PANEL_PAD }}>
            <Narrow>
              <Flow id="side" contTop={theme.padY + PANEL_PAD} limit={PAGE_H - theme.padY - PANEL_PAD}>
                <Sections keys={side} />
              </Flow>
            </Narrow>
          </div>
        ) : (
          <div />
        )
      )}
    </div>
  );
}

function BandTwoCol() {
  const { first, any } = useRender();
  return (
    <div className="cv-frame">
      {any("header") && (
        <Flow id="head" className="cv-surface cv-band">
          <HeaderPhotoRight />
        </Flow>
      )}
      <Columns sideWidth={236} divided className="cv-pad" style={firstPagePad(first)} />
    </div>
  );
}

function SplitHorizontal() {
  const { first, any } = useRender();
  return (
    <div className="cv-frame">
      {any("header") && (
        <Flow id="head" className="cv-surface cv-band" style={{ paddingTop: "var(--cv-pad-y)", paddingBottom: "calc(var(--cv-pad-y) * 0.8)" }}>
          <HeaderHero />
        </Flow>
      )}
      <Columns sideWidth={232} className="cv-pad" style={firstPagePad(first)} />
    </div>
  );
}

/** Header and columns stacked inside the page margins. */
function Stacked({ header, columns, stripe = false }: { header: React.ReactNode; columns: React.ReactNode; stripe?: boolean }) {
  const { any } = useRender();
  return (
    <div className="cv-frame">
      {stripe && <div className="cv-stripe" />}
      <div
        className="cv-pad"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--cv-gap-header)",
          paddingLeft: stripe ? "calc(var(--cv-pad-x) + 11px)" : undefined,
        }}
      >
        {any("header") && <Flow id="head">{header}</Flow>}
        {columns}
      </div>
    </div>
  );
}

function BoldAccent() {
  return <Stacked stripe header={<HeaderPhotoRight big photoSize={96} />} columns={<Columns sideWidth={220} />} />;
}

function DenseCompact() {
  return <Stacked header={<HeaderSplit rule />} columns={<Columns sideWidth={222} divided />} />;
}

function GridBlocks() {
  return <Stacked header={<HeaderSplit rule />} columns={<Columns sideWidth={250} panel />} />;
}

/* ---------- router ---------- */

export function TemplateLayout() {
  const { theme } = useRender();
  switch (theme.def.archetype) {
    case "centered-single":
      return <CenteredSingle />;
    case "minimal-lines":
      return <MinimalLines />;
    case "timeline":
      return <Timeline />;
    case "editorial":
      return <Editorial />;
    case "top-photo":
      return <TopPhoto />;
    case "left-sidebar":
      return <Sidebar side="left" />;
    case "right-sidebar":
      return <Sidebar side="right" />;
    case "split-horizontal":
      return <SplitHorizontal />;
    case "bold-accent":
      return <BoldAccent />;
    case "dense-compact":
      return <DenseCompact />;
    case "grid-blocks":
      return <GridBlocks />;
    case "header-band-twocol":
    default:
      return <BandTwoCol />;
  }
}
