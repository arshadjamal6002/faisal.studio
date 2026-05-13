"use client";

import { useEffect, useState } from "react";
import type { WizardBackgroundAudio } from "@/types";

/** Object URL for background bed when user has selected a file. */
export function useBackgroundPlaybackUrl(
  bed: WizardBackgroundAudio,
): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() =>
    bed.url ? bed.url : undefined,
  );

  useEffect(() => {
    if (bed.url) {
      setUrl(bed.url);
      return;
    }
    if (!bed.blob) {
      setUrl(undefined);
      return;
    }
    const u = URL.createObjectURL(bed.blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
    };
  }, [bed.url, bed.blob]);

  return url;
}
