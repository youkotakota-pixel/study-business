import { learningProgress } from "@/lib/progress";

type ProgressBarProps = {
  day: number;
  totalDays: number;
};

export function ProgressBar({ day, totalDays }: ProgressBarProps) {
  const percent = learningProgress(day, totalDays);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">学習進捗</span>
        <span className="text-muted-foreground tabular-nums">
          {day} / {totalDays} 日目
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`学習進捗 ${percent}%`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">{percent}% 完了</p>
    </div>
  );
}
