"use client";

import { CAPTION_PRESETS } from "@/lib/caption-presets";
import { Check } from "lucide-react";

type Props = {
  activeId: string;
  onSelect: (id: string) => void;
};

export function CaptionPresets({ activeId, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CAPTION_PRESETS.map((p) => {
        const active = activeId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`rounded-2xl border p-3 text-left transition ${
              active
                ? "border-deen bg-deen/5 ring-2 ring-deen/25"
                : "border-slate-200 bg-white hover:border-deen/35"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-600">{p.description}</p>
              </div>
              {active ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-deen text-white">
                  <Check className="h-4 w-4" />
                </span>
              ) : null}
            </div>
            <div className="relative mx-auto aspect-[9/16] w-20 overflow-hidden rounded-lg bg-gradient-to-b from-slate-800 to-slate-950">
              <div className="absolute inset-x-1 bottom-2 flex justify-center">
                <span
                  className={`max-w-full rounded px-1.5 py-0.5 text-center text-[8px] leading-tight ${p.previewClass}`}
                >
                  {p.uppercase ? "YOUR REMINDER" : "Your reminder text"}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
