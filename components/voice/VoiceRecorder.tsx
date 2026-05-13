"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  onRecorded: (blob: Blob) => void;
  onRecordingChange?: (active: boolean) => void;
  disabled?: boolean;
};

function pickMimeType(): string | undefined {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t));
}

export function VoiceRecorder({
  onRecorded,
  onRecordingChange,
  disabled,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      onRecordingChange?.(false);
      mediaRef.current.stop();
    }
    stopStream();
    setRecording(false);
  }, [stopStream, onRecordingChange]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = pickMimeType();
      const rec = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      mediaRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        onRecorded(blob);
        chunksRef.current = [];
        mediaRef.current = null;
      };
      rec.start();
      onRecordingChange?.(true);
      setRecording(true);
    } catch {
      setError("Microphone access was denied or not available.");
    }
  }, [onRecorded, onRecordingChange]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <Button
            type="button"
            variant="primary"
            disabled={disabled}
            onClick={startRecording}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Start recording
          </Button>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={stopRecording}
            className="gap-2"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop
          </Button>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-slate-500">
        Recording stays on your device. No upload to a server in this MVP.
      </p>
    </div>
  );
}
