"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className = "", label, id, ...props }, ref) => {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-deen focus:ring-2 focus:ring-deen/20 ${className}`}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";
