import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[#111111] text-white hover:bg-[#2b2b2b] shadow-[0_10px_30px_rgba(17,17,17,0.18)]",
  secondary: "bg-white/70 text-[#111111] border border-[#111111]/10 hover:bg-white",
  accent: "bg-[#ff5b52] text-white hover:bg-[#ff6a5b] shadow-[0_15px_30px_rgba(255,91,82,0.28)]",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: keyof typeof sizes }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
