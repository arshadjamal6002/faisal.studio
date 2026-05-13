import type { CaptionChunk } from "@/types";

const DEFAULT_CHUNK_MS = 2200;
/** Target words per on-screen caption line group */
const WORDS_PER_CHUNK = 6;

/** Split plain text into subtitle-sized chunks (~6 words each). */
export function splitTextIntoChunks(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    const slice = words.slice(i, i + WORDS_PER_CHUNK).join(" ");
    if (slice) chunks.push(slice);
  }

  return chunks;
}

/** Distribute chunk timings across total duration (ms). */
export function assignChunkTimings(
  chunkTexts: string[],
  totalDurationMs: number,
): CaptionChunk[] {
  if (chunkTexts.length === 0) return [];
  const n = chunkTexts.length;
  const total =
    totalDurationMs > 0 ? totalDurationMs : n * DEFAULT_CHUNK_MS;
  const per = total / n;
  return chunkTexts.map((text, idx) => ({
    text,
    startMs: Math.round(idx * per),
    endMs: Math.round((idx + 1) * per),
  }));
}

export function buildCaptionChunksFromText(
  text: string,
  totalDurationMs: number,
): CaptionChunk[] {
  const parts = splitTextIntoChunks(text);
  return assignChunkTimings(parts, totalDurationMs);
}
