"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClipItem, WizardCaptions } from "@/types";
import {
  captionContainerJustify,
  captionInlineStyle,
  captionOverlayClassNames,
} from "@/lib/caption-style";
import { getActiveCaptionState } from "@/lib/caption-state";
import { getPresetById } from "@/lib/caption-presets";
import { Button } from "@/components/ui/Button";
import { Pause, Play } from "lucide-react";

const PREVIEW_BG_FADE_IN_MS = 380;
const PREVIEW_BG_FADE_OUT_MS = 320;

/** Keep HTMLAudio bed under narration; slider is scaled down further when voice exists */
function previewBedPeak(volumeLinear: number, hasVoice: boolean): number {
  const v = Math.min(1, Math.max(0, volumeLinear));
  const scale = hasVoice ? 0.36 : 0.52;
  return Math.min(0.44, v * scale);
}

type Props = {
  clips: ClipItem[];
  voiceUrl?: string;
  /** Shared with export — must match `usePreviewDurationSec(voice, clips)` from parent. */
  totalDurationSec: number;
  captions: WizardCaptions;
  sourceText: string;
  /** Mixed preview: optional looping bed under voice */
  backgroundPlaybackUrl?: string;
  backgroundEnabled?: boolean;
  backgroundVolume?: number;
  hasVoiceAudio?: boolean;
};

export function VideoPreview({
  clips,
  voiceUrl,
  totalDurationSec,
  captions,
  sourceText,
  backgroundPlaybackUrl,
  backgroundEnabled = false,
  backgroundVolume = 0.18,
  hasVoiceAudio = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | null>(null);
  const bgFadeRafRef = useRef<number | null>(null);
  const startWallRef = useRef<number>(0);
  const playingRef = useRef(false);
  const tSecRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [tSec, setTSec] = useState(0);

  useEffect(() => {
    tSecRef.current = tSec;
  }, [tSec]);

  const bedActive =
    Boolean(backgroundPlaybackUrl && backgroundEnabled) &&
    Boolean(backgroundPlaybackUrl);

  const total = totalDurationSec;

  const seg = clips.length > 0 ? total / clips.length : total;
  const clipIndex =
    clips.length > 0 ? Math.min(clips.length - 1, Math.floor(tSec / seg)) : 0;

  const syncBedTime = useCallback(
    (timelineSec: number) => {
      const bg = bgAudioRef.current;
      if (!bg || !bedActive || !Number.isFinite(bg.duration) || bg.duration <= 0.05)
        return;
      const wrapped = timelineSec % bg.duration;
      if (Math.abs(bg.currentTime - wrapped) > 0.14) bg.currentTime = wrapped;
    },
    [bedActive],
  );

  const activeClip = clips[clipIndex];

  const preset = getPresetById(captions.presetId);
  const capTextRaw = getActiveCaptionState(
    captions,
    tSec * 1000,
    sourceText,
  ).text;
  const capText = preset?.uppercase ? capTextRaw.toUpperCase() : capTextRaw;

  const syncVideoTime = useCallback(() => {
    const v = videoRef.current;
    if (!v || !activeClip) return;
    const local = Math.max(0, tSec - clipIndex * seg);
    const dur = v.duration;
    if (dur && Number.isFinite(dur) && dur > 0.1) {
      v.currentTime = local % dur;
    } else if (dur && Number.isFinite(dur)) {
      v.currentTime = Math.min(local, Math.max(0, dur - 0.04));
    }
  }, [activeClip, clipIndex, seg, tSec]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

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

  /** Fade bed in/out when play state changes */
  useEffect(() => {
    const bg = bgAudioRef.current;
    if (!bg) return;

    if (!bedActive) {
      bg.pause();
      return;
    }

    if (bgFadeRafRef.current) cancelAnimationFrame(bgFadeRafRef.current);

    const peak = previewBedPeak(backgroundVolume, hasVoiceAudio);

    if (playing) {
      bg.volume = 0;
      bg.loop = true;
      const timelineHint =
        voiceUrl && audioRef.current
          ? Math.min(audioRef.current.currentTime, total)
          : tSecRef.current;
      syncBedTime(timelineHint);
      void bg.play().catch(() => {});
      const start = performance.now();
      const fadeIn = () => {
        if (!playingRef.current || !bgAudioRef.current) return;
        const k = Math.min(
          1,
          (performance.now() - start) / PREVIEW_BG_FADE_IN_MS,
        );
        bgAudioRef.current.volume = peak * k;
        if (k < 1) bgFadeRafRef.current = requestAnimationFrame(fadeIn);
      };
      fadeIn();
      return () => {
        if (bgFadeRafRef.current) cancelAnimationFrame(bgFadeRafRef.current);
      };
    }

    const startVol = bg.volume;
    const start = performance.now();
    const fadeOut = () => {
      const k = Math.min(
        1,
        (performance.now() - start) / PREVIEW_BG_FADE_OUT_MS,
      );
      bg.volume = startVol * (1 - k);
      if (k < 1) bgFadeRafRef.current = requestAnimationFrame(fadeOut);
      else {
        bg.pause();
        bg.volume = peak;
      }
    };
    fadeOut();
    return () => {
      if (bgFadeRafRef.current) cancelAnimationFrame(bgFadeRafRef.current);
    };
  }, [playing, bedActive]);

  /** Live slider tweak while playing */
  useEffect(() => {
    const bg = bgAudioRef.current;
    if (!bg || !bedActive || !playing) return;
    const peak = previewBedPeak(backgroundVolume, hasVoiceAudio);
    bg.volume = peak;
  }, [backgroundVolume, bedActive, playing, hasVoiceAudio]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const useVoiceClock = Boolean(voiceUrl && audioRef.current);

    if (useVoiceClock) {
      const tick = () => {
        const a = audioRef.current;
        const next = a ? Math.min(a.currentTime, total) : 0;
        setTSec(next);
        syncBedTime(next);
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
      syncBedTime(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, total, voiceUrl, syncBedTime]);

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
    const a = audioRef.current;
    const bg = bgAudioRef.current;

    if (voiceUrl && a) {
      a.currentTime = tSec >= total ? 0 : tSec;
      void a.play().catch(() => {});
      if (bg && bedActive && bg.duration && Number.isFinite(bg.duration)) {
        bg.currentTime = Math.min(a.currentTime, total) % bg.duration;
      }
    } else if (bg && bedActive && bg.duration && Number.isFinite(bg.duration)) {
      bg.currentTime = startT % bg.duration;
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
      {bedActive && backgroundPlaybackUrl ? (
        <audio
          ref={bgAudioRef}
          src={backgroundPlaybackUrl}
          preload="auto"
          className="hidden"
          loop
        />
      ) : null}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black shadow-[0_22px_42px_rgba(9,22,18,0.35)] ring-1 ring-slate-200/90">
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
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm">
        <Button
          type="button"
          variant="primary"
          className="gap-2 px-3.5 py-2"
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
