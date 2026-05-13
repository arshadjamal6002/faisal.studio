import type { CSSProperties } from "react";
import type { WizardCaptions } from "@/types";
import { getPresetById } from "@/lib/caption-presets";

/** Flex justify for caption column wrapper */
export function captionContainerJustify(caps: WizardCaptions): string {
  if (caps.position === "top") return "justify-start pt-[6%]";
  if (caps.position === "bottom") return "justify-end pb-[8%]";
  return "justify-center";
}

function presetBackgroundClasses(caps: WizardCaptions): string {
  switch (caps.background) {
    case "none":
      return "";
    case "solid":
      if (caps.presetId === "deen-green") {
        return "rounded-full bg-deen px-4 py-2 shadow-sm";
      }
      if (caps.presetId === "bold-reminder") {
        return "rounded-lg bg-white/95 px-3 py-2 shadow-md";
      }
      return "rounded-2xl bg-black/55 px-4 py-2";
    case "blur":
      return "rounded-2xl bg-black/45 px-4 py-2 backdrop-blur-sm";
    case "gradient":
      return "rounded-2xl bg-gradient-to-t from-black/70 to-transparent px-4 py-3";
    default:
      return "";
  }
}

/** Tailwind classes for caption overlay (preview / DOM video stage). */
export function captionOverlayClassNames(caps: WizardCaptions): string {
  const preset = getPresetById(caps.presetId);
  const base = "max-w-[92%] text-center px-4 break-words leading-snug";

  const bg = presetBackgroundClasses(caps);

  const family =
    preset?.fontFamily === "serif" ? "font-serif" : "font-sans";

  const upper = preset?.uppercase ? "uppercase tracking-wide" : "";

  return `${base} ${bg} ${family} ${upper}`.replace(/\s+/g, " ").trim();
}

export function captionInlineStyle(caps: WizardCaptions): CSSProperties {
  const preset = getPresetById(caps.presetId);
  const fontFamily =
    preset?.fontFamily === "serif"
      ? "var(--font-cormorant), Georgia, serif"
      : "var(--font-inter), system-ui, sans-serif";
  return {
    fontSize: `${caps.fontSize}px`,
    fontWeight: preset?.fontWeight ?? 600,
    fontFamily,
    color: caps.color,
    textShadow:
      caps.background === "none"
        ? "0 2px 10px rgba(0,0,0,0.85)"
        : undefined,
  };
}
