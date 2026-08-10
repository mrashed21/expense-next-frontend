"use client";

import { Loader2, Minus, Plus, RotateCcw, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const OUTPUT_SIZE = 512;
const MAX_ZOOM = 4;

type Offset = { x: number; y: number };

type AvatarCropperProps = {
  file: File;
  onCancel: () => void;
  onCropped: (file: File) => void;
  isUploading?: boolean;
};

export default function AvatarCropper({
  file,
  onCancel,
  onCropped,
  isUploading = false,
}: AvatarCropperProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragStartRef = useRef<{ pointer: Offset; offset: Offset } | null>(null);
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [viewportSize, setViewportSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setNatural(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => setViewportSize(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [objectUrl]);

  const baseScale =
    natural && viewportSize ? viewportSize / Math.min(natural.w, natural.h) : 1;
  const scale = baseScale * zoom;
  const displayW = natural ? natural.w * scale : 0;
  const displayH = natural ? natural.h * scale : 0;

  const clampOffset = useCallback(
    (next: Offset, atZoom: number): Offset => {
      if (!natural || !viewportSize) return next;
      const s = baseScale * atZoom;
      const maxX = Math.max(0, (natural.w * s - viewportSize) / 2);
      const maxY = Math.max(0, (natural.h * s - viewportSize) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [natural, viewportSize, baseScale],
  );

  const applyZoom = useCallback(
    (nextZoom: number) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(1, nextZoom));
      setZoom(clamped);
      setOffset((prev) =>
        clampOffset(
          { x: prev.x * (clamped / zoom), y: prev.y * (clamped / zoom) },
          clamped,
        ),
      );
    },
    [clampOffset, zoom],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      dragStartRef.current = {
        pointer: { x: e.clientX, y: e.clientY },
        offset,
      };
    } else if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      pinchStartRef.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        zoom,
      };
      dragStartRef.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [a, b] = Array.from(pointersRef.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStartRef.current.distance > 0) {
        applyZoom(
          (pinchStartRef.current.zoom * distance) /
            pinchStartRef.current.distance,
        );
      }
      return;
    }

    const start = dragStartRef.current;
    if (!start) return;
    setOffset(
      clampOffset(
        {
          x: start.offset.x + (e.clientX - start.pointer.x),
          y: start.offset.y + (e.clientY - start.pointer.y),
        },
        zoom,
      ),
    );
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
    if (pointersRef.current.size === 0) dragStartRef.current = null;
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyZoom, zoom]);

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleApply = () => {
    const img = imageRef.current;
    if (!img || !natural || !viewportSize) return;

    const sourceSize = viewportSize / scale;
    const sx = natural.w / 2 - (viewportSize / 2 + offset.x) / scale;
    const sy = natural.h / 2 - (viewportSize / 2 + offset.y) / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingQuality = "high";
    const isPng = file.type === "image/png";
    if (!isPng) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    }

    ctx.drawImage(
      img,
      sx,
      sy,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    const mimeType = isPng ? "image/png" : "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const extension = isPng ? "png" : "jpg";
        const baseName = file.name.replace(/\.[^./\\]+$/, "") || "avatar";
        onCropped(
          new File([blob], `${baseName}-avatar.${extension}`, {
            type: mimeType,
          }),
        );
      },
      mimeType,
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
        className="w-full max-w-sm bg-card border border-border p-6 rounded-3xl space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3
            id="crop-modal-title"
            className="text-base font-bold text-foreground"
          >
            Adjust Avatar
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          className="relative w-full aspect-square bg-secondary rounded-2xl overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
        >
          {objectUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              ref={imageRef}
              src={objectUrl}
              alt="Avatar preview"
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNatural({
                  w: el.naturalWidth,
                  h: el.naturalHeight,
                });
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: displayW || undefined,
                height: displayH || undefined,
                maxWidth: "none",
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                // Avoid a flash of the full-size image before geometry is known.
                visibility: displayW ? "visible" : "hidden",
              }}
            />
          )}

          {/* Circular mask showing exactly what will be kept */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              borderRadius: "9999px",
            }}
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary/70 pointer-events-none" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => applyZoom(zoom - 0.25)}
            disabled={zoom <= 1}
            aria-label="Zoom out"
            className="p-1.5 rounded-lg bg-secondary border border-border text-foreground disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="flex-1 accent-primary"
          />
          <button
            type="button"
            onClick={() => applyZoom(zoom + 0.25)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="p-1.5 rounded-lg bg-secondary border border-border text-foreground disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset"
            className="p-1.5 rounded-lg bg-secondary border border-border text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Drag to reposition · scroll or pinch to zoom
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-xl bg-secondary text-foreground font-semibold text-xs border border-border hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isUploading || !natural}
            className="w-1/2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
