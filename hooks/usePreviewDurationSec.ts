"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClipItem, WizardVoice } from "@/types";
import { previewExportDurationSec } from "@/lib/timeline";

/** Matches VideoPreview / export total duration (voice metadata → decoded audio → clip sum). */
export function usePreviewDurationSec(
  voice: WizardVoice,
  clips: ClipItem[],
): number {
  const [decodedAudioSec, setDecodedAudioSec] = useState(0);

  useEffect(() => {
    if (!voice.url && !voice.blob) {
      setDecodedAudioSec(0);
      return;
    }
    const src =
      voice.url ?? (voice.blob ? URL.createObjectURL(voice.blob) : "");
    if (!src) {
      setDecodedAudioSec(0);
      return;
    }
    const ownsUrl = !voice.url && Boolean(voice.blob);
    const a = new Audio();
    a.src = src;
    const onMeta = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) {
        setDecodedAudioSec(a.duration);
      }
    };
    a.addEventListener("loadedmetadata", onMeta);
    if (a.readyState >= 1) onMeta();
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.src = "";
      if (ownsUrl) URL.revokeObjectURL(src);
    };
  }, [voice.url, voice.blob]);

  return useMemo(
    () =>
      previewExportDurationSec(voice, clips, {
        decodedAudioSec: decodedAudioSec > 0 ? decodedAudioSec : undefined,
      }),
    [voice, clips, decodedAudioSec],
  );
}
