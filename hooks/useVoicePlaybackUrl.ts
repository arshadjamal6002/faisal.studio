"use client";

import { useEffect, useState } from "react";
import type { WizardVoice } from "@/types";

/**
 * Stable object URL for `<audio>` / export: prefers persisted `voice.url`, else
 * creates one from `voice.blob` (and revokes on cleanup).
 */
export function useVoicePlaybackUrl(voice: WizardVoice): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() =>
    voice.url ? voice.url : undefined,
  );

  useEffect(() => {
    if (voice.url) {
      setUrl(voice.url);
      return;
    }
    if (!voice.blob) {
      setUrl(undefined);
      return;
    }
    const u = URL.createObjectURL(voice.blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
    };
  }, [voice.url, voice.blob]);

  return url;
}
