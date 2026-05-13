"use client";

import type { ReadingMode } from "@/types";
import { Button } from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";

type Props = {
  lines: string[];
  lineIndex: number;
  readingMode: ReadingMode;
  onReadingMode: (m: ReadingMode) => void;
  autoSecPerLine: number;
  onAutoSecPerLine: (sec: number) => void;
  recording: boolean;
  onManualNext: () => void;
};

const SPEED_PRESETS: { label: string; sec: number }[] = [
  { label: "Slow", sec: 4 },
  { label: "Normal", sec: 3 },
  { label: "Fast", sec: 2 },
];

export function ReadingPrompter({
  lines,
  lineIndex,
  readingMode,
  onReadingMode,
  autoSecPerLine,
  onAutoSecPerLine,
  recording,
  onManualNext,
}: Props) {
  const current = lines[lineIndex] ?? "";
  const next = lines[lineIndex + 1];

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
        Pehle Step 1 se koi text chunen ya likhen — phir yahan parhne ke liye lines
        ban jayengi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-deen/15 bg-gradient-to-b from-white to-cream/55 px-5 py-6 shadow-[0_10px_28px_rgba(22,51,44,0.08)]">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Ab yeh line bolain
        </p>
        <p className="text-xl font-medium leading-snug text-slate-900 sm:text-2xl">
          {current}
        </p>
        {next ? (
          <p className="mt-4 text-base leading-relaxed text-slate-400">{next}</p>
        ) : (
          <p className="mt-3 text-xs text-slate-400">Aakhri line</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 py-2.5 shadow-sm">
        <span className="text-xs font-medium text-slate-600">Line advance:</span>
        <Button
          type="button"
          variant={readingMode === "auto" ? "primary" : "secondary"}
          className="text-xs"
          onClick={() => onReadingMode("auto")}
        >
          Auto
        </Button>
        <Button
          type="button"
          variant={readingMode === "manual" ? "primary" : "secondary"}
          className="text-xs"
          onClick={() => onReadingMode("manual")}
        >
          Manual
        </Button>
      </div>

      {readingMode === "auto" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">Prompt speed (har line)</p>
          <div className="flex flex-wrap gap-2">
            {SPEED_PRESETS.map((p) => (
              <Button
                key={p.label}
                type="button"
                variant={autoSecPerLine === p.sec ? "primary" : "secondary"}
                className="text-xs"
                disabled={recording}
                onClick={() => onAutoSecPerLine(p.sec)}
              >
                {p.label} ({p.sec}s)
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Recording ke dauran yeh sirf text aagay badhayega — aapki awaaz ki speed
            change nahin hoti.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="secondary"
            className="gap-2 text-sm"
            disabled={!recording || lineIndex >= lines.length - 1}
            onClick={onManualNext}
          >
            Next line
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="text-[11px] text-slate-500">
            Recording chalte waqt har nayi line par yeh dabain — waqt humein
            captions ke liye milega.
          </p>
        </div>
      )}
    </div>
  );
}
