import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-occdo-700 text-white hover:bg-occdo-800 focus-visible:ring-occdo-700",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-400",
};

export function Button({
  asChild = false,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        className,
      )}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}
