"use client";

import Link from "next/link";
import { useWizardStore } from "@/lib/store";
import { Stepper } from "@/components/wizard/Stepper";
import { Button } from "@/components/ui/Button";
import { StepContent } from "@/components/wizard/StepContent";
import { StepVoice } from "@/components/wizard/StepVoice";
import { StepClips } from "@/components/wizard/StepClips";
import { StepCaptions } from "@/components/wizard/StepCaptions";
import { StepPreview } from "@/components/wizard/StepPreview";
import { ArrowLeft, ArrowRight } from "lucide-react";

function stepTitle(step: number) {
  switch (step) {
    case 1:
      return "Content";
    case 2:
      return "Voice";
    case 3:
      return "Clips";
    case 4:
      return "Captions";
    case 5:
      return "Preview & export";
    default:
      return "";
  }
}

export function WizardShell() {
  const step = useWizardStore((s) => s.step);
  const next = useWizardStore((s) => s.next);
  const back = useWizardStore((s) => s.back);
  const content = useWizardStore((s) => s.content);
  const clips = useWizardStore((s) => s.clips);

  const canNext =
    step === 1
      ? content.text.trim().length > 0
      : step === 2
        ? true
        : step === 3
          ? clips.length >= 2 && clips.length <= 5
          : step === 4
            ? true
            : false;

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            Faisal<span className="text-deen"> Studio</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-deen"
          >
            Exit
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <Stepper step={step} />
        </div>

        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-deen">
            Step {step} of 5
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {stepTitle(step)}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Build a calm, vertical reminder — no paid tools required.
          </p>
        </div>

        <div className="mt-6">
          {step === 1 ? <StepContent /> : null}
          {step === 2 ? <StepVoice /> : null}
          {step === 3 ? <StepClips /> : null}
          {step === 4 ? <StepCaptions /> : null}
          {step === 5 ? <StepPreview /> : null}
        </div>

        {step < 5 ? (
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 1}
              onClick={back}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              disabled={!canNext}
              onClick={next}
              className="gap-2"
              title={
                step === 3 && clips.length < 2
                  ? "Add at least 2 clips"
                  : step === 1 && !content.text.trim()
                    ? "Choose or enter content"
                    : undefined
              }
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </footer>
        ) : null}
      </main>
    </div>
  );
}
