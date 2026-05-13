"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { ClipUploader } from "@/components/clips/ClipUploader";
import { ClipCard } from "@/components/clips/ClipCard";
import { Button } from "@/components/ui/Button";
import { useWizardStore } from "@/lib/store";

type ClipTab = "upload" | "instagram";

const IMPORT_FALLBACK =
  "Couldn't import this link. You can upload the clip manually instead.";

function parseInstagramLinkLines(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const u = line.trim();
    if (!u) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

export function StepClips() {
  const clips = useWizardStore((s) => s.clips);
  const addClips = useWizardStore((s) => s.addClips);
  const addClipFromBlob = useWizardStore((s) => s.addClipFromBlob);
  const removeClip = useWizardStore((s) => s.removeClip);
  const moveClip = useWizardStore((s) => s.moveClip);
  const setClipDuration = useWizardStore((s) => s.setClipDuration);

  const [tab, setTab] = useState<ClipTab>("upload");
  const [linkText, setLinkText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<{ url: string; hint: string }[]>(
    [],
  );
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<string | null>(null);

  const roomLeft = useMemo(() => Math.max(0, 5 - clips.length), [clips.length]);

  const onDuration = useCallback(
    (id: string, sec: number) => setClipDuration(id, sec),
    [setClipDuration],
  );

  const handleFetchClips = async () => {
    const urls = parseInstagramLinkLines(linkText);
    if (urls.length === 0 || importing) return;

    setImportErrors([]);
    setImportNotice(null);
    setImportProgress(null);

    const slots = 5 - useWizardStore.getState().clips.length;
    if (slots <= 0) {
      setImportErrors([
        {
          url: "Limit reached",
          hint: "You already have 5 clips. Remove one to import more, or switch to Upload clips.",
        },
      ]);
      return;
    }

    const batch = urls.slice(0, slots);
    if (urls.length > batch.length) {
      setImportNotice(
        `You can add ${slots} more clip(s). Trying the first ${batch.length} link(s) only.`,
      );
    }

    setImporting(true);

    const failures: { url: string; hint: string }[] = [];

    try {
      for (let i = 0; i < batch.length; i++) {
        const url = batch[i];
        setImportProgress(`Fetching clip ${i + 1} of ${batch.length}…`);

        try {
          const res = await fetch("/api/clips/instagram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });

          const fileName =
            res.headers.get("X-Clip-Filename") ??
            `instagram-${Date.now()}.mp4`;

          if (!res.ok) {
            let detail = "";
            try {
              const j = (await res.json()) as { error?: string };
              if (typeof j.error === "string") detail = j.error.trim();
            } catch {
              /* ignore */
            }
            failures.push({
              url,
              hint: detail
                ? `${IMPORT_FALLBACK} (${detail})`
                : IMPORT_FALLBACK,
            });
            continue;
          }

          const blob = await res.blob();
          if (!blob.size) {
            failures.push({ url, hint: IMPORT_FALLBACK });
            continue;
          }

          addClipFromBlob(blob, fileName);
        } catch {
          failures.push({ url, hint: IMPORT_FALLBACK });
        }
      }
    } finally {
      setImporting(false);
      setImportProgress(null);
      setImportErrors(failures);
    }
  };

  const handleClearImport = () => {
    setLinkText("");
    setImportErrors([]);
    setImportNotice(null);
    setImportProgress(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Background clips</CardTitle>
        <CardDescription>
          Add <strong>2 to 5</strong> short vertical-friendly clips — upload files
          (recommended) or paste Instagram reel links. Final output is{" "}
          <strong>9:16</strong>; clips are sequenced below and timed to your voice (or
          clip length if you skip audio).
        </CardDescription>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={tab === "upload" ? "primary" : "secondary"}
            onClick={() => setTab("upload")}
            disabled={importing}
            className="min-h-[44px] flex-1 sm:flex-none"
          >
            Upload clips
          </Button>
          <Button
            type="button"
            variant={tab === "instagram" ? "primary" : "secondary"}
            onClick={() => setTab("instagram")}
            disabled={importing}
            className="min-h-[44px] flex-1 sm:flex-none"
          >
            Import from Instagram
          </Button>
        </div>

        <div className="mt-5">
          {tab === "upload" ? (
            <ClipUploader
              onFiles={addClips}
              maxFiles={5}
              currentCount={clips.length}
              disabled={importing}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Instagram fetching can fail when a reel is private or Instagram
                blocks the request — you can always upload the file instead from{" "}
                <strong>Upload clips</strong>.
              </p>
              <textarea
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                disabled={importing}
                placeholder="Paste Instagram reel links, one per line"
                rows={5}
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none ring-deen/30 placeholder:text-slate-400 focus:border-deen/40 focus:ring-2 disabled:opacity-60"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void handleFetchClips()}
                  disabled={
                    importing ||
                    roomLeft <= 0 ||
                    parseInstagramLinkLines(linkText).length === 0
                  }
                  className="min-h-[44px]"
                >
                  {importing ? "Fetching…" : "Fetch clips"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClearImport}
                  disabled={importing}
                  className="min-h-[44px]"
                >
                  Clear
                </Button>
              </div>
              {importProgress ? (
                <p className="text-sm text-slate-600">{importProgress}</p>
              ) : null}
              {importNotice ? (
                <p className="text-sm text-sky-900 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2">
                  {importNotice}
                </p>
              ) : null}
              {importErrors.length > 0 ? (
                <ul className="space-y-2 text-sm text-red-900 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {importErrors.map((e, i) => (
                    <li key={`${i}-${e.url}`}>
                      <span className="font-medium break-all">{e.url}</span>
                      <span className="block text-red-800/95 mt-0.5">{e.hint}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          Need at least <strong>2 clips</strong> to continue. Maximum{" "}
          <strong>5</strong>.
        </p>
      </Card>

      {clips.length > 0 ? (
        <Card>
          <CardTitle>Your clips</CardTitle>
          <CardDescription>
            Reorder with the arrows. First clip plays first — same list for uploads
            and imports.
          </CardDescription>
          <div className="mt-4 space-y-3">
            {clips.map((c, i) => (
              <ClipCard
                key={c.id}
                clip={c}
                index={i}
                total={clips.length}
                onRemove={() => removeClip(c.id)}
                onMoveUp={() => moveClip(c.id, "up")}
                onMoveDown={() => moveClip(c.id, "down")}
                onDuration={(sec) => onDuration(c.id, sec)}
              />
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
