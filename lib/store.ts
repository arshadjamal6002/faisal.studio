"use client";

import { create } from "zustand";
import type {
  CaptionChunk,
  CaptionPosition,
  CaptionBackground,
  ClipItem,
  ContentType,
  ReadingMode,
  WizardContent,
  WizardVoice,
  WizardCaptions,
  CaptionDisplayMode,
} from "@/types";
import { buildCaptionChunksFromText } from "@/lib/chunk-text";
import {
  finalizeLineBoundaries,
  lineBoundariesToChunks,
  scaleCaptionChunks,
} from "@/lib/reading-timing";
import { CAPTION_PRESETS, getPresetById } from "@/lib/caption-presets";
import { silentClipTimelineMs } from "@/lib/timeline";
import { probeAudioDurationSecFromBlob } from "@/lib/voice-duration";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

const DEFAULT_PRESET_ID = CAPTION_PRESETS[0].id;

function stripReadingIfTextChanged(
  voice: WizardVoice,
  newText: string,
): WizardVoice {
  if (
    !voice.readingTimingSourceText ||
    voice.readingTimingSourceText === newText
  ) {
    return voice;
  }
  const {
    readingCaptionChunks: _c,
    readingTimingSourceText: _t,
    readingMode: _m,
    autoSecPerLine: _a,
    readingLinesTotal: _lt,
    readingLinesCovered: _lc,
    ...rest
  } = voice;
  return rest;
}

