"use client";

import * as React from "react";
import { Field, DarkInput, DarkTextarea, MonthInput } from "@/components/shared/form-primitives";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { Plus, Trash2, ChevronRight, Award, Languages, Trophy, HeartHandshake, BookOpen, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionKey = "certifications" | "languages" | "awards" | "volunteer" | "publications" | "interests";

const SECTIONS: { key: SectionKey; label: string; icon: any; desc: string }[] = [
  { key: "certifications", label: "Certifications", icon: Award, desc: "Professional certificates and licenses" },
  { key: "languages", label: "Languages", icon: Languages, desc: "Languages you speak" },
  { key: "awards", label: "Awards", icon: Trophy, desc: "Recognition and achievements" },
  { key: "volunteer", label: "Volunteer Experience", icon: HeartHandshake, desc: "Unpaid work and community service" },
  { key: "publications", label: "Publications", icon: BookOpen, desc: "Articles, papers, and books" },
  { key: "interests", label: "Interests", icon: Sparkle, desc: "Hobbies and passions" },
];

export function StepAdditional() {
  const cv = useCVStore((s) => s.current);
  const [open, setOpen] = React.useState<SectionKey | null>(null);
  if (!cv) return null;

  const count = (k: SectionKey) => {
    const arr = cv[k] as any[];
    return arr.length;
  };

  return (
    <div>
      <StepHeader
        title="Want to add anything else?"
        subtitle="These sections are optional. Tap any to add it — you can always skip."
      />

      <div className="divide-y divide-white/8 rounded-[12px] border border-white/10 bg-white/[0.02] overflow-hidden">
        {SECTIONS.map((s) => {
          const n = count(s.key);
          const isOpen = open === s.key;
          return (
            <div key={s.key}>
              <button
                onClick={() => setOpen(isOpen ? null : s.key)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="size-10 rounded-[10px] bg-nirvash-red/10 border border-nirvash-red/20 flex items-center justify-center shrink-0">
                  <s.icon className="size-5 text-nirvash-red" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-white">{s.label}</p>
                  <p className="text-[12px] text-white/45">{s.desc}</p>
                </div>
                {n > 0 ? (
                  <span className="text-[12px] font-medium text-nirvash-red bg-nirvash-red/10 border border-nirvash-red/25 rounded-full px-2.5 py-0.5">
                    {n} added
                  </span>
                ) : (
                  <span className="text-[12px] text-white/35">Add</span>
                )}
                <ChevronRight className={cn("size-4 text-white/40 transition-transform", isOpen && "rotate-90")} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-white/8 bg-black/15">
                  <SectionEditor section={s.key} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionEditor({ section }: { section: SectionKey }) {
  switch (section) {
    case "certifications":
      return <CertificationsEditor />;
    case "languages":
      return <LanguagesEditor />;
    case "awards":
      return <AwardsEditor />;
    case "volunteer":
      return <VolunteerEditor />;
    case "publications":
      return <PublicationsEditor />;
    case "interests":
      return <InterestsEditor />;
  }
}

export const ADDITIONAL_SECTIONS = SECTIONS;

export function SectionForm({ section }: { section: SectionKey }) {
  return <SectionEditor section={section} />;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 pt-4">{children}</div>;
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
    >
      <Plus className="size-3.5" /> {label}
    </button>
  );
}

function EntryShell({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-white/[0.02] p-4 space-y-3">
      {children}
      <div className="flex justify-end">
        <button
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/45 hover:text-nirvash-red transition-colors"
        >
          <Trash2 className="size-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}

function CertificationsEditor() {
  const cv = useCVStore((s) => s.current)!;
  const add = useCVStore((s) => s.addCertification);
  const update = useCVStore((s) => s.updateCertification);
  const remove = useCVStore((s) => s.removeCertification);
  return (
    <Row>
      {cv.certifications.map((c) => (
        <EntryShell key={c.id} onRemove={() => remove(c.id)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Certification Name"><DarkInput value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} placeholder="AWS Certified Developer" /></Field>
            <Field label="Issuer"><DarkInput value={c.issuer} onChange={(e) => update(c.id, { issuer: e.target.value })} placeholder="Amazon Web Services" /></Field>
          </div>
          <Field label="Date"><MonthInput value={c.date} onChange={(v) => update(c.id, { date: v })} /></Field>
        </EntryShell>
      ))}
      <AddButton onClick={() => add()} label="Add Certification" />
    </Row>
  );
}

function LanguagesEditor() {
  const cv = useCVStore((s) => s.current)!;
  const add = useCVStore((s) => s.addLanguage);
  const update = useCVStore((s) => s.updateLanguage);
  const remove = useCVStore((s) => s.removeLanguage);
  return (
    <Row>
      {cv.languages.map((l) => (
        <EntryShell key={l.id} onRemove={() => remove(l.id)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Language"><DarkInput value={l.name} onChange={(e) => update(l.id, { name: e.target.value })} placeholder="English" /></Field>
            <Field label="Proficiency">
              <select
                value={l.level}
                onChange={(e) => update(l.id, { level: e.target.value })}
                className="h-11 w-full rounded-[10px] bg-white/[0.04] border border-white/12 text-white px-3 [color-scheme:dark] focus-visible:border-nirvash-red outline-none"
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Professional">Professional</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
            </Field>
          </div>
        </EntryShell>
      ))}
      <AddButton onClick={() => add()} label="Add Language" />
    </Row>
  );
}

function AwardsEditor() {
  const cv = useCVStore((s) => s.current)!;
  const add = useCVStore((s) => s.addAward);
  const update = useCVStore((s) => s.updateAward);
  const remove = useCVStore((s) => s.removeAward);
  return (
    <Row>
      {cv.awards.map((a) => (
        <EntryShell key={a.id} onRemove={() => remove(a.id)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Award Title"><DarkInput value={a.title} onChange={(e) => update(a.id, { title: e.target.value })} placeholder="Employee of the Year" /></Field>
            <Field label="Issuer"><DarkInput value={a.issuer} onChange={(e) => update(a.id, { issuer: e.target.value })} placeholder="Company" /></Field>
          </div>
          <Field label="Date"><MonthInput value={a.date} onChange={(v) => update(a.id, { date: v })} /></Field>
        </EntryShell>
      ))}
      <AddButton onClick={() => add()} label="Add Award" />
    </Row>
  );
}

function VolunteerEditor() {
  const cv = useCVStore((s) => s.current)!;
  const add = useCVStore((s) => s.addVolunteer);
  const update = useCVStore((s) => s.updateVolunteer);
  const remove = useCVStore((s) => s.removeVolunteer);
  return (
    <Row>
      {cv.volunteer.map((v) => (
        <EntryShell key={v.id} onRemove={() => remove(v.id)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Role"><DarkInput value={v.role} onChange={(e) => update(v.id, { role: e.target.value })} placeholder="Volunteer Tutor" /></Field>
            <Field label="Organization"><DarkInput value={v.organization} onChange={(e) => update(v.id, { organization: e.target.value })} placeholder="Local Library" /></Field>
            <Field label="Start Date"><MonthInput value={v.startDate} onChange={(val) => update(v.id, { startDate: val })} /></Field>
            <Field label="End Date"><MonthInput value={v.endDate} onChange={(val) => update(v.id, { endDate: val })} /></Field>
          </div>
          <Field label="Description"><DarkTextarea value={v.description} onChange={(e) => update(v.id, { description: e.target.value })} className="min-h-[80px]" /></Field>
        </EntryShell>
      ))}
      <AddButton onClick={() => add()} label="Add Volunteer Experience" />
    </Row>
  );
}

function PublicationsEditor() {
  const cv = useCVStore((s) => s.current)!;
  const add = useCVStore((s) => s.addPublication);
  const update = useCVStore((s) => s.updatePublication);
  const remove = useCVStore((s) => s.removePublication);
  return (
    <Row>
      {cv.publications.map((p) => (
        <EntryShell key={p.id} onRemove={() => remove(p.id)}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title"><DarkInput value={p.title} onChange={(e) => update(p.id, { title: e.target.value })} placeholder="Article title" /></Field>
            <Field label="Publisher"><DarkInput value={p.publisher} onChange={(e) => update(p.id, { publisher: e.target.value })} placeholder="Publisher / Journal" /></Field>
          </div>
          <Field label="Date"><MonthInput value={p.date} onChange={(v) => update(p.id, { date: v })} /></Field>
        </EntryShell>
      ))}
      <AddButton onClick={() => add()} label="Add Publication" />
    </Row>
  );
}

function InterestsEditor() {
  const cv = useCVStore((s) => s.current)!;
  const add = useCVStore((s) => s.addInterest);
  const remove = useCVStore((s) => s.removeInterest);
  const [input, setInput] = React.useState("");
  return (
    <Row>
      <div className="relative">
        <DarkInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input.trim()) {
                add(input.trim());
                setInput("");
              }
            }
          }}
          placeholder="Type an interest and press Enter"
        />
        <button
          onClick={() => {
            if (input.trim()) {
              add(input.trim());
              setInput("");
            }
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-[8px] bg-nirvash-red text-white text-[13px] font-semibold hover:bg-nirvash-ruby transition-colors inline-flex items-center gap-1"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>
      {cv.interests.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {cv.interests.map((i) => (
            <span key={i.id} className="inline-flex items-center gap-1.5 rounded-full bg-nirvash-red/12 border border-nirvash-red/35 text-white text-[13px] font-medium px-3 py-1.5">
              {i.name}
              <button onClick={() => remove(i.id)} className="text-white/50 hover:text-white"><Trash2 className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </Row>
  );
}
