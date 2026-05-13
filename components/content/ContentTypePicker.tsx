"use client";

import type { ContentType } from "@/types";
import { BookOpen, Heart, MessageSquareQuote, Sparkles, Type } from "lucide-react";

const OPTIONS: { type: ContentType; label: string; description: string; icon: typeof BookOpen }[] = [
  { type: "hadith", label: "Hadith", description: "Nabi ﷺ ki sunnatain", icon: BookOpen },
  { type: "quran", label: "Qurani ayat", description: "Ayat + mafhoom", icon: Sparkles },
  { type: "quote", label: "Islami quote", description: "Ulama o naseehat", icon: MessageSquareQuote },
  { type: "dua", label: "Dua", description: "Maangne ki baatein", icon: Heart },
  { type: "custom", label: "Apna text", description: "Likho ya paste karo", icon: Type },
];

type Props = {
  value: ContentType;
  onChange: (t: ContentType) => void;
};

export function ContentTypePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {OPTIONS.map(({ type, label, description, icon: Icon }) => {
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
              active
                ? "border-deen bg-deen/5 ring-2 ring-deen/30"
                : "border-slate-200 bg-white hover:border-deen/40 hover:bg-cream"
            }`}
          >
            <Icon
              className={`mb-2 h-6 w-6 ${active ? "text-deen" : "text-slate-500"}`}
              aria-hidden
            />
            <span className="font-semibold text-slate-900">{label}</span>
            <span className="mt-0.5 text-xs text-slate-600">{description}</span>
          </button>
        );
      })}
    </div>
  );
}
