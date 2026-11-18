// One place that turns a stored photo crop into CSS, so the crop the user
// sets in the upload dialog is exactly what the CV and the thumbnails show.

import type * as React from "react";
import type { ProfilePhoto } from "@/lib/cv-data/types";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * `offsetX/offsetY` are how far the picture was dragged (-50…50, percent).
 * Panning uses object-position and zooming scales around the same focal
 * point, so the image always keeps covering its frame.
 */
export function photoImageStyle(photo: Pick<ProfilePhoto, "zoom" | "offsetX" | "offsetY">): React.CSSProperties {
  const x = clamp(50 - (photo.offsetX || 0), 0, 100);
  const y = clamp(50 - (photo.offsetY || 0), 0, 100);
  return {
    objectFit: "cover",
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${clamp(photo.zoom || 1, 1, 4)})`,
    transformOrigin: `${x}% ${y}%`,
  };
}

/**
 * Downscale an uploaded picture before it is stored. Raw phone photos are
 * several megabytes as data URLs and overflow localStorage, which silently
 * breaks autosave.
 */
export function downscaleImage(file: File, maxSide = 720, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas is not available."));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    img.src = url;
  });
}
