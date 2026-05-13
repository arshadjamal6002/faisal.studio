---
name: faisal-studio-mvp
overview: "Build a Next.js + Tailwind frontend MVP for Faisal Studio: a 5-step, mobile-friendly wizard that lets users create short vertical Islamic reminder videos entirely in the browser (no paid APIs), with a basic MediaRecorder-based browser export to .webm."
todos:
  - id: scaffold
    content: Scaffold Next.js 14 + TypeScript + Tailwind project, configure fonts (Inter, Cormorant), palette, and base layout
    status: completed
  - id: store
    content: Set up Zustand wizard store and TypeScript types in lib/store.ts + types/index.ts
    status: completed
  - id: ui-kit
    content: Build reusable UI primitives (Button, Card, Input, Textarea, Select, Slider) in components/ui/
    status: completed
  - id: wizard-shell
    content: Build WizardShell + Stepper with Back/Next nav, mobile-friendly responsive layout, and route at app/create/page.tsx
    status: completed
  - id: landing
    content: Build calm landing page (app/page.tsx) with hero and 'Start creating' CTA
    status: completed
  - id: data
    content: "Create local datasets: data/hadith.ts, quran.ts, quotes.ts, duas.ts (~5 items each)"
    status: completed
  - id: step1-content
    content: "Implement Step 1: content type picker, dataset list cards, and custom text + reference textarea"
    status: completed
  - id: step2-voice
    content: "Implement Step 2: VoiceRecorder (MediaRecorder), audio upload, playback preview, re-record/replace"
    status: completed
  - id: step3-clips
    content: "Implement Step 3: clip uploader (2-5 enforced), ClipCard with thumbnail/duration/remove/reorder"
    status: completed
  - id: chunk-text
    content: Build lib/chunk-text.ts to split source text into subtitle chunks and distribute timings
    status: completed
  - id: step4-captions
    content: "Implement Step 4: 4 caption presets, editor (size/color/position/background), live CaptionPreview"
    status: completed
  - id: step5-preview
    content: "Implement Step 5: summary, 9:16 VideoPreview (sequenced clips + audio + caption overlay)"
    status: completed
  - id: export
    content: "Implement lib/export.ts: canvas render loop + MediaRecorder + audio mixing -> .webm download"
    status: completed
  - id: readme
    content: Write README with run/deploy instructions and 'Out of Scope' notes
    status: completed
isProject: false
---

## Stack & Setup

- **Framework**: Next.js 14 (App Router) + TypeScript — Vercel-native, free tier friendly.
- **Styling**: Tailwind CSS with a calm Islamic-reminder palette (cream `#FAF7F2`, deen green `#0F766E`, muted gold `#C9A24A`, slate text). Inter for UI, a serif (e.g., Cormorant) for content rendering.
- **State**: Zustand (~1KB) for wizard state across steps — needed because we carry `Blob`/`File` objects (audio + clips) that can't go in URL params.
- **Icons**: `lucide-react` (free, tree-shakeable).
- **Browser APIs only**: `MediaRecorder` for voice, `FileReader`/object URLs for clips, `<canvas>` + `captureStream()` + `MediaRecorder` for export. No paid APIs, no server work.

## App Name

Will use **Faisal Studio** throughout (branding, `<title>`, header logo).

## File Structure

```
app/
  layout.tsx               # Fonts, global shell
  page.tsx                 # Landing -> "Start creating"
  create/page.tsx          # Wizard container (reads step from store)
  globals.css

components/
  wizard/
    WizardShell.tsx        # Stepper + nav + footer (Back/Next)
    Stepper.tsx            # 5-dot progress bar
    StepContent.tsx        # Step 1
    StepVoice.tsx          # Step 2
    StepClips.tsx          # Step 3
    StepCaptions.tsx       # Step 4
    StepPreview.tsx        # Step 5
  content/                 # ContentTypePicker, ContentItemCard
  voice/                   # VoiceRecorder, AudioPreview
  clips/                   # ClipUploader, ClipCard (drag-reorder)
  captions/                # CaptionPresets, CaptionEditor, CaptionPreview
  preview/                 # VideoPreview (9:16 stage), ExportPanel
  ui/                      # Button, Card, Textarea, Input, Select, Slider

lib/
  store.ts                 # Zustand wizard store
  caption-presets.ts       # 4 presets
  chunk-text.ts            # Split source text into subtitle chunks
  export.ts                # Canvas + MediaRecorder export helper

data/
  hadith.ts  quran.ts  quotes.ts  duas.ts   # ~5 placeholder items each

types/index.ts
```

## Wizard State (Zustand)

```ts
type WizardState = {
  step: 1 | 2 | 3 | 4 | 5;
  content: { type: ContentType; selectedId?: string; text: string; reference?: string };
  voice:   { blob?: Blob; url?: string; durationSec?: number };
  clips:   { id: string; file: File; url: string }[];   // order = array order
  captions:{ presetId: string; fontSize: number; color: string;
             position: 'top'|'middle'|'bottom';
             background: 'none'|'solid'|'blur'|'gradient';
             chunks: { text: string; startMs: number; endMs: number }[] };
  // actions: setStep, next, back, setContent, setVoice, addClips, reorderClips,
  //          removeClip, setCaptions, regenerateChunks
};
```

