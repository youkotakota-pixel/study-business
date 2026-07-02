import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="text-2xl font-semibold">記事が見つかりません</h1>
      <p className="text-muted-foreground">
        まだ生成されていない日付か、URL が間違っている可能性があります。
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "default" }), "mt-2")}>
        トップへ戻る
      </Link>
    </main>
  );
}
