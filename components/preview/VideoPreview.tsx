"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClipItem, WizardCaptions } from "@/types";
import {
  captionContainerJustify,
  captionInlineStyle,
  captionOverlayClassNames,
} from "@/lib/caption-style";
import { getCaptionLineForTime } from "@/lib/caption-display";
import { getPresetById } from "@/lib/caption-presets";
import { Button } from "@/components/ui/Button";
import { Pause, Play } from "lucide-react";

type Props = {
  clips: ClipItem[];
  voiceUrl?: string;
  voiceDurationSec?: number;
  captions: WizardCaptions;
  sourceText: string;
};

function totalDurationSec(
  clips: ClipItem[],
  voiceDurationSec?: number,
): number {
  if (voiceDurationSec && voiceDurationSec > 0) return voiceDurationSec;
  const sum = clips.reduce(
    (acc, c) => acc + (c.durationSec && c.durationSec > 0 ? c.durationSec : 0),
    0,
  );
  if (sum > 0) return sum;
  return clips.length * 3;
}

export function VideoPreview({
  clips,
  voiceUrl,
  voiceDurationSec,
  captions,
  sourceText,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | null>(null);
  const startWallRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [tSec, setTSec] = useState(0);

  const total = useMemo(
    () => totalDurationSec(clips, voiceDurationSec),
    [clips, voiceDurationSec],
  );
  const seg = clips.length > 0 ? total / clips.length : total;
  const clipIndex =
    clips.length > 0 ? Math.min(clips.length - 1, Math.floor(tSec / seg)) : 0;
  const activeClip = clips[clipIndex];

  const preset = getPresetById(captions.presetId);
  const capTextRaw = getCaptionLineForTime(
    captions,
    tSec * 1000,
    sourceText,
  );
  const capText = preset?.uppercase ? capTextRaw.toUpperCase() : capTextRaw;

  const syncVideoTime = useCallback(() => {
    const v = videoRef.current;
    if (!v || !activeClip) return;
    const local = Math.max(0, tSec - clipIndex * seg);
    const dur = v.duration;
    if (dur && Number.isFinite(dur)) {
      v.currentTime = Math.min(local, Math.max(0, dur - 0.04));
    }
  }, [activeClip, clipIndex, seg, tSec]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !activeClip) return;
    if (v.src !== activeClip.url) {
      v.src = activeClip.url;
      v.load();
    }
  }, [activeClip]);

  useEffect(() => {
    syncVideoTime();
  }, [syncVideoTime, playing]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const useAudioClock = Boolean(voiceUrl && audioRef.current);

    if (useAudioClock) {
      const tick = () => {
        const a = audioRef.current;
        const next = a ? Math.min(a.currentTime, total) : 0;
        setTSec(next);
        if (!a || a.ended || next >= total - 0.01) {
          setPlaying(false);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    const tick = () => {
      const now = performance.now();
      let next = (now - startWallRef.current) / 1000;
      if (next >= total) {
        next = total;
        setPlaying(false);
      }
      setTSec(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, total, voiceUrl]);

  const toggle = () => {
    if (clips.length === 0) return;
    if (playing) {
      setPlaying(false);
      audioRef.current?.pause();
      videoRef.current?.pause();
      return;
    }
    const startT = tSec >= total ? 0 : tSec;
    if (tSec >= total) setTSec(0);
    startWallRef.current = performance.now() - startT * 1000;
    setPlaying(true);
    const v = videoRef.current;
    if (voiceUrl && audioRef.current) {
      const a = audioRef.current;
      a.currentTime = tSec >= total ? 0 : tSec;
      void a.play().catch(() => {});
    }
    void v?.play().catch(() => {});
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) void v.play().catch(() => {});
    else v.pause();
  }, [playing]);

  return (
    <div className="mx-auto w-full max-w-sm">
      {voiceUrl ? (
        <audio ref={audioRef} src={voiceUrl} preload="auto" className="hidden" />
      ) : null}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-slate-200">
        {activeClip ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
            preload="auto"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/70">
            Add clips to preview
          </div>
        )}
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col px-3 ${captionContainerJustify(captions)}`}
        >
          <div
            className={captionOverlayClassNames(captions)}
            style={captionInlineStyle(captions)}
          >
            {capText}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="primary"
          className="gap-2"
          disabled={clips.length === 0}
          onClick={toggle}
        >
          {playing ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Play preview
            </>
          )}
        </Button>
        <p className="text-xs text-slate-500 tabular-nums">
          {tSec.toFixed(1)}s / {total.toFixed(1)}s
        </p>
      </div>
    </div>
  );
}
