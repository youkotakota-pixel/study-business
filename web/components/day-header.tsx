import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProgressBar } from "@/components/progress-bar";

type DayHeaderProps = {
  day: number;
  title: string;
  category: string;
  lead?: string;
  points: string[];
  totalDays: number;
};

export function DayHeader({
  day,
  title,
  category,
  lead,
  points,
  totalDays,
}: DayHeaderProps) {
  const dayLabel = `Day ${String(day).padStart(3, "0")}`;

  return (
    <header className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          金具学習
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">
          {dayLabel}
        </h1>
        <p className="text-lg font-medium leading-snug text-foreground/90">{title}</p>
        {category ? (
          <Badge variant="secondary" className="h-6">
            {category}
          </Badge>
        ) : null}
      </div>

      <ProgressBar day={day} totalDays={totalDays} />

      {lead ? (
        <p className="rounded-2xl border border-primary/10 bg-card/90 px-4 py-4 text-[15px] leading-7 text-foreground/90 shadow-sm">
          {lead}
        </p>
      ) : null}

      {points.length > 0 ? (
        <section aria-label="今日のポイント">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            今日のポイント
          </h2>
          <div className="space-y-3">
            {points.map((point, index) => (
              <Card
                key={point}
                size="sm"
                className="border-primary/10 bg-card/90 shadow-sm"
              >
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-start gap-3 text-sm font-medium">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="leading-6">{point}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <Separator />
    </header>
  );
}
