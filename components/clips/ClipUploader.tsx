"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

type Props = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  maxFiles: number;
  currentCount: number;
};

export function ClipUploader({
  onFiles,
  disabled,
  maxFiles,
  currentCount,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const room = Math.max(0, maxFiles - currentCount);
  const canAdd = room > 0 && !disabled;

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length || !canAdd) return;
      const arr = Array.from(list).filter((f) => f.type.startsWith("video/"));
      onFiles(arr.slice(0, room));
      if (inputRef.current) inputRef.current.value = "";
    },
    [canAdd, onFiles, room],
  );

  return (
    <div>
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
          canAdd
            ? drag
              ? "border-deen bg-deen/5"
              : "border-slate-300 bg-white hover:border-deen/50"
            : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
        }`}
      >
        <Upload className="mb-2 h-8 w-8 text-deen" aria-hidden />
        <p className="text-sm font-medium text-slate-800">
          {canAdd
            ? "Tap to upload or drop video files"
            : "Maximum 5 clips reached"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {room > 0
            ? `You can add ${room} more clip${room === 1 ? "" : "s"} (2–5 total).`
            : "Remove a clip to add another."}
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
