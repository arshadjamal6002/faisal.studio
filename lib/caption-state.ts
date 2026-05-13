import type { WizardCaptions } from "@/types";

export type ActiveCaptionState = {
  /** Resolved subtitle text (before preset uppercase transform in UI/canvas) */
  text: string;
  /** Index into captions.chunks, or -1 when chunks empty */
  chunkIndex: number;
};

/**
 * Single source of truth for “what caption should show” at playback time `tMs`.
 * Used by live preview, final preview, and canvas export.
 */
export function getActiveCaptionState(
  captions: WizardCaptions,
  tMs: number,
  fallback: string,
): ActiveCaptionState {
  const chunks = captions.chunks;
  if (chunks.length === 0) {
    return { text: fallback, chunkIndex: -1 };
  }

  let chunkIndex = chunks.findIndex(
    (c) => tMs >= c.startMs && tMs < c.endMs,
  );
  if (chunkIndex < 0) chunkIndex = chunks.length - 1;

  const chunk = chunks[chunkIndex];
  const base = (chunk.text || "").trim() || fallback;

  if (captions.displayMode !== "word_by_word") {
    return { text: base, chunkIndex };
  }

  const words = base.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { text: base, chunkIndex };
  }

  const dur = Math.max(1, chunk.endMs - chunk.startMs);
  const rel = Math.max(0, Math.min(1, (tMs - chunk.startMs) / dur));
  if (rel >= 0.999) {
    return { text: words.join(" "), chunkIndex };
  }

  const k = Math.min(
    words.length,
    Math.max(1, Math.ceil(rel * words.length)),
  );
  return { text: words.slice(0, k).join(" "), chunkIndex };
}

export function getCaptionLineForTime(
  captions: WizardCaptions,
  tMs: number,
  fallback: string,
): string {
  return getActiveCaptionState(captions, tMs, fallback).text;
}
