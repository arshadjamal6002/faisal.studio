"use client";

import { useEffect, useRef } from "react";
import type { ClipItem, WizardCaptions } from "@/types";
import {
  captionContainerJustify,
  captionInlineStyle,
  captionOverlayClassNames,
} from "@/lib/caption-style";
import { getPresetById } from "@/lib/caption-presets";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

type Props = {
  clips: ClipItem[];
  captions: WizardCaptions;
  /** Current teleprompter line — shown with final caption styling */
  overlayLine: string;
};

export function VoiceStagePreview({ clips, captions, overlayLine }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const first = clips[0];
  const preset = getPresetById(captions.presetId);
  const display =
    preset?.uppercase && overlayLine
      ? overlayLine.toUpperCase()
      : overlayLine;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !first) return;
    if (v.src !== first.url) {
      v.src = first.url;
      v.load();
    }
  }, [first]);

  if (!first) {
    return (
      <Card>
        <CardTitle>Final look</CardTitle>
        <CardDescription>
          Clips yahan dikhte — pehle Step 2 mein clips add karein.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardTitle>Final look (while you record)</CardTitle>
      <CardDescription>
        Neeche wahi caption style hai jo Step 3 mein chuni — awaaz record karte
        waqt is frame ko apna anchor samjhein.
      </CardDescription>
      <div className="mx-auto mt-4 w-full max-w-[240px]">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black shadow-md ring-1 ring-slate-200">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={first.url}
            muted
            playsInline
            loop
            preload="metadata"
          />
          <div
            className={`pointer-events-none absolute inset-0 flex flex-col px-3 ${captionContainerJustify(captions)}`}
          >
            <div
              className={captionOverlayClassNames(captions)}
              style={captionInlineStyle(captions)}
            >
              {display || "…"}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">
        Pehla clip loop ho raha hai — preview step par poora sequence milega.
      </p>
    </Card>
  );
}
