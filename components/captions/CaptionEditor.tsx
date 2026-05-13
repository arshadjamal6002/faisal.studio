"use client";

import type { CaptionBackground, CaptionPosition, CaptionDisplayMode } from "@/types";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";

type Props = {
  fontSize: number;
  color: string;
  position: CaptionPosition;
  background: CaptionBackground;
  displayMode: CaptionDisplayMode;
  onFontSize: (n: number) => void;
  onColor: (c: string) => void;
  onPosition: (p: CaptionPosition) => void;
  onBackground: (b: CaptionBackground) => void;
  onDisplayMode: (m: CaptionDisplayMode) => void;
};

const POSITIONS: CaptionPosition[] = ["top", "middle", "bottom"];
const BGS: { id: CaptionBackground; label: string }[] = [
  { id: "none", label: "None" },
  { id: "solid", label: "Solid" },
  { id: "blur", label: "Blur" },
  { id: "gradient", label: "Gradient" },
];

export function CaptionEditor({
  fontSize,
  color,
  position,
  background,
  displayMode,
  onFontSize,
  onColor,
  onPosition,
  onBackground,
  onDisplayMode,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Caption display</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={displayMode === "full_line" ? "primary" : "secondary"}
            className="text-xs"
            onClick={() => onDisplayMode("full_line")}
          >
            Full line
          </Button>
          <Button
            type="button"
            variant={displayMode === "word_by_word" ? "primary" : "secondary"}
            className="text-xs"
            onClick={() => onDisplayMode("word_by_word")}
          >
            Word by word
          </Button>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Word mode har chunk ke andar alfaaz aahista dikhata hai (speech-to-text
          ke baghair).
        </p>
      </div>
      <Slider
        label="Font size"
        min={16}
        max={56}
        step={1}
        value={fontSize}
        onChange={(e) => onFontSize(Number(e.target.value))}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Text color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => onColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            aria-label="Caption color"
          />
          <span className="font-mono text-xs text-slate-500">{color}</span>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Position</p>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <Button
              key={p}
              type="button"
              variant={position === p ? "primary" : "secondary"}
              className="capitalize"
              onClick={() => onPosition(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Background</p>
        <div className="flex flex-wrap gap-2">
          {BGS.map((b) => (
            <Button
              key={b.id}
              type="button"
              variant={background === b.id ? "primary" : "secondary"}
              onClick={() => onBackground(b.id)}
            >
              {b.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