function revokeUrl(url: string | undefined) {
  if (url?.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
}

type WizardState = {
  step: WizardStep;
  content: WizardContent;
  voice: WizardVoice;
  clips: ClipItem[];
  captions: WizardCaptions;

  setStep: (s: WizardStep) => void;
  next: () => void;
  back: () => void;

  setContentType: (t: ContentType) => void;
  selectDatasetItem: (id: string, text: string, reference: string) => void;
  setCustomText: (text: string) => void;
  setCustomReference: (ref: string) => void;

  setVoiceFromBlob: (blob: Blob, fileName?: string) => void;
  setVoiceFromFile: (file: File) => void;
  clearVoice: () => void;

  addClips: (files: File[]) => void;
  removeClip: (id: string) => void;
  moveClip: (id: string, direction: "up" | "down") => void;
  setClipDuration: (id: string, sec: number) => void;

  applyCaptionPreset: (presetId: string) => void;
  setCaptionFontSize: (n: number) => void;
  setCaptionColor: (c: string) => void;
  setCaptionPosition: (p: CaptionPosition) => void;
  setCaptionBackground: (b: CaptionBackground) => void;
  setCaptionDisplayMode: (m: CaptionDisplayMode) => void;
  regenerateChunks: () => void;

  completeVoiceRecording: (payload: {
    blob: Blob;
    fileName?: string;
    lines: string[];
    advanceTimesMs: number[];
    wallDurationMs: number;
    readingMode: ReadingMode;
    autoSecPerLine?: number;
    sourceText: string;
    readingLinesTotal: number;
    readingLinesCovered: number;
  }) => void;

  resetWizard: () => void;
};

const initialContent: WizardContent = {
  type: "hadith",
  text: "",
  reference: "",
};

const initialVoice: WizardVoice = {};

const initialCaptions = (): WizardCaptions => {
  const p = getPresetById(DEFAULT_PRESET_ID)!;
  return {
    presetId: p.id,
    fontSize: p.defaultFontSize,
    color: p.defaultColor,
    position: p.defaultPosition,
    background: p.defaultBackground,
    displayMode: "full_line",
    chunks: [],
  };
};

export const useWizardStore = create<WizardState>((set, get) => ({
  step: 1,
  content: { ...initialContent },
  voice: { ...initialVoice },
  clips: [],
  captions: initialCaptions(),

  setStep: (s) => set({ step: s }),

  next: () => {
    const { step } = get();
    if (step < 5) set({ step: (step + 1) as WizardStep });
  },

  back: () => {
    const { step } = get();
    if (step > 1) set({ step: (step - 1) as WizardStep });
  },

  setContentType: (type) => {
    const state = get();
    if (type === state.content.type) return;
    if (type === "custom") {
      set({
        content: {
          type: "custom",
          selectedId: undefined,
          text: state.content.text,
          reference: state.content.reference ?? "",
        },
      });
      return;
    }
    set({
      content: {
        type,
        selectedId: undefined,
        text: "",
        reference: "",
      },
    });
  },

  selectDatasetItem: (id, text, reference) =>
    set((state) => {
      const voice = stripReadingIfTextChanged(state.voice, text.trim());
      return {
        content: {
          ...state.content,
          selectedId: id,
          text,
          reference,
        },
        voice,
      };
    }),

  setCustomText: (text) =>
    set((state) => {
      const voice = stripReadingIfTextChanged(state.voice, text.trim());
      return {
        content: {
          ...state.content,
          type: "custom",
          text,
          selectedId: undefined,
        },
        voice,
      };
    }),

  setCustomReference: (reference) =>
    set((state) => ({
      content: { ...state.content, reference },
    })),

  setVoiceFromBlob: (blob, fileName) => {
    const prev = get().voice.url;
    revokeUrl(prev);
    const url = URL.createObjectURL(blob);
    set({
      voice: { blob, url, fileName: fileName ?? "recording.webm" },
    });

    const applyDuration = (sec: number) => {
      if (!Number.isFinite(sec) || sec <= 0) return;
      set((s) => {
        if (s.voice.url !== url) return s;
        return { voice: { ...s.voice, durationSec: sec } };
      });
      get().regenerateChunks();
    };

    const audio = new Audio(url);
    audio.addEventListener(
      "loadedmetadata",
      () => {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
        applyDuration(audio.duration);
      },
      { once: true },
    );

    void (async () => {
      const probed = await probeAudioDurationSecFromBlob(blob);
      if (probed != null) applyDuration(probed);
    })();
  },

  setVoiceFromFile: (file) => {
    get().setVoiceFromBlob(file, file.name);
  },

  clearVoice: () => {
    const prev = get().voice.url;
    revokeUrl(prev);
    set({ voice: {} });
  },

  addClips: (files) => {
    const current = get().clips;
    const room = 5 - current.length;
    if (room <= 0) return;
    const toAdd = files.slice(0, room);
    const newItems: ClipItem[] = toAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    set({ clips: [...current, ...newItems] });
  },

  removeClip: (id) => {
    const clip = get().clips.find((c) => c.id === id);
    if (clip) revokeUrl(clip.url);
    set({ clips: get().clips.filter((c) => c.id !== id) });
  },

  moveClip: (id, direction) => {
    const list = [...get().clips];
    const i = list.findIndex((c) => c.id === id);
    if (i < 0) return;
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set({ clips: list });
  },

  setClipDuration: (id, sec) =>
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === id ? { ...c, durationSec: sec } : c,
      ),
    })),

  applyCaptionPreset: (presetId) => {
    const p = getPresetById(presetId);
    if (!p) return;
    set((state) => ({
      captions: {
        ...state.captions,
        presetId: p.id,
        fontSize: p.defaultFontSize,
        color: p.defaultColor,
        position: p.defaultPosition,
        background: p.defaultBackground,
      },
    }));
    get().regenerateChunks();
  },

  setCaptionFontSize: (fontSize) =>
    set((state) => ({ captions: { ...state.captions, fontSize } })),

  setCaptionColor: (color) =>
    set((state) => ({ captions: { ...state.captions, color } })),

  setCaptionPosition: (position) =>
    set((state) => ({ captions: { ...state.captions, position } })),

  setCaptionBackground: (background) =>
    set((state) => ({ captions: { ...state.captions, background } })),

  setCaptionDisplayMode: (displayMode) =>
    set((state) => ({ captions: { ...state.captions, displayMode } })),

  regenerateChunks: () => {
    const { content, voice, clips } = get();
    const text = content.text.trim();

    const useReading =
      voice.readingCaptionChunks &&
      voice.readingCaptionChunks.length > 0 &&
      voice.readingTimingSourceText === text;

    if (useReading) {
      const raw = voice.readingCaptionChunks!.map((c) => ({ ...c }));
      const rawEnd = raw.length ? raw[raw.length - 1].endMs : 0;
      const audioMs = (voice.durationSec ?? 0) * 1000;
      /** Narration only — never stretch reading timings to clip length */
      const targetMs =
        audioMs > 0 ? audioMs : rawEnd > 0 ? rawEnd : 0;

      let chunks: CaptionChunk[];
      if (targetMs > 0 && rawEnd > 0 && Math.abs(rawEnd - targetMs) > 80) {
        chunks = scaleCaptionChunks(raw, targetMs);
      } else {
        chunks = raw;
      }
      set((state) => ({ captions: { ...state.captions, chunks } }));
      return;
    }

    const audioMs = (voice.durationSec ?? 0) * 1000;
    if (audioMs > 0) {
      const chunks: CaptionChunk[] = buildCaptionChunksFromText(text, audioMs);
      set((state) => ({ captions: { ...state.captions, chunks } }));
      return;
    }

    const clipMs = silentClipTimelineMs(clips);
    const chunks: CaptionChunk[] = buildCaptionChunksFromText(
      text,
      clipMs > 0 ? clipMs : 0,
    );
    set((state) => ({ captions: { ...state.captions, chunks } }));
  },

  completeVoiceRecording: (payload) => {
    const {
      blob,
      fileName,
      lines,
      advanceTimesMs,
      wallDurationMs,
      readingMode,
      autoSecPerLine,
      sourceText,
      readingLinesTotal,
      readingLinesCovered,
    } = payload;
    const prev = get().voice.url;
    revokeUrl(prev);
    const url = URL.createObjectURL(blob);
    const bounds = finalizeLineBoundaries(
      lines.length,
      advanceTimesMs,
      wallDurationMs,
    );
    let chunks = lineBoundariesToChunks(lines, bounds);

    const wallSec = Math.max(0.1, wallDurationMs / 1000);

    set({
      voice: {
        blob,
        url,
        fileName: fileName ?? "recording.webm",
        /** Wall clock until `loadedmetadata` / decode refines (keeps preview/export audio-led). */
        durationSec: wallSec,
        readingCaptionChunks: chunks,
        readingTimingSourceText: sourceText.trim(),
        readingMode,
        autoSecPerLine,
        readingLinesTotal,
        readingLinesCovered,
      },
    });
    get().regenerateChunks();

    const audio = new Audio(url);
    audio.addEventListener(
      "loadedmetadata",
      () => {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
        const durMs = audio.duration * 1000;
        set((s) => {
          const ch = s.voice.readingCaptionChunks;
          if (!ch?.length) {
            return { voice: { ...s.voice, durationSec: audio.duration } };
          }
          const scaled = scaleCaptionChunks(ch, durMs);
          return {
            voice: {
              ...s.voice,
              durationSec: audio.duration,
              readingCaptionChunks: scaled,
            },
          };
        });
        get().regenerateChunks();
      },
      { once: true },
    );
  },

  resetWizard: () => {
    const { voice, clips } = get();
    revokeUrl(voice.url);
    clips.forEach((c) => revokeUrl(c.url));
    set({
      step: 1,
      content: { ...initialContent },
      voice: { ...initialVoice },
      clips: [],
      captions: initialCaptions(),
    });
  },
}));
