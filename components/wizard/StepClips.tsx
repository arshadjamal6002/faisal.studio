"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { ClipUploader } from "@/components/clips/ClipUploader";
import { ClipCard } from "@/components/clips/ClipCard";
import { useWizardStore } from "@/lib/store";
import { useCallback } from "react";

export function StepClips() {
  const clips = useWizardStore((s) => s.clips);
  const addClips = useWizardStore((s) => s.addClips);
  const removeClip = useWizardStore((s) => s.removeClip);
  const moveClip = useWizardStore((s) => s.moveClip);
  const setClipDuration = useWizardStore((s) => s.setClipDuration);

  const onDuration = useCallback(
    (id: string, sec: number) => setClipDuration(id, sec),
    [setClipDuration],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Background clips</CardTitle>
        <CardDescription>
          Upload <strong>2 to 5</strong> short vertical-friendly clips. Final
          output is <strong>9:16</strong> — we&apos;ll crop to cover during
          export. Clips are sequenced in the order below and timed to match your
          voice length (or clip durations if you skipped audio).
        </CardDescription>
        <div className="mt-5">
          <ClipUploader
            onFiles={addClips}
            maxFiles={5}
            currentCount={clips.length}
          />
        </div>
        <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          Need at least <strong>2 clips</strong> to continue. Maximum{" "}
          <strong>5</strong>.
        </p>
      </Card>

      {clips.length > 0 ? (
        <Card>
          <CardTitle>Your clips</CardTitle>
          <CardDescription>Reorder with the arrows. First clip plays first.</CardDescription>
          <div className="mt-4 space-y-3">
            {clips.map((c, i) => (
              <ClipCard
                key={c.id}
                clip={c}
                index={i}
                total={clips.length}
                onRemove={() => removeClip(c.id)}
                onMoveUp={() => moveClip(c.id, "up")}
                onMoveDown={() => moveClip(c.id, "down")}
                onDuration={(sec) => onDuration(c.id, sec)}
              />
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
