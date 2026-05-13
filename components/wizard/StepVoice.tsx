"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { AudioPreview } from "@/components/voice/AudioPreview";
import { ReadingPrompter } from "@/components/voice/ReadingPrompter";
import { VoiceStagePreview } from "@/components/voice/VoiceStagePreview";
import { useWizardStore } from "@/lib/store";
import { splitTextIntoChunks } from "@/lib/chunk-text";
import { useVoicePlaybackUrl } from "@/hooks/useVoicePlaybackUrl";
import { Upload } from "lucide-react";
import type { ReadingMode } from "@/types";

type Tab = "record" | "upload";

export function StepVoice() {
  const [tab, setTab] = useState<Tab>("record");
  const inputRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const [readingMode, setReadingMode] = useState<ReadingMode>("auto");
  const [autoSecPerLine, setAutoSecPerLine] = useState(3);
  const [lineIndex, setLineIndex] = useState(0);

  const recordStartRef = useRef(0);
  const advanceTimesRef = useRef<number[]>([]);
  const lineIndexRef = useRef(0);

  const contentText = useWizardStore((s) => s.content.text);
  const captionChunks = useWizardStore((s) => s.captions.chunks);
  const captions = useWizardStore((s) => s.captions);
  const clips = useWizardStore((s) => s.clips);

  const promptLines = useMemo(() => {
    if (captionChunks.length > 0) {
      return captionChunks.map((c) => c.text);
    }
    return splitTextIntoChunks(contentText.trim());
  }, [captionChunks, contentText]);

  const promptLinesRef = useRef(promptLines);
  useEffect(() => {
    promptLinesRef.current = promptLines;
  }, [promptLines]);

  useEffect(() => {
    lineIndexRef.current = lineIndex;
  }, [lineIndex]);

  const voice = useWizardStore((s) => s.voice);
  const voicePlaybackUrl = useVoicePlaybackUrl(voice);
  const setVoiceFromFile = useWizardStore((s) => s.setVoiceFromFile);
  const clearVoice = useWizardStore((s) => s.clearVoice);
  const completeVoiceRecording = useWizardStore(
    (s) => s.completeVoiceRecording,
  );

  const currentOverlayLine =
    promptLines[lineIndex] ?? promptLines[0] ?? contentText.slice(0, 80);

  const handleRecordBegin = useCallback(() => {
    recordStartRef.current = performance.now();
    advanceTimesRef.current = [];
    lineIndexRef.current = 0;
    setLineIndex(0);
  }, []);

  useEffect(() => {
    if (!recording || tab !== "record" || readingMode !== "auto") return;
    const tick = () => {
      const lines = promptLinesRef.current;
      if (lines.length === 0) return;
      const elapsed = performance.now() - recordStartRef.current;
      const d = autoSecPerLine * 1000;
      const target = Math.min(lines.length - 1, Math.floor(elapsed / d));
      if (target > lineIndexRef.current) {
        for (let i = lineIndexRef.current; i < target; i++) {
          advanceTimesRef.current.push((i + 1) * d);
        }
        lineIndexRef.current = target;
        setLineIndex(target);
      }
    };
    const id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, [recording, tab, readingMode, autoSecPerLine]);

  const handleManualNext = useCallback(() => {
    if (!recording) return;
    const lines = promptLinesRef.current;
    if (lineIndexRef.current >= lines.length - 1) return;
    const elapsed = performance.now() - recordStartRef.current;
    advanceTimesRef.current.push(elapsed);
    lineIndexRef.current += 1;
    setLineIndex(lineIndexRef.current);
  }, [recording]);

  const handleRecorded = useCallback(
    (blob: Blob) => {
      const linesFull =
        promptLinesRef.current.length > 0
          ? promptLinesRef.current
          : contentText.trim()
            ? [contentText.trim()]
            : [" "];
      const wall = performance.now() - recordStartRef.current;
      const lastIdx = Math.min(
        lineIndexRef.current,
        Math.max(0, linesFull.length - 1),
      );
      const keptLines = linesFull.slice(0, lastIdx + 1);
      const readingLinesTotal = linesFull.length;

      let advancesKept: number[];
      if (readingMode === "auto") {
        advancesKept = [];
        for (let i = 1; i <= lastIdx; i++) {
          advancesKept.push(Math.min(i * autoSecPerLine * 1000, wall));
        }
      } else {
        advancesKept = advanceTimesRef.current.slice(0, lastIdx);
      }

      completeVoiceRecording({
        blob,
        fileName: "recording.webm",
        lines: keptLines,
        advanceTimesMs: advancesKept,
        wallDurationMs: Math.max(500, wall),
        readingMode,
        autoSecPerLine: readingMode === "auto" ? autoSecPerLine : undefined,
        sourceText: contentText,
        readingLinesTotal,
        readingLinesCovered: keptLines.length,
      });
    },
    [autoSecPerLine, completeVoiceRecording, contentText, readingMode],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <Card>
            <CardTitle>Guided narration</CardTitle>
            <CardDescription>
              Ab aapka layout tayar hai — yahan teleprompter se parh kar record
              karein. Line advance ki timing captions ke saath judegi. Sirf
              &quot;Record&quot; se yeh save hota hai; upload par waqt audio par
              barabar taqseem hoga.
            </CardDescription>
            <div className="mt-5">
              <ReadingPrompter
                lines={promptLines}
                lineIndex={lineIndex}
                readingMode={readingMode}
                onReadingMode={setReadingMode}
                autoSecPerLine={autoSecPerLine}
                onAutoSecPerLine={setAutoSecPerLine}
                recording={recording && tab === "record"}
                onManualNext={handleManualNext}
              />
            </div>
          </Card>

          <Card>
            <CardTitle>Record or upload</CardTitle>
            <CardDescription>
              Behtar natija ke liye record mode istemaal karein. Phir bhi agar
              file chahiye ho to upload — &quot;Replace&quot; se dubara try
              karna aasaan hai.
            </CardDescription>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant={tab === "record" ? "primary" : "secondary"}
                disabled={recording}
                onClick={() => setTab("record")}
              >
                Record
              </Button>
              <Button
                type="button"
                variant={tab === "upload" ? "primary" : "secondary"}
                disabled={recording}
                onClick={() => setTab("upload")}
              >
                Upload
              </Button>
            </div>

            <div className="mt-6">
              {tab === "record" ? (
                <VoiceRecorder
                  onRecordingChange={(active) => {
                    setRecording(active);
                    if (active) handleRecordBegin();
                  }}
                  onRecorded={handleRecorded}
                />
              ) : (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Choose audio file
                  </Button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setVoiceFromFile(f);
                      e.target.value = "";
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    WAV, MP3, M4A, or WebM — whatever your browser can decode.
                  </p>
                </div>
              )}
            </div>

            <AudioPreview
              url={voicePlaybackUrl}
              fileName={voice.fileName}
              durationSec={voice.durationSec}
              onReplace={clearVoice}
            />
            <p className="mt-3 text-xs text-slate-600">
              Pasand nah aaya? Replace dabain — jitni dafa chahen dubara record
              karein, jab tak flow set na ho jaye.
            </p>
            {voice.readingLinesTotal != null &&
            voice.readingLinesCovered != null &&
            voice.readingLinesCovered < voice.readingLinesTotal ? (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
                <p className="font-medium">Sirf recorded hissa final video mein</p>
                <p className="mt-1 text-amber-900/90">
                  Aap ne abhi tak {voice.readingLinesCovered} line
                  {voice.readingLinesCovered === 1 ? "" : "s"} cover ki hain (
                  {voice.readingLinesTotal} total). Baqi lines ke liye dubara record
                  karein.
                </p>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="order-1 lg:order-2">
          <VoiceStagePreview
            clips={clips}
            captions={captions}
            overlayLine={currentOverlayLine}
          />
        </div>
      </div>
    </div>
  );
}
