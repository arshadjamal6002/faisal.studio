import type { ClipItem, WizardVoice } from "@/types";

/** Sum clip durations for silent (no narration) timeline. */
export function silentClipTimelineMs(clips: ClipItem[]): number {
  if (clips.length === 0) return 3000;
  const sum = clips.reduce(
    (acc, c) => acc + (c.durationSec && c.durationSec > 0 ? c.durationSec * 1000 : 0),
    0,
  );
  if (sum > 0) return sum;
  return clips.length * 3000;
}

/**
 * Narration-driven timeline length in ms (source of truth for captions + preview when voice exists).
 * Prefers decoded audio length; else reading chunk end (wall or scaled). Does not use clip sum.
 */
export function narrationTimelineMs(voice: WizardVoice): number {
  const ds = voice.durationSec;
  const audioMs =
    ds != null && Number.isFinite(ds) && ds > 0 ? ds * 1000 : 0;
  if (audioMs > 0) return audioMs;

  const hasAudioAsset = Boolean(voice.url || voice.blob);
  if (hasAudioAsset && voice.readingCaptionChunks?.length) {
    const ch = voice.readingCaptionChunks;
    const end = ch[ch.length - 1]?.endMs ?? 0;
    if (end > 0) return end;
  }

  return 0;
}

/** Preview / export duration in seconds: narration first, else silent clip timeline. */
export function previewTimelineSec(
  voice: WizardVoice,
  clips: ClipItem[],
): number {
  const n = narrationTimelineMs(voice);
  if (n > 0) return Math.max(0.1, n / 1000);
  return Math.max(0.1, silentClipTimelineMs(clips) / 1000);
}

/** Matches VideoPreview: narration duration, then decoded audio, then clip fallback. */
export function previewExportDurationSec(
  voice: WizardVoice,
  clips: ClipItem[],
  opts?: { decodedAudioSec?: number },
): number {
  const vd = voice.durationSec;
  if (vd != null && vd > 0 && Number.isFinite(vd)) return Math.max(0.1, vd);

  const dec = opts?.decodedAudioSec;
  if (dec != null && dec > 0 && Number.isFinite(dec)) return Math.max(0.1, dec);

  return previewTimelineSec(voice, clips);
}
