import type { CSSProperties } from "react";
import type { WizardCaptions } from "@/types";
import { getPresetById } from "@/lib/caption-presets";

/** Flex justify for caption column wrapper */
export function captionContainerJustify(caps: WizardCaptions): string {
  if (caps.position === "top") return "justify-start pt-[6%]";
  if (caps.position === "bottom") return "justify-end pb-[8%]";
  return "justify-center";
}

/** Tailwind classes for caption overlay (preview / DOM video stage). */
export function captionOverlayClassNames(caps: WizardCaptions): string {
  const preset = getPresetById(caps.presetId);
  const base = "max-w-[92%] text-center px-4 break-words leading-snug";

  let bg = "";
  switch (caps.background) {
    case "solid":
      bg = "rounded-2xl bg-black/55 px-4 py-2";
      break;
    case "blur":
      bg = "rounded-2xl bg-black/45 px-4 py-2 backdrop-blur-sm";
      break;
    case "gradient":
      bg = "rounded-2xl bg-gradient-to-t from-black/70 to-transparent px-4 py-3";
      break;
    default:
      bg = caps.presetId === "minimal-white" ? "" : "";
  }

  const font =
    preset?.fontFamily === "serif" ? "font-serif" : "font-sans font-semibold";

  const upper = preset?.uppercase ? "uppercase tracking-wide" : "";

  return `${base} ${bg} ${font} ${upper}`;
}

export function captionInlineStyle(caps: WizardCaptions): CSSProperties {
  return {
    fontSize: `${caps.fontSize}px`,
    color: caps.color,
    textShadow:
      caps.background === "none"
        ? "0 2px 10px rgba(0,0,0,0.85)"
        : undefined,
  };
}
