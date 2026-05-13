"use client";

import type { ClipItem, WizardCaptions } from "@/types";
import { getPresetById } from "@/lib/caption-presets";
import { getActiveCaptionState } from "@/lib/caption-state";

export type ExportOptions = {
  clips: ClipItem[];
  voiceBlob?: Blob;
  voiceUrl?: string;
  totalDurationSec: number;
  captions: WizardCaptions;
  sourceText: string;
  onProgress?: (ratio: number) => void;
};

function pickVideoMime(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) {
      return c;
    }
  }
  return "video/webm";
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  w: number,
  h: number,
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  if (!video.videoWidth || !video.videoHeight) return;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = Math.max(w / vw, h / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(video, dx, dy, dw, dh);
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

const DEEN_TEAL = "#0F766E";

/** Mirrors `lib/caption-style.ts` preset + background rules on canvas. */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  caps: WizardCaptions,
  canvasH: number,
  canvasW: number,
) {
  const preset = getPresetById(caps.presetId);
  const display = preset?.uppercase ? text.toUpperCase() : text;
  const fontFamily =
    preset?.fontFamily === "serif"
      ? "Cormorant Garamond, Georgia, serif"
      : "Inter, system-ui, sans-serif";
  const weight = preset?.fontWeight ?? 600;
  const padX = 32;
  const maxW = canvasW - padX * 2;
  ctx.font = `${weight} ${caps.fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = wrapLines(ctx, display, maxW);
  const lineHeight = caps.fontSize * 1.25;
  const blockH = lines.length * lineHeight;
  let startY =
    caps.position === "top"
      ? canvasH * 0.1
      : caps.position === "bottom"
        ? canvasH * 0.88 - blockH
        : canvasH / 2 - blockH / 2;

  const boxPad = 16;
  const boxW = maxW + boxPad;
  const boxH = blockH + boxPad;
  const boxX = canvasW / 2 - boxW / 2;
  const boxY = startY - boxPad / 2;

  if (caps.background === "solid") {
    if (caps.presetId === "deen-green") {
      ctx.fillStyle = DEEN_TEAL;
      const r = Math.min(boxH / 2, 28);
      fillRoundRect(ctx, boxX, boxY, boxW, boxH, r);
    } else if (caps.presetId === "bold-reminder") {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      fillRoundRect(ctx, boxX, boxY, boxW, boxH, 12);
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      fillRoundRect(ctx, boxX, boxY, boxW, boxH, 20);
    }
  } else if (caps.background === "blur") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    fillRoundRect(ctx, boxX, boxY, boxW, boxH, 20);
  } else if (caps.background === "gradient") {
    const g = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
    g.addColorStop(0, "rgba(0,0,0,0.75)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(boxX, boxY, boxW, boxH);
  }

  ctx.fillStyle = caps.color;
  lines.forEach((ln, i) => {
    const y = startY + i * lineHeight + lineHeight / 2;
    if (caps.background === "none") {
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fillText(ln, canvasW / 2, y);
  });
  ctx.shadowBlur = 0;
}

async function ensureCaptionFontsLoaded(caps: WizardCaptions): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.ready) return;
  const preset = getPresetById(caps.presetId);
  const weight = preset?.fontWeight ?? 600;
  const size = caps.fontSize;
  const faces =
    preset?.fontFamily === "serif"
      ? [`${weight} ${size}px Cormorant Garamond`]
      : [`${weight} ${size}px Inter`];
  try {
    await Promise.all(faces.map((f) => document.fonts.load(f)));
  } catch {
    /* ignore */
  }
  await document.fonts.ready;
}

function loadVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.src = url;
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.onloadeddata = () => resolve(v);
    v.onerror = () => reject(new Error("Failed to load video"));
  });
}

/**
 * Renders clips + captions to canvas and muxes optional voice audio into a WebM.
 * Runs fully in the browser; quality depends on device and codec support.
 */
export async function exportVideoToWebm(
  opts: ExportOptions,
): Promise<Blob> {
  const {
    clips,
    voiceBlob,
    voiceUrl,
    totalDurationSec,
    captions,
    sourceText,
    onProgress,
  } = opts;
  if (clips.length === 0) {
    throw new Error("Add at least one clip before exporting.");
  }

  await ensureCaptionFontsLoaded(captions);

  const W = 720;
  const H = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const videos = await Promise.all(clips.map((c) => loadVideo(c.url)));
  const total = Math.max(0.1, totalDurationSec);
  const seg = total / clips.length;
  const mime = pickVideoMime();
  const capturer = canvas.captureStream(30);
  const tracks = capturer.getVideoTracks();
  if (!tracks.length) throw new Error("Canvas produced no video track.");
  const videoTrack = tracks[0] as CanvasCaptureMediaStreamTrack;

  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let audioCtx: AudioContext | null = null;
  let bufferSource: AudioBufferSourceNode | null = null;

  const stream = new MediaStream([videoTrack!]);

  if (voiceBlob || voiceUrl) {
    try {
      audioCtx = new AudioContext();
      const buf = voiceBlob
        ? await voiceBlob.arrayBuffer()
        : await fetch(voiceUrl!).then((r) => r.arrayBuffer());
      const audioBuffer = await audioCtx.decodeAudioData(buf.slice(0));
      bufferSource = audioCtx.createBufferSource();
      bufferSource.buffer = audioBuffer;
      audioDest = audioCtx.createMediaStreamDestination();
      bufferSource.connect(audioDest);
      audioDest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      /* silent export if audio decode fails */
    }
  }

  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) recordedChunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("Recording failed"));
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, {
        type: mime.split(";")[0] || "video/webm",
      });
      resolve(blob);
    };
  });

  recorder.start(100);
  bufferSource?.start(0);

  const start = performance.now();
  let lastProgress = 0;

  await new Promise<void>((resolveLoop) => {
    const step = () => {
      const elapsed = (performance.now() - start) / 1000;
      const t = Math.min(total, elapsed);
      if (t - lastProgress > 0.25) {
        lastProgress = t;
        onProgress?.(t / total);
      }

      const idx = Math.min(videos.length - 1, Math.floor(t / seg));
      const v = videos[idx];
      const localT = Math.max(0, t - idx * seg);
      if (v.duration && Number.isFinite(v.duration) && v.duration > 0.05) {
        v.currentTime = localT % v.duration;
      } else if (v.duration && Number.isFinite(v.duration)) {
        v.currentTime = Math.min(localT, Math.max(0.01, v.duration - 0.05));
      }

      drawCover(ctx, v, W, H);
      const tMs = t * 1000;
      const cap = getActiveCaptionState(captions, tMs, sourceText).text;
      drawCaption(ctx, cap, captions, H, W);

      videoTrack.requestFrame?.();

      if (t >= total) {
        recorder.stop();
        bufferSource?.stop();
        void audioCtx?.close();
        onProgress?.(1);
        resolveLoop();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  return done;
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
