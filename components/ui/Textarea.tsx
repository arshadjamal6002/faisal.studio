"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(({ className = "", label, id, ...props }, ref) => {
  const tid = id ?? props.name;
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={tid}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={tid}
        className={`min-h-[160px] w-full resize-y rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-deen focus:ring-2 focus:ring-deen/20 ${className}`}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = "Textarea";
