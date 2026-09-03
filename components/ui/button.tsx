import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[#111111] text-white hover:bg-[#2a2a2a]",
  secondary: "bg-transparent text-[#111111] border border-[#111111]/15 hover:bg-[#f3f3f3]",
  accent: "bg-[#ff5f6d] text-white hover:bg-[#ff7381]",
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
        "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
