"use client";

import { useRef } from "react";
import { useWizardStore } from "@/lib/store";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Music2, Trash2, Upload } from "lucide-react";

export function OptionalBackgroundAudio() {
  const backgroundAudio = useWizardStore((s) => s.backgroundAudio);
  const setBackgroundAudioFromFile = useWizardStore(
    (s) => s.setBackgroundAudioFromFile,
  );
  const clearBackgroundAudio = useWizardStore((s) => s.clearBackgroundAudio);
  const setBackgroundAudioEnabled = useWizardStore(
    (s) => s.setBackgroundAudioEnabled,
  );
  const setBackgroundAudioVolume = useWizardStore(
    (s) => s.setBackgroundAudioVolume,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFile = Boolean(backgroundAudio.url || backgroundAudio.blob);

  return (
    <Card className="border-slate-200/90 bg-white/80">
      <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold">
        <Music2 className="h-4 w-4 shrink-0 text-deen" aria-hidden />
        Background audio
        <span className="font-normal text-slate-500">— optional</span>
      </CardTitle>
      <CardDescription>
        Add a calm instrumental bed beneath your voice. It stays low by default so
        your reminder stays easy to hear.
      </CardDescription>

      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="gap-2 text-xs sm:text-sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4 shrink-0" />
            Upload audio
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setBackgroundAudioFromFile(f);
              e.target.value = "";
            }}
          />
          {hasFile ? (
            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-xs text-slate-600 sm:text-sm"
              onClick={() => clearBackgroundAudio()}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Remove
            </Button>
          ) : null}
        </div>

        {hasFile ? (
          <p className="text-xs text-slate-600">
            <span className="font-medium text-slate-800">
              {backgroundAudio.fileName ?? "Background track"}
            </span>
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            No file chosen — preview and export use voice-only audio (or silence).
          </p>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 accent-deen"
            checked={backgroundAudio.enabled && hasFile}
            disabled={!hasFile}
            onChange={(e) => setBackgroundAudioEnabled(e.target.checked)}
          />
          Play background with preview & export
        </label>

        <Slider
          label={`Bed volume (${Math.round(backgroundAudio.volume * 100)}%)`}
          min={0}
          max={100}
          step={1}
          value={Math.round(backgroundAudio.volume * 100)}
          disabled={!hasFile || !backgroundAudio.enabled}
          onChange={(e) =>
            setBackgroundAudioVolume(Number(e.target.value) / 100)
          }
        />
        <p className="text-[11px] leading-relaxed text-slate-500">
          Gentle fade-in and fade-out when you press play — tweak until it feels calm.
        </p>
      </div>
    </Card>
  );
}
