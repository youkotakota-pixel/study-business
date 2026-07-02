import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
};

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <div
      className={cn(
        "mobile-shell min-h-[100dvh] bg-gradient-to-b from-accent/35 via-background to-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
