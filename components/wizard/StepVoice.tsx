"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { AudioPreview } from "@/components/voice/AudioPreview";
import { ReadingPrompter } from "@/components/voice/ReadingPrompter";
import { useWizardStore } from "@/lib/store";
import { splitTextIntoChunks } from "@/lib/chunk-text";
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
  const promptLines = useMemo(
    () => splitTextIntoChunks(contentText.trim()),
    [contentText],
  );

  const promptLinesRef = useRef(promptLines);
  useEffect(() => {
    promptLinesRef.current = promptLines;
  }, [promptLines]);

  useEffect(() => {
    lineIndexRef.current = lineIndex;
  }, [lineIndex]);

  const voice = useWizardStore((s) => s.voice);
  const setVoiceFromFile = useWizardStore((s) => s.setVoiceFromFile);
  const clearVoice = useWizardStore((s) => s.clearVoice);
  const completeVoiceRecording = useWizardStore(
    (s) => s.completeVoiceRecording,
  );

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
      const linesRaw = promptLinesRef.current;
      const lines =
        linesRaw.length > 0
          ? linesRaw
          : contentText.trim()
            ? [contentText.trim()]
            : [" "];
      const wall = performance.now() - recordStartRef.current;
      let advances = [...advanceTimesRef.current];
      if (readingMode === "auto") {
        advances = [];
        for (let i = 1; i <= lineIndexRef.current; i++) {
          advances.push(Math.min(i * autoSecPerLine * 1000, wall));
        }
      }
      completeVoiceRecording({
        blob,
        fileName: "recording.webm",
        lines,
        advanceTimesMs: advances,
        wallDurationMs: Math.max(500, wall),
        readingMode,
        autoSecPerLine: readingMode === "auto" ? autoSecPerLine : undefined,
        sourceText: contentText,
      });
    },
    [autoSecPerLine, completeVoiceRecording, contentText, readingMode],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Voice + reading mode</CardTitle>
        <CardDescription>
          Neeche apna text parhte hue record karein — line advance ki timing
          captions (Step 4) mein istemaal hogi. Upload par yeh timing save nahin
          hoti.
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
        <CardTitle>Add your voice</CardTitle>
        <CardDescription>
          Record in the browser or upload an audio file. You can skip this step
          for a silent preview — timings will follow your clips instead.
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
          url={voice.url}
          fileName={voice.fileName}
          durationSec={voice.durationSec}
          onReplace={clearVoice}
        />
      </Card>
    </div>
  );
}
