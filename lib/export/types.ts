/**
 * Export job types — keep stable for future MP4, bitrates, or quality presets.
 * MVP only renders WebM via `exportVideoToWebm`.
 */

/** Hook for future pipelines (MP4, bitrate presets). MVP uses canvas → WebM only. */
export type ExportPipelineId = "webm_canvas_v1";

export type ExportCodecHint = "webm_browser_default";

export type ExportAudioBed = {
  blob?: Blob;
  url?: string;
  enabled: boolean;
  /** 0–1 from UI; combined with internal caps so voice stays primary */
  volumeLinear: number;
};

export type ExportAudioMix = {
  voice?: { blob?: Blob; url?: string };
  bed?: ExportAudioBed;
};
