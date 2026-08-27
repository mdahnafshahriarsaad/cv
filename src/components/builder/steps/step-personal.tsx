"use client";

import * as React from "react";
import { Field, DarkInput, MonthInput } from "@/components/shared/form-primitives";
import { PhotoControl, PhotoUploadModal } from "@/components/shared/photo-upload";
import { useCVStore } from "@/lib/store/cv-store";
import { StepHeader } from "@/components/builder/guided-builder";
import { Plus, Trash2, ChevronDown, ChevronUp, Linkedin, Github, Globe, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepPersonal() {
  const cv = useCVStore((s) => s.current);
  const updatePersonal = useCVStore((s) => s.updatePersonal);
  const addLink = useCVStore((s) => s.addLink);
  const updateLink = useCVStore((s) => s.updateLink);
  const removeLink = useCVStore((s) => s.removeLink);
  const [showLinks, setShowLinks] = React.useState(false);
  const [showPhoto, setShowPhoto] = React.useState(false);

  if (!cv) return null;
  const p = cv.personalInfo;

  return (
    <div>
      <StepHeader
        title="Let's start with you."
        subtitle="This information will appear at the top of your CV."
      />

      {/* Photo */}
      <div className="mb-6">
        <PhotoControl onOpen={() => setShowPhoto(true)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" htmlFor="fullName" required className="sm:col-span-2">
          <DarkInput
            id="fullName"
            value={p.fullName}
            onChange={(e) => updatePersonal({ fullName: e.target.value })}
            placeholder="e.g. Alex Johnson"
          />
        </Field>
        <Field label="Professional Title" htmlFor="title" className="sm:col-span-2">
          <DarkInput
            id="title"
            value={p.professionalTitle}
            onChange={(e) => updatePersonal({ professionalTitle: e.target.value })}
            placeholder="e.g. Frontend Developer"
          />
        </Field>
        <Field label="Email Address" htmlFor="email" required>
          <DarkInput
            id="email"
            type="email"
            value={p.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            placeholder="you@email.com"
          />
        </Field>
        <Field label="Phone Number" htmlFor="phone">
          <DarkInput
            id="phone"
            value={p.phone}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </Field>
        <Field label="Location" htmlFor="location" className="sm:col-span-2">
          <DarkInput
            id="location"
            value={p.location}
            onChange={(e) => updatePersonal({ location: e.target.value })}
            placeholder="City, Country"
          />
        </Field>
      </div>

      {/* Optional links */}
      <div className="mt-8 border-t border-white/8 pt-6">
        <button
          onClick={() => setShowLinks((s) => !s)}
          className="flex items-center gap-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors"
        >
          {showLinks ? <ChevronUp className="size-4 text-nirvash-red" /> : <Plus className="size-4 text-nirvash-red" />}
          Add professional links
          <span className="text-white/30 text-[12px] font-normal">(optional)</span>
        </button>

        {showLinks && (
          <div className="mt-4 space-y-3">
            {p.links.length === 0 && (
              <p className="text-[13px] text-white/40">
                No links added yet. Add LinkedIn, portfolio, GitHub, or your website.
              </p>
            )}
            {p.links.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DarkInput
                    value={link.url}
                    onChange={(e) => updateLink(link.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="pl-10"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <LinkIcon type={link.type} />
                  </span>
                </div>
                <select
                  value={link.type}
                  onChange={(e) => updateLink(link.id, { type: e.target.value as any })}
                  className="h-11 rounded-[10px] bg-white/[0.04] border border-white/12 text-white text-[13px] px-2 [color-scheme:dark] focus-visible:border-nirvash-red outline-none"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="website">Website</option>
                </select>
                <button
                  onClick={() => removeLink(link.id)}
                  className="size-11 rounded-[10px] border border-white/12 text-white/40 hover:text-nirvash-red hover:border-nirvash-red/40 transition-colors flex items-center justify-center shrink-0"
                  aria-label="Remove link"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addLink}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-nirvash-red hover:text-white transition-colors"
            >
              <Plus className="size-3.5" /> Add another link
            </button>
          </div>
        )}
      </div>

      {showPhoto && <PhotoUploadModal onClose={() => setShowPhoto(false)} />}
    </div>
  );
}

function LinkIcon({ type }: { type: string }) {
  if (type === "linkedin") return <Linkedin className="size-4" />;
  if (type === "github") return <Github className="size-4" />;
  if (type === "portfolio") return <FolderOpen className="size-4" />;
  return <Globe className="size-4" />;
}
