import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Sparkles, Mic, Film, Type, Download } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-slate-900">
            Faisal<span className="text-deen"> Studio</span>
          </span>
          <Link
            href="/create"
            className="text-sm font-medium text-deen hover:text-deen-dark"
          >
            Open builder
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-deen">
            Short-form Islamic reminders
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Create vertical reminder videos, gently guided.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Faisal Studio helps you turn text, your voice, and a few clips into
            a calm 9:16 video — in the browser, with free tools only.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-deen px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-deen-dark"
            >
              Start creating
            </Link>
            <p className="text-sm text-slate-500">No sign-up · Works on mobile</p>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-2">
          <Card>
            <Sparkles className="mb-3 h-8 w-8 text-gold-muted" aria-hidden />
            <CardTitle>Guided steps</CardTitle>
            <CardDescription>
              Content → voice → clips → captions → preview. Stay focused without
              a cluttered editor.
            </CardDescription>
          </Card>
          <Card>
            <Mic className="mb-3 h-8 w-8 text-deen" aria-hidden />
            <CardTitle>Record or upload</CardTitle>
            <CardDescription>
              Capture voice in the browser or bring your own audio file with a
              simple preview and replace flow.
            </CardDescription>
          </Card>
          <Card>
            <Film className="mb-3 h-8 w-8 text-deen" aria-hidden />
            <CardTitle>2–5 vertical clips</CardTitle>
            <CardDescription>
              Reorder short clips and keep the timeline aligned with your voice
              (or clip length if you skip audio).
            </CardDescription>
          </Card>
          <Card>
            <Type className="mb-3 h-8 w-8 text-gold-muted" aria-hidden />
            <CardTitle>Captions from your text</CardTitle>
            <CardDescription>
              No paid speech-to-text. Your chosen ayah, hadith, or custom text
              becomes timed subtitle chunks.
            </CardDescription>
          </Card>
        </div>

        <Card className="mx-auto mt-8 max-w-4xl border-deen/20 bg-white">
          <Download className="mb-3 h-8 w-8 text-deen" aria-hidden />
          <CardTitle>Export in the browser</CardTitle>
          <CardDescription>
            MVP export renders a WebM from the canvas plus your voice when your
            browser supports it — ready to extend with heavier processing later.
          </CardDescription>
        </Card>
      </main>

      <footer className="border-t border-slate-200/80 py-8 text-center text-sm text-slate-500">
        Faisal Studio — a frontend-first MVP for daily reminder creators.
      </footer>
    </div>
  );
}
