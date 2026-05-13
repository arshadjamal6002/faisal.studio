"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-deen text-white hover:bg-deen-dark shadow-[0_10px_24px_rgba(15,93,79,0.25)] disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "bg-white/90 text-deen border border-deen/25 hover:bg-deen/5 hover:border-deen/40 disabled:opacity-50",
  ghost: "text-slate-700 hover:bg-slate-100/90 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className = "", variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-200 ${variants[variant]} ${className}`}
    {...props}
  />
));
Button.displayName = "Button";
