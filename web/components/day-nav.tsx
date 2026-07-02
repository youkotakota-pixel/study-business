import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DayNavProps = {
  prev: number | null;
  next: number | null;
};

function dayHref(day: number): string {
  return `/day/${String(day).padStart(3, "0")}`;
}

export function DayNav({ prev, next }: DayNavProps) {
  const baseClass = "h-11 flex-1 gap-2 text-sm";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      aria-label="日付ナビゲーション"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        {prev ? (
          <Link
            href={dayHref(prev)}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), baseClass)}
          >
            <ChevronLeft />
            Day {String(prev).padStart(3, "0")}
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              baseClass,
              "pointer-events-none opacity-40",
            )}
          >
            <ChevronLeft />
            前へ
          </span>
        )}

        {next ? (
          <Link
            href={dayHref(next)}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), baseClass)}
          >
            Day {String(next).padStart(3, "0")}
            <ChevronRight />
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              baseClass,
              "pointer-events-none opacity-40",
            )}
          >
            次へ
            <ChevronRight />
          </span>
        )}
      </div>
    </nav>
  );
}
