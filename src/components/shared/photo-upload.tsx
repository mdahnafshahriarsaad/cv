"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ZoomIn, ZoomOut, RefreshCw, Trash2, Check, ImageIcon } from "lucide-react";
import { BrandButton } from "@/components/shared/brand-button";
import { ProfilePhoto } from "@/lib/cv-data/types";
import { useCVStore } from "@/lib/store/cv-store";
import { cn } from "@/lib/utils";

export function PhotoUploadModal({ onClose }: { onClose: () => void }) {
  const setPhoto = useCVStore((s) => s.setPhoto);
  const removePhoto = useCVStore((s) => s.removePhoto);
  const currentPhoto = useCVStore((s) => s.current?.personalInfo.photo ?? null);

  const [imgSrc, setImgSrc] = React.useState<string | null>(currentPhoto?.dataUrl ?? null);
  const [zoom, setZoom] = React.useState(currentPhoto?.zoom ?? 1);
  const [offsetX, setOffsetX] = React.useState(currentPhoto?.offsetX ?? 0);
  const [offsetY, setOffsetY] = React.useState(currentPhoto?.offsetY ?? 0);
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const offsetStart = React.useRef({ x: 0, y: 0 });
  const fileRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onFile = (file: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!imgSrc) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { x: offsetX, y: offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStart.current.x) / rect.width * 100;
    const dy = (e.clientY - dragStart.current.y) / rect.height * 100;
    setOffsetX(Math.max(-40, Math.min(40, offsetStart.current.x + dx)));
    setOffsetY(Math.max(-40, Math.min(40, offsetStart.current.y + dy)));
  };
  const onPointerUp = () => setDragging(false);

  const save = () => {
    if (!imgSrc) return;
    const photo: ProfilePhoto = { dataUrl: imgSrc, zoom, offsetX, offsetY };
    setPhoto(photo);
    onClose();
  };

  const remove = () => {
    removePhoto();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] bg-[#212121]/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[14px] border border-white/10 bg-[#1f1f1f] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold tracking-tight">Profile Photo</h3>
          <button onClick={onClose} className="size-8 rounded-[8px] hover:bg-white/10 flex items-center justify-center text-white/60" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {!imgSrc ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="rounded-[12px] border-2 border-dashed border-white/15 hover:border-nirvash-red/40 bg-white/[0.02] py-12 px-6 text-center cursor-pointer transition-colors"
          >
            <div className="mx-auto size-12 rounded-full bg-nirvash-red/10 border border-nirvash-red/25 flex items-center justify-center mb-4">
              <Upload className="size-5 text-nirvash-red" />
            </div>
            <p className="text-[14px] font-semibold text-white">Upload a photo</p>
            <p className="text-[12px] text-white/45 mt-1">JPG, PNG, or WebP · Drag & drop or click</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </div>
        ) : (
          <>
            {/* preview area — circle crop */}
            <div className="flex justify-center mb-4">
              <div
                ref={containerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="relative size-44 rounded-full overflow-hidden bg-neutral-800 cursor-move touch-none select-none ring-2 ring-white/10"
              >
                <img
                  src={imgSrc}
                  alt="Preview"
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    transform: `scale(${zoom}) translate(${offsetX * 0.5}%, ${offsetY * 0.5}%)`,
                    transformOrigin: "center",
                  }}
                />
                {/* crop guide ring */}
                <div className="absolute inset-0 rounded-full ring-2 ring-white/30 pointer-events-none" />
              </div>
            </div>

            <p className="text-center text-[11px] text-white/40 mb-4">Drag to reposition · Use zoom to adjust</p>

            {/* zoom control */}
            <div className="flex items-center gap-2 mb-5">
              <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="size-9 rounded-[8px] border border-white/12 hover:bg-white/10 flex items-center justify-center text-white/70" aria-label="Zoom out">
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
              />
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="size-9 rounded-[8px] border border-white/12 hover:bg-white/10 flex items-center justify-center text-white/70" aria-label="Zoom in">
                <ZoomIn className="size-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <BrandButton variant="secondary" size="md" className="flex-1" onClick={() => fileRef.current?.click()}>
                <RefreshCw className="size-4" /> Replace
              </BrandButton>
              {currentPhoto && (
                <BrandButton variant="danger" size="md" onClick={remove}>
                  <Trash2 className="size-4" />
                </BrandButton>
              )}
              <BrandButton variant="primary" size="md" className="flex-1" onClick={save}>
                <Check className="size-4" /> Save
              </BrandButton>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Compact photo control used inside the personal info form */
export function PhotoControl({ onOpen }: { onOpen: () => void }) {
  const photo = useCVStore((s) => s.current?.personalInfo.photo ?? null);
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onOpen}
        className="relative size-16 rounded-full overflow-hidden bg-white/[0.04] border border-white/15 hover:border-nirvash-red/40 transition-colors flex items-center justify-center shrink-0"
      >
        {photo?.dataUrl ? (
          <img src={photo.dataUrl} alt="Profile" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${50 + (photo.offsetX || 0) * 0.3}% ${50 + (photo.offsetY || 0) * 0.3}%`, transform: `scale(${photo.zoom || 1})` }} />
        ) : (
          <ImageIcon className="size-5 text-white/30" />
        )}
      </button>
      <div>
        <button onClick={onOpen} className="text-[13px] font-medium text-nirvash-red hover:text-white transition-colors">
          {photo ? "Edit photo" : "Upload photo"}
        </button>
        <p className="text-[11px] text-white/40 mt-0.5">Optional · Circle crop</p>
      </div>
    </div>
  );
}
