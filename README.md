# Faisal Studio

A **frontend-first MVP** for creating short **vertical (9:16)** Islamic reminder videos (hadith, Quran, quotes, duas, or custom text) — entirely in the **browser**, with **no paid APIs** and **Vercel-friendly** static deployment.

## Features

- **5-step builder**: Content → Voice → Clips → Captions → Preview & export
- **Local sample libraries** for hadith, Quran verses, quotes, and duas (`data/`)
- **Custom text** with optional reference
- **Voice**: in-browser recording (`MediaRecorder`) or audio file upload, with preview and replace
- **Clips**: 2–5 videos, reorder, thumbnails + duration
- **Captions**: chunks from your **source text** (no speech-to-text); presets + size / color / position / background
- **Preview**: sequenced clips with caption overlay
- **Export**: basic **WebM** download via canvas `captureStream` + `MediaRecorder` (codec support varies by browser)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub/GitLab.
2. Import the project in Vercel (framework: **Next.js**).
3. Default build command `next build` and output `.next` — no env vars required.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (wizard state, including `Blob` / `File` handles)
- Lucide icons

## Project structure

- `app/` — routes (`/`, `/create`)
- `components/` — UI, wizard steps, content/voice/clips/captions/preview
- `lib/` — store, caption helpers, chunking, export
- `data/` — extendable placeholder content datasets

## Out of scope (MVP)

- **No server-side video pipeline** or paid transcoding
- **No** auth or cloud project save (state is in-memory until refresh)
- **No** speech-to-text; caption timing is **evenly distributed** from your text and total duration (voice or clips)
- Export quality depends on **device and browser codecs**; WebM is not universal on every platform
- Clip “merge” is **time-sliced** across the timeline (not a full FFmpeg-style edit)

## Security note

This template pins Next.js 14.2.x. Check [Next.js security advisories](https://nextjs.org/blog) and upgrade to a patched release when you maintain the project.

## License

MIT (or your choice — this MVP is unlicensed unless you add one).
