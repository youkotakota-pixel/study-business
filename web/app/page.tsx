import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTotalDays, loadConfig } from "@/lib/config";
import { getPost, listPostDays } from "@/lib/posts";
import { cn } from "@/lib/utils";

function todayDayNumber(startDate: string): number | null {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayYmd = formatter.format(new Date());
  const todayMs = new Date(`${todayYmd}T00:00:00+09:00`).getTime();
  const startMs = new Date(`${startDate}T00:00:00+09:00`).getTime();
  const diffDays = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays < 1 || diffDays > 365) return null;
  return diffDays;
}

export default function HomePage() {
  const config = loadConfig();
  const days = listPostDays();
  const totalDays = getTotalDays(config);
  const today = todayDayNumber(config.start_date);

  if (today && getPost(today)) {
    redirect(`/day/${String(today).padStart(3, "0")}`);
  }

  if (days.length === 1) {
    redirect(`/day/${String(days[0]).padStart(3, "0")}`);
  }

  const recentDays = [...days].reverse().slice(0, 12);

  return (
    <main
      className="mx-auto max-w-lg space-y-6 py-8"
      style={{
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
        paddingTop: "max(2rem, env(safe-area-inset-top))",
      }}
    >
        <header className="space-y-3">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            金具学習
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">study-business</h1>
          <p className="text-[15px] leading-7 text-muted-foreground">
            機構部品（金具）を365日かけて学ぶモバイル向けリーダーです。Slack
            の「図つき全文を見る」から開けます。
          </p>
          <Badge variant="secondary">{days.length} / {totalDays} 日分 公開中</Badge>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            記事一覧
          </h2>
          <div className="space-y-3">
            {recentDays.map((day) => {
              const post = getPost(day);
              if (!post) return null;

              return (
                <Card key={day} className="transition-colors hover:bg-muted/30">
                  <CardHeader>
                    <CardDescription>Day {post.slug}</CardDescription>
                    <CardTitle className="text-base">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/day/${post.slug}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                    >
                      読む
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
    </main>
  );
}
