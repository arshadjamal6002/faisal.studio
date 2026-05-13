"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VideoPreview } from "@/components/preview/VideoPreview";
import { useWizardStore } from "@/lib/store";
import { getPresetById } from "@/lib/caption-presets";
import { exportVideoToWebm, downloadBlob } from "@/lib/export";
import { Download, Loader2, RotateCcw } from "lucide-react";

function totalDurationSec(
  clips: { durationSec?: number }[],
  voiceDurationSec?: number,
): number {
  if (voiceDurationSec && voiceDurationSec > 0) return voiceDurationSec;
  const sum = clips.reduce(
    (acc, c) =>
      acc + (c.durationSec && c.durationSec > 0 ? c.durationSec : 0),
    0,
  );
  if (sum > 0) return sum;
  return Math.max(1, clips.length) * 3;
}

export function StepPreview() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const content = useWizardStore((s) => s.content);
  const voice = useWizardStore((s) => s.voice);
  const clips = useWizardStore((s) => s.clips);
  const captions = useWizardStore((s) => s.captions);
  const resetWizard = useWizardStore((s) => s.resetWizard);

  const preset = getPresetById(captions.presetId);
  const total = useMemo(
    () => totalDurationSec(clips, voice.durationSec),
    [clips, voice.durationSec],
  );

  const handleExport = async () => {
    setError(null);
    setExporting(true);
    setProgress(0);
    try {
      const blob = await exportVideoToWebm({
        clips,
        voiceBlob: voice.blob,
        voiceUrl: voice.url,
        totalDurationSec: total,
        captions,
        sourceText: content.text,
        onProgress: setProgress,
      });
      downloadBlob(blob, `faisal-studio-${Date.now()}.webm`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Quick checklist before you export your short vertical reminder.
            </CardDescription>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-slate-700">Text</dt>
                <dd className="mt-0.5 text-slate-600 leading-relaxed">
                  {content.text || "—"}
                </dd>
                {content.reference ? (
                  <dd className="mt-1 text-xs text-gold-muted">
                    {content.reference}
                  </dd>
                ) : null}
              </div>
              <div>
                <dt className="font-medium text-slate-700">Audio</dt>
                <dd className="mt-0.5 text-slate-600">
                  {voice.url
                    ? `${voice.fileName ?? "Audio"} · ${voice.durationSec?.toFixed(1) ?? "?"}s`
                    : "Skipped (silent — timing from clips)"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Clips</dt>
                <dd className="mt-0.5 text-slate-600">
                  {clips.length} clip{clips.length === 1 ? "" : "s"} ·{" "}
                  {total.toFixed(1)}s timeline
                </dd>
                <div className="mt-2 flex flex-wrap gap-2">
                  {clips.map((c) => (
                    <div
                      key={c.id}
                      className="h-16 w-9 overflow-hidden rounded-md bg-slate-900 ring-1 ring-slate-200"
                    >
                      <video
                        src={c.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Captions</dt>
                <dd className="mt-0.5 text-slate-600">
                  {preset?.name ?? captions.presetId} · {captions.fontSize}px ·{" "}
                  {captions.position} · {captions.background} background
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardTitle>Export</CardTitle>
            <CardDescription>
              Browser-based export to <strong>WebM</strong> (codec support
              varies by browser). This MVP stitches visuals on a canvas and
              mixes your voice when possible.
            </CardDescription>
            {error ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}
            {exporting ? (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Loader2 className="h-4 w-4 animate-spin text-deen" />
                  Rendering… {Math.round(progress * 100)}%
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-deen transition-all"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="gap-2"
                  disabled={clips.length < 2}
                  onClick={() => void handleExport()}
                >
                  <Download className="h-4 w-4" />
                  Export video
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  onClick={resetWizard}
                >
                  <RotateCcw className="h-4 w-4" />
                  Start over
                </Button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Back home
                </Link>
              </div>
            )}
            {clips.length < 2 ? (
              <p className="mt-2 text-xs text-amber-700">
                Add at least two clips (step 3) to enable export.
              </p>
            ) : null}
          </Card>
        </div>

        <Card className="lg:sticky lg:top-24 h-fit">
          <CardTitle>Preview</CardTitle>
          <CardDescription>9:16 stage — how your reminder will feel.</CardDescription>
          <div className="mt-4">
            <VideoPreview
              clips={clips}
              voiceUrl={voice.url}
              voiceDurationSec={voice.durationSec}
              captions={captions}
              sourceText={content.text}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
