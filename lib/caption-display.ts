import type { WizardCaptions } from "@/types";

/**
 * Caption string for time `tMs`: full chunk line, or word-by-word inside active chunk.
 */
export function getCaptionLineForTime(
  captions: WizardCaptions,
  tMs: number,
  fallback: string,
): string {
  const chunks = captions.chunks;
  if (chunks.length === 0) return fallback;

  const chunk =
    chunks.find((c) => tMs >= c.startMs && tMs < c.endMs) ?? chunks[chunks.length - 1];

  const text = (chunk.text || "").trim() || fallback;
  if (captions.displayMode !== "word_by_word") return text;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return text;

  const dur = Math.max(1, chunk.endMs - chunk.startMs);
  const rel = Math.max(0, Math.min(1, (tMs - chunk.startMs) / dur));
  if (rel >= 0.999) return words.join(" ");

  const k = Math.min(words.length, Math.max(1, Math.ceil(rel * words.length)));
  return words.slice(0, k).join(" ");
}
