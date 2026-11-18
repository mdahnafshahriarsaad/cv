"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X, Upload, ZoomIn, ZoomOut, RefreshCw, Trash2, Check, ImageIcon, Loader2 } from "lucide-react";
import { BrandButton } from "@/components/shared/brand-button";
import type { ProfilePhoto } from "@/lib/cv-data/types";
import { downscaleImage, photoImageStyle } from "@/lib/cv-data/photo";
import { useCVStore } from "@/lib/store/cv-store";
import { getTemplate, type PhotoShape } from "@/components/templates/registry";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function shapeClass(shape: PhotoShape): string {
  if (shape === "circle" || shape === "none") return "rounded-full";
  if (shape === "rounded") return "rounded-[18%]";
  return "rounded-[3px]";
}

/** The photo exactly as the CV draws it: same crop maths, same frame shape. */
export function PhotoThumb({
  photo,
  shape,
  className,
  alt = "",
}: {
  photo: ProfilePhoto | null | undefined;
  shape: PhotoShape;
  className?: string;
  alt?: string;
}) {
  return (
    <span
      className={cn(
        "relative block overflow-hidden bg-white/[0.04] border border-white/12 shrink-0",
        shape === "portrait" ? "aspect-[4/5]" : "aspect-square",
        shapeClass(shape),
        className
      )}
    >
      {photo?.dataUrl ? (
        <img src={photo.dataUrl} alt={alt} draggable={false} className="absolute inset-0 size-full" style={photoImageStyle(photo)} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="size-[38%] max-w-5 text-white/30" />
        </span>
      )}
    </span>
  );
}