`regenerateChunks` calls `chunk-text.ts` to split `content.text` into ~5-7 word chunks and evenly distribute them across `voice.durationSec` (fallback: ~2.2s per chunk if no audio yet). This makes content text **reusable as captions** as required.

## Step Details

**Step 1 — Content** (`StepContent.tsx`)
- `ContentTypePicker` shows 5 cards: Hadith, Quran Verse, Islamic Quote, Dua, Custom Text.
- For the 4 dataset types: render a scrollable list of `ContentItemCard`s from `data/*.ts` (each item: `{ id, text, reference }`). Click selects it.
- For Custom Text: large `<Textarea>` + optional `Reference` input.
- "Next" disabled until `content.text.trim()` is non-empty.

**Step 2 — Voice** (`StepVoice.tsx` + `VoiceRecorder`)
- Tabs: **Record** | **Upload**.
- Record: uses `navigator.mediaDevices.getUserMedia({ audio: true })` + `MediaRecorder` → produces a `Blob`, stores object URL + duration.
- Upload: `<input type="file" accept="audio/*">`.
- `AudioPreview` shows an `<audio controls>` with the URL and a "Re-record / Replace" button that clears state.
- Optional skip (silent video allowed) — caption timing then falls back to default per-chunk duration.

**Step 3 — Clips** (`StepClips.tsx` + `ClipUploader` + `ClipCard`)
- Drop-zone / file input, `accept="video/*"`, multi-select, **enforce 2–5 clips total** (block adding past 5; warn under 2 when leaving step).
- Each `ClipCard`: thumbnail (`<video>` first-frame), filename, duration, remove button, up/down arrows for reorder (keeps it simple and mobile-friendly; no DnD lib needed for MVP).
- Note line: "Final video is vertical 9:16. Clips will be auto-cropped to fit and trimmed to match your voice length." (UI hint only — actual trimming happens at export.)

**Step 4 — Captions** (`StepCaptions.tsx`)
- Left/top: `CaptionPresets` with 4 cards (live mini-preview of each style):
  - **Minimal White** — Inter 600, white, drop shadow, no bg.
  - **Elegant Gold** — Cormorant serif, `#C9A24A`, subtle dark translucent bg.
  - **Deen Green** — Inter 700, white text on `#0F766E` rounded pill.
  - **Bold Reminder** — Inter 800, black text on white bar, uppercase.
- Right/below: `CaptionEditor` with controls — font size (slider 16–56px), color (color picker, overrides preset), position (top/middle/bottom segmented control), background (none/solid/blur/gradient).
- `CaptionPreview` shows a 9:16 mock frame with current chunk and styling applied live.
- Chunks auto-regenerate from `content.text` when entering this step.

**Step 5 — Preview & Export** (`StepPreview.tsx`)
- **Summary panel** (read-only cards): selected text + reference, audio name/duration, clip count + thumbnails, caption preset/style.
- **VideoPreview** stage (9:16, max-h 70vh): renders the first clip in a `<video>` element, sequentially switching `src` when each clip's allotted time ends, with audio played from a hidden `<audio>` element and current caption chunk overlayed via CSS. This is the live preview — pure DOM, no canvas yet.
- **Export button**: triggers `lib/export.ts` flow:
  1. Compute total duration = `voice.durationSec` (or sum of clip durations if no voice).
  2. Per-clip slice = total / clipCount.
  3. Create an offscreen `<canvas width=720 height=1280>`.
  4. Start a render loop: for each frame, draw the currently-active clip's `<video>` element (cover-cropped to 9:16), then draw the active caption chunk text with the chosen style.
  5. `canvas.captureStream(30)` → combine with `MediaStreamTrack` from `voice` audio (via `AudioContext` + `createMediaStreamDestination` so the audio Blob plays through) → feed to `MediaRecorder({ mimeType: 'video/webm;codecs=vp9,opus' })`.
  6. On stop: bundle chunks into a Blob and trigger a download (`faisal-studio-<timestamp>.webm`).
- Show progress UI ("Rendering…") and a final "Download" + "Start over" CTA.

## Local Datasets (`data/*.ts`)

Each file exports `~5` items shaped `{ id, text, reference }`. Plain TypeScript constants so they're easy to extend later. Examples:
- `hadith.ts`: well-known authentic hadiths (Bukhari/Muslim references).
- `quran.ts`: short verses with `Surah:Ayah` references.
- `quotes.ts`: classical scholar reminders.
- `duas.ts`: short daily duas.

## Design Direction

- Soft cream background, white cards with `shadow-sm` + `rounded-2xl`, generous spacing.
- Single accent (deen green) for primary CTAs; gold used sparingly for highlights.
- Stepper at top of wizard pages with 5 labeled steps; current step is filled green, completed are check-marked, future are muted.
- Fully responsive: wizard becomes a single vertical column on mobile, two-column (controls + preview) on `md+`.
- No flashy gradients/animations beyond subtle `transition` on hover/focus.

## Free / Vercel Compatibility

- No backend, no API routes — pure client app.
- No paid SDKs.
- All processing (recording, preview, export) runs in the browser.
- Vercel deploy = `next build` only.

## Out of Scope (Explicitly Noted in README)

- Real video trimming/concatenation beyond the per-clip time-slicing in the export loop (good enough for MVP).
- Speech-to-text auto subtitle timing (we chunk from source text instead — by design).
- Server-side rendering pipelines / paid encoding services.
- Auth, saving projects across sessions (state lives in memory only).