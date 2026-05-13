"use client";

import { useEffect, useRef, useState } from "react";
import type { WizardCaptions } from "@/types";
import {
  captionContainerJustify,
  captionInlineStyle,
  captionOverlayClassNames,
} from "@/lib/caption-style";
import { getPresetById } from "@/lib/caption-presets";
import { getActiveCaptionState } from "@/lib/caption-state";

type Props = {
  captions: WizardCaptions;
  sampleText: string;
};

export function CaptionPreview({ captions, sampleText }: Props) {
  const preset = getPresetById(captions.presetId);
  const [tMs, setTMs] = useState(0);
  const startRef = useRef(0);

  const endMs =
    captions.chunks.length > 0
      ? captions.chunks[captions.chunks.length - 1].endMs
      : 4000;
  const loopMs = Math.max(3500, endMs + 800);

  useEffect(() => {
    startRef.current = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      setTMs(elapsed % loopMs);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loopMs, captions.chunks, captions.displayMode]);

  const line = getActiveCaptionState(captions, tMs, sampleText).text;
  const text = preset?.uppercase ? line.toUpperCase() : line;

  return (
    <div className="mx-auto w-full max-w-[220px]">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 shadow-md ring-1 ring-slate-200">
        <div
          className={`absolute inset-0 flex flex-col px-3 ${captionContainerJustify(captions)}`}
        >
          <div
            className={captionOverlayClassNames(captions)}
            style={captionInlineStyle(captions)}
          >
            {text || "Your captions will appear here"}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Live caption preview ({captions.displayMode === "word_by_word" ? "word" : "full"})
      </p>
    </div>
  );
}
