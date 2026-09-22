import { Root } from "@radix-ui/react-separator";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type SeparatorProps = ComponentPropsWithoutRef<typeof Root>;

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <Root
      className={cn(
        "shrink-0 bg-slate-200",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      decorative
      orientation={orientation}
      {...props}
    />
  );
}
