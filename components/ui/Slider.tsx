"use client";

import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export function Slider({ label, className = "", ...props }: Props) {
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          {props.value != null ? (
            <span className="tabular-nums text-slate-500">{props.value}</span>
          ) : null}
        </div>
      ) : null}
      <input
        type="range"
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-deen"
        {...props}
      />
    </div>
  );
}
