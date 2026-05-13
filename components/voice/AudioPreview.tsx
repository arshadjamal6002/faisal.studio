"use client";

import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

type Props = {
  url: string | undefined;
  fileName?: string;
  durationSec?: number;
  onReplace: () => void;
};

export function AudioPreview({ url, fileName, durationSec, onReplace }: Props) {
  if (!url) return null;
  const dur =
    durationSec != null && Number.isFinite(durationSec)
      ? `${Math.round(durationSec)}s`
      : "—";

  return (
    <div className="rounded-2xl border border-slate-200/85 bg-cream/55 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {fileName ?? "Your audio"}
          </p>
          <p className="text-xs text-slate-500">Duration: {dur}</p>
        </div>
        <Button type="button" variant="secondary" onClick={onReplace} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Re-record / Replace
        </Button>
      </div>
      <audio controls className="w-full" src={url} preload="metadata">
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
