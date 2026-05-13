import type { CaptionChunk } from "@/types";

function uniformBoundaries(lineCount: number, totalMs: number): number[] {
  const L = lineCount;
  const T = Math.max(1, Math.round(totalMs));
  return Array.from({ length: L + 1 }, (_, i) =>
    Math.round((T * i) / Math.max(1, L)),
  );
}

/**
 * Build monotonic boundary array [0, ..., totalMs] with length lineCount + 1.
 * advanceTimes = wall ms when user (or auto) moved to the *next* line (exclusive of 0 and T).
 */
export function finalizeLineBoundaries(
  lineCount: number,
  advanceTimes: number[],
  totalMs: number,
): number[] {
  const L = lineCount;
  const T = Math.max(1, Math.round(totalMs));
  if (L === 0) return [0, T];

  const advances = [...advanceTimes]
    .map((x) => Math.round(x))
    .filter((x) => x > 0 && x < T)
    .sort((a, b) => a - b);

  const b: number[] = [0];
  for (const t of advances) {
    if (t > b[b.length - 1]) b.push(t);
  }
  if (b[b.length - 1] < T) b.push(T);

  if (b.length > L + 1) {
    return uniformBoundaries(L, T);
  }

  while (b.length < L + 1) {
    let bestI = 0;
    let bestGap = 0;
    for (let i = 0; i < b.length - 1; i++) {
      const g = b[i + 1] - b[i];
      if (g > bestGap) {
        bestGap = g;
        bestI = i;
      }
    }
    if (bestGap < 2) break;
    const mid = Math.round((b[bestI] + b[bestI + 1]) / 2);
    if (mid <= b[bestI] || mid >= b[bestI + 1]) break;
    b.splice(bestI + 1, 0, mid);
  }

  if (b.length !== L + 1) {
    return uniformBoundaries(L, T);
  }

  b[0] = 0;
  b[b.length - 1] = T;
  return b;
}

export function lineBoundariesToChunks(
  lines: string[],
  boundariesMs: number[],
): CaptionChunk[] {
  if (lines.length === 0 || boundariesMs.length < 2) return [];
  const out: CaptionChunk[] = [];
  for (let i = 0; i < lines.length; i++) {
    const startMs = boundariesMs[i] ?? 0;
    const endMs = boundariesMs[i + 1] ?? startMs;
    out.push({
      text: lines[i],
      startMs,
      endMs: Math.max(startMs + 1, endMs),
    });
  }
  return out;
}

export function scaleCaptionChunks(
  chunks: CaptionChunk[],
  newTotalMs: number,
): CaptionChunk[] {
  if (chunks.length === 0) return [];
  const oldEnd = chunks[chunks.length - 1].endMs;
  if (oldEnd <= 0) return chunks;
  const factor = Math.max(1, newTotalMs) / oldEnd;
  return chunks.map((c) => ({
    text: c.text,
    startMs: Math.round(c.startMs * factor),
    endMs: Math.round(c.endMs * factor),
  }));
}