export function PhotoUploadModal({ onClose }: { onClose: () => void }) {
  const setPhoto = useCVStore((s) => s.setPhoto);
  const removePhoto = useCVStore((s) => s.removePhoto);
  const currentPhoto = useCVStore((s) => s.current?.personalInfo.photo ?? null);
  const templateId = useCVStore((s) => s.current?.design.templateId ?? "");
  const template = getTemplate(templateId);
  const shape: PhotoShape = template.photoShape === "none" ? "circle" : template.photoShape;

  const [imgSrc, setImgSrc] = React.useState<string | null>(currentPhoto?.dataUrl ?? null);
  const [zoom, setZoom] = React.useState(currentPhoto?.zoom ?? 1);
  const [offsetX, setOffsetX] = React.useState(currentPhoto?.offsetX ?? 0);
  const [offsetY, setOffsetY] = React.useState(currentPhoto?.offsetY ?? 0);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dropping, setDropping] = React.useState(false);
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("That image is larger than 15 MB. Choose a smaller one.");
      return;
    }
    setBusy(true);
    try {
      // Stored copies are capped at 720px so autosave stays within browser storage limits.
      const src = await downscaleImage(file);
      setImgSrc(src);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file could not be read as an image.");
    } finally {
      setBusy(false);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!imgSrc) return;
    drag.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const start = drag.current;
    const frame = frameRef.current;
    if (!start || !frame) return;
    const rect = frame.getBoundingClientRect();
    setOffsetX(clamp(start.ox + ((e.clientX - start.x) / rect.width) * 100, -50, 50));
    setOffsetY(clamp(start.oy + ((e.clientY - start.y) / rect.height) * 100, -50, 50));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const onKeyNudge = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 3;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setOffsetX((v) => clamp(v + m[0], -50, 50));
    setOffsetY((v) => clamp(v + m[1], -50, 50));
  };

  const save = () => {
    if (!imgSrc) return;
    setPhoto({ dataUrl: imgSrc, zoom, offsetX, offsetY });
    onClose();
  };

  const remove = () => {
    removePhoto();
    onClose();
  };

  const draft: ProfilePhoto | null = imgSrc ? { dataUrl: imgSrc, zoom, offsetX, offsetY } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] bg-[#212121]/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-dialog-title"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-white/10 bg-[#1f1f1f] p-6 text-white"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 id="photo-dialog-title" className="text-lg font-bold tracking-tight">Profile photo</h3>
            <p className="text-[12px] text-white/45 mt-0.5">
              {template.photoShape === "none"
                ? `${template.name} does not show a photo, but it is kept for other templates.`
                : `Shown as ${shape === "portrait" ? "a portrait" : `a ${shape}`} in ${template.name}.`}
            </p>
          </div>
          <button onClick={onClose} className="size-8 rounded-[8px] hover:bg-white/10 flex items-center justify-center text-white/60" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {!draft ? (
          <button
            type="button"
            onDrop={(e) => {
              e.preventDefault();
              setDropping(false);
              void onFile(e.dataTransfer.files?.[0]);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className={cn(
              "w-full rounded-[12px] border-2 border-dashed bg-white/[0.02] py-12 px-6 text-center transition-colors",
              dropping ? "border-nirvash-red/60 bg-nirvash-red/5" : "border-white/15 hover:border-nirvash-red/40"
            )}
          >
            <span className="mx-auto size-12 rounded-full bg-nirvash-red/10 border border-nirvash-red/25 flex items-center justify-center mb-4">
              {busy ? <Loader2 className="size-5 text-nirvash-red animate-spin" /> : <Upload className="size-5 text-nirvash-red" />}
            </span>
            <span className="block text-[14px] font-semibold text-white">{busy ? "Preparing photo…" : "Upload a photo"}</span>
            <span className="block text-[12px] text-white/45 mt-1">JPG, PNG or WebP · drag it here or click to browse</span>
          </button>
        ) : (
          <>
            <div className="flex justify-center mb-3">
              <div
                ref={frameRef}
                role="slider"
                tabIndex={0}
                aria-label="Photo position. Drag, or use the arrow keys."
                aria-valuemin={-50}
                aria-valuemax={50}
                aria-valuenow={Math.round(offsetX)}
                aria-valuetext={`${Math.round(offsetX)}% horizontal, ${Math.round(offsetY)}% vertical`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={onKeyNudge}
                className={cn(
                  "relative cursor-move touch-none select-none outline-none ring-2 ring-white/10 focus-visible:ring-nirvash-red/60 overflow-hidden",
                  shapeClass(shape),
                  shape === "portrait" ? "w-40" : "w-44"
                )}
              >
                <PhotoThumb photo={draft} shape={shape} className="w-full border-0 pointer-events-none" alt="Crop preview" />
                {busy && (
                  <span className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-white" />
                  </span>
                )}
              </div>
            </div>

            <p className="text-center text-[11px] text-white/40 mb-4">Drag or use arrow keys to reposition · zoom to fill the frame</p>

            <div className="flex items-center gap-2 mb-5">
              <button onClick={() => setZoom((z) => clamp(Math.round((z - 0.1) * 100) / 100, 1, 3))} className="size-9 rounded-[8px] border border-white/12 hover:bg-white/10 flex items-center justify-center text-white/70" aria-label="Zoom out">
                <ZoomOut className="size-4" />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-nirvash-red"
                aria-label="Zoom"
              />
              <button onClick={() => setZoom((z) => clamp(Math.round((z + 0.1) * 100) / 100, 1, 3))} className="size-9 rounded-[8px] border border-white/12 hover:bg-white/10 flex items-center justify-center text-white/70" aria-label="Zoom in">
                <ZoomIn className="size-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <BrandButton variant="secondary" size="md" className="flex-1" onClick={() => fileRef.current?.click()} disabled={busy}>
                <RefreshCw className="size-4" /> Replace
              </BrandButton>
              {currentPhoto && (
                <BrandButton variant="danger" size="md" onClick={remove} aria-label="Remove photo" title="Remove photo">
                  <Trash2 className="size-4" />
                </BrandButton>
              )}
              <BrandButton variant="primary" size="md" className="flex-1" onClick={save} disabled={busy}>
                <Check className="size-4" /> Save
              </BrandButton>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-[8px] border border-nirvash-red/30 bg-nirvash-red/10 px-3 py-2 text-[12px] text-white/85">
            {error}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Compact photo control used inside the personal info form */
export function PhotoControl({ onOpen }: { onOpen: () => void }) {
  const photo = useCVStore((s) => s.current?.personalInfo.photo ?? null);
  const templateId = useCVStore((s) => s.current?.design.templateId ?? "");
  const template = getTemplate(templateId);
  const shape: PhotoShape = template.photoShape === "none" ? "circle" : template.photoShape;
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onOpen}
        className="rounded-full hover:opacity-90 transition-opacity"
        aria-label={photo ? "Edit photo" : "Upload photo"}
      >
        <PhotoThumb photo={photo} shape={shape} className="w-16 hover:border-nirvash-red/40 transition-colors" alt="Profile" />
      </button>
      <div>
        <button type="button" onClick={onOpen} className="text-[13px] font-medium text-nirvash-red hover:text-white transition-colors">
          {photo ? "Edit photo" : "Upload photo"}
        </button>
        <p className="text-[11px] text-white/40 mt-0.5">Optional · resized for fast saving</p>
      </div>
    </div>
  );
}
