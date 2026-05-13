"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
>(({ className = "", label, id, children, ...props }, ref) => {
  const sid = id ?? props.name;
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={sid}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={sid}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-deen focus:ring-2 focus:ring-deen/20 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
Select.displayName = "Select";
