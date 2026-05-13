import type { CaptionBackground, CaptionPosition } from "@/types";

export type CaptionPreset = {
  id: string;
  name: string;
  description: string;
  fontFamily: "sans" | "serif";
  fontWeight: number;
  defaultColor: string;
  defaultFontSize: number;
  defaultPosition: CaptionPosition;
  defaultBackground: CaptionBackground;
  uppercase?: boolean;
  /** Extra Tailwind / class hints for preview (not exhaustive) */
  previewClass: string;
};

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    id: "minimal-white",
    name: "Minimal White",
    description: "Clean white text with soft shadow",
    fontFamily: "sans",
    fontWeight: 600,
    defaultColor: "#FFFFFF",
    defaultFontSize: 28,
    defaultPosition: "middle",
    defaultBackground: "none",
    previewClass: "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]",
  },
  {
    id: "elegant-gold",
    name: "Elegant Gold",
    description: "Serif gold on dark glass",
    fontFamily: "serif",
    fontWeight: 600,
    defaultColor: "#C9A24A",
    defaultFontSize: 30,
    defaultPosition: "middle",
    defaultBackground: "blur",
    previewClass: "text-[#C9A24A] bg-black/45 backdrop-blur-sm px-4 py-2 rounded-lg",
  },
  {
    id: "deen-green",
    name: "Deen Green",
    description: "White on teal pill",
    fontFamily: "sans",
    fontWeight: 700,
    defaultColor: "#FFFFFF",
    defaultFontSize: 26,
    defaultPosition: "bottom",
    defaultBackground: "solid",
    previewClass: "text-white bg-deen px-4 py-2 rounded-full",
  },
  {
    id: "bold-reminder",
    name: "Bold Reminder",
    description: "High contrast bar",
    fontFamily: "sans",
    fontWeight: 800,
    defaultColor: "#0F172A",
    defaultFontSize: 24,
    defaultPosition: "bottom",
    defaultBackground: "solid",
    uppercase: true,
    previewClass: "text-slate-900 bg-white/95 px-3 py-2 uppercase tracking-wide",
  },
];

export function getPresetById(id: string): CaptionPreset | undefined {
  return CAPTION_PRESETS.find((p) => p.id === id);
}
