"use client";

import type { ClipItem } from "@/types";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useRef } from "react";

type Props = {
  clip: ClipItem;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuration: (sec: number) => void;
};

export function ClipCard({
  clip,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuration,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onMeta = () => {
      if (el.duration && Number.isFinite(el.duration)) {
        onDuration(el.duration);
      }
    };
    el.addEventListener("loadedmetadata", onMeta);
    return () => el.removeEventListener("loadedmetadata", onMeta);
  }, [clip.url, onDuration]);

  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="relative h-24 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-900 sm:h-28 sm:w-16">
        <video
          ref={videoRef}
          src={clip.url}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {clip.file.name}
        </p>
        <p className="text-xs text-slate-500">
          {clip.durationSec != null
            ? `${clip.durationSec.toFixed(1)}s`
            : "Loading…"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1 text-xs"
            disabled={index === 0}
            onClick={onMoveUp}
            aria-label="Move clip up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1 text-xs"
            disabled={index >= total - 1}
            onClick={onMoveDown}
            aria-label="Move clip down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            onClick={onRemove}
            aria-label="Remove clip"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
