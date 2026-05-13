export type ReadingMode = "auto" | "manual";

export type CaptionDisplayMode = "full_line" | "word_by_word";

export type ContentType =
  | "hadith"
  | "quran"
  | "quote"
  | "dua"
  | "custom";

export type CaptionPosition = "top" | "middle" | "bottom";

export type CaptionBackground = "none" | "solid" | "blur" | "gradient";

export type ContentItem = {
  id: string;
  /** Main matn: hadith ka markazi jumla, ayat ka tarjuma, quote, dua */
  text: string;
  reference: string;
  /** Waqiya / sabab / maqam — ziyada tar hadith ke peeche ki kahani */
  story?: string;
  /** Tafseel, mafhoom zyada, ya quote ki wazehat */
  explanation?: string;
};

export type CaptionChunk = {
  text: string;
  startMs: number;
  endMs: number;
};

export type ClipItem = {
  id: string;
  file: File;
  url: string;
  durationSec?: number;
};

export type WizardContent = {
  type: ContentType;
  selectedId?: string;
  text: string;
  reference?: string;
};

export type WizardVoice = {
  blob?: Blob;
  url?: string;
  durationSec?: number;
  fileName?: string;
  /** In-app recording: caption chunks timed from reading / line advances */
  readingCaptionChunks?: CaptionChunk[];
  /** Snapshot of `content.text` when reading timings were captured */
  readingTimingSourceText?: string;
  readingMode?: ReadingMode;
  autoSecPerLine?: number;
};

export type WizardCaptions = {
  presetId: string;
  fontSize: number;
  color: string;
  position: CaptionPosition;
  background: CaptionBackground;
  displayMode: CaptionDisplayMode;
  chunks: CaptionChunk[];
};
