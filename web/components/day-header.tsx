import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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
  const progress = Math.round((day / totalDays) * 100);

  return (
    <header className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          金具学習
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">
          {dayLabel}
        </h1>
        <p className="text-lg font-medium text-foreground/90">{title}</p>
        {category ? (
          <Badge variant="secondary" className="h-6">
            {category}
          </Badge>
        ) : null}
      </div>

      <Progress value={progress}>
        <div className="mb-2 flex w-full items-center justify-between text-sm">
          <span className="font-medium">学習進捗</span>
          <span className="text-muted-foreground tabular-nums">
            {day} / {totalDays} 日目
          </span>
        </div>
      </Progress>

      {lead ? (
        <p className="rounded-2xl border bg-muted/40 px-4 py-4 text-[15px] leading-7 text-foreground/90">
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
              <Card key={point} size="sm" className="border-primary/10 bg-card/80">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-start gap-2 text-sm font-medium">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
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
