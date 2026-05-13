"use client";

import type { WizardStep } from "@/lib/store";
import { Check } from "lucide-react";

const LABELS = ["Content", "Clips", "Captions", "Voice", "Preview"] as const;

type Props = {
  step: WizardStep;
};

export function Stepper({ step }: Props) {
  return (
    <nav aria-label="Progress" className="w-full overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/80 px-3 py-4 shadow-sm backdrop-blur-sm">
      <ol className="flex min-w-max items-center gap-1.5 sm:min-w-0 sm:w-full sm:justify-between">
        {LABELS.map((label, i) => {
          const n = (i + 1) as WizardStep;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 px-1">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                    done
                      ? "bg-deen-soft text-white"
                      : active
                        ? "bg-deen text-white ring-4 ring-deen/15"
                        : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden /> : n}
                </span>
                <span
                  className={`max-w-[76px] text-center text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs ${
                    active ? "text-deen" : done ? "text-slate-600" : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < LABELS.length - 1 ? (
                <div
                  className={`mx-0.5 h-0.5 w-6 shrink-0 rounded-full sm:mx-2 sm:flex-1 sm:min-w-[12px] ${
                    step > n ? "bg-deen-soft/80" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
