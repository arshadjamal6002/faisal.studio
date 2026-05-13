"use client";

import { useEffect } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { CaptionPresets } from "@/components/captions/CaptionPresets";
import { CaptionEditor } from "@/components/captions/CaptionEditor";
import { CaptionPreview } from "@/components/captions/CaptionPreview";
import { useWizardStore } from "@/lib/store";

export function StepCaptions() {
  const content = useWizardStore((s) => s.content);
  const voiceDuration = useWizardStore((s) => s.voice.durationSec);
  const clipDurKey = useWizardStore((s) =>
    s.clips.map((c) => c.durationSec ?? "").join(","),
  );
  const captions = useWizardStore((s) => s.captions);
  const regenerateChunks = useWizardStore((s) => s.regenerateChunks);
  const applyCaptionPreset = useWizardStore((s) => s.applyCaptionPreset);
  const setCaptionFontSize = useWizardStore((s) => s.setCaptionFontSize);
  const setCaptionColor = useWizardStore((s) => s.setCaptionColor);
  const setCaptionPosition = useWizardStore((s) => s.setCaptionPosition);
  const setCaptionBackground = useWizardStore((s) => s.setCaptionBackground);
  const setCaptionDisplayMode = useWizardStore((s) => s.setCaptionDisplayMode);
  const readingKey = useWizardStore(
    (s) =>
      `${s.voice.readingTimingSourceText ?? ""}|${s.voice.readingCaptionChunks?.length ?? 0}|${s.voice.durationSec ?? ""}`,
  );

  useEffect(() => {
    regenerateChunks();
  }, [
    regenerateChunks,
    content.text,
    content.reference,
    voiceDuration,
    clipDurKey,
    readingKey,
  ]);

  const sample =
    captions.chunks[0]?.text?.slice(0, 120) ||
    content.text.slice(0, 120) ||
    "Your reminder";

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Caption style</CardTitle>
        <CardDescription>
          Subtitles aap ke text se aati hain. Agar Step 4 par recording ke saath
          reading mode use ki ho to timing wahan se milti hai — warna audio par
          barabar taqseem.
        </CardDescription>
        <div className="mt-5">
          <CaptionPresets
            activeId={captions.presetId}
            onSelect={applyCaptionPreset}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Customize</CardTitle>
          <CardDescription>Adjust to match your brand or mood.</CardDescription>
          <div className="mt-4">
            <CaptionEditor
              fontSize={captions.fontSize}
              color={captions.color}
              position={captions.position}
              background={captions.background}
              displayMode={captions.displayMode}
              onFontSize={setCaptionFontSize}
              onColor={setCaptionColor}
              onPosition={setCaptionPosition}
              onBackground={setCaptionBackground}
              onDisplayMode={setCaptionDisplayMode}
            />
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center">
          <CaptionPreview captions={captions} sampleText={sample} />
          <p className="mt-4 text-center text-xs text-slate-500">
            {captions.chunks.length} on-screen segment
            {captions.chunks.length === 1 ? "" : "s"} from your text
          </p>
        </Card>
      </div>
    </div>
  );
}
