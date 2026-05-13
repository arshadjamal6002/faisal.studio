"use client";

import type { ReactNode } from "react";
import type { ContentItem } from "@/types";
import { Check } from "lucide-react";

type Props = {
  item: ContentItem;
  selected: boolean;
  onSelect: () => void;
};

function Block({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="text-sm leading-relaxed text-slate-800">{children}</div>
    </div>
  );
}

export function ContentItemCard({ item, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-deen bg-deen/5 ring-2 ring-deen/25"
          : "border-slate-200 bg-white hover:border-deen/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-3">
          {item.story ? (
            <Block label="Waqiya / sabab">
              <p className="whitespace-pre-line text-slate-700">{item.story}</p>
            </Block>
          ) : null}
          <Block label={item.story ? "Hadees / markazi baat" : "Matn"}>
            <p className="whitespace-pre-line font-medium text-slate-900">
              {item.text}
            </p>
          </Block>
          {item.explanation ? (
            <Block label="Wazehat / sabaq">
              <p className="whitespace-pre-line text-slate-700">
                {item.explanation}
              </p>
            </Block>
          ) : null}
        </div>
        {selected ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-deen text-white">
            <Check className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-3 border-t border-slate-100 pt-2 text-xs font-medium text-gold-muted">
        {item.reference}
      </p>
    </button>
  );
}
