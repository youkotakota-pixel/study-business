import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleContent } from "@/components/article-content";
import { DayHeader } from "@/components/day-header";
import { DayNav } from "@/components/day-nav";
import { bodyForArticle } from "@/lib/article";
import { getTotalDays, loadConfig } from "@/lib/config";
import { getAdjacentDays, getPost, listPostDays } from "@/lib/posts";

type PageProps = {
  params: Promise<{ n: string }>;
};

function parseDay(slug: string): number | null {
  const day = Number(slug);
  if (!Number.isInteger(day) || day < 1 || day > 365) return null;
  return day;
}

export async function generateStaticParams() {
  return listPostDays().map((day) => ({
    n: String(day).padStart(3, "0"),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  const day = parseDay(n);
  if (!day) return { title: "記事が見つかりません" };

  const post = getPost(day);
  if (!post) return { title: "記事が見つかりません" };

  return {
    title: `Day ${post.slug}: ${post.title}`,
    description: post.mobile_lead ?? post.title,
  };
}

export default async function DayPage({ params }: PageProps) {
  const { n } = await params;
  const day = parseDay(n);
  if (!day) notFound();

  const post = getPost(day);
  if (!post) notFound();

  const config = loadConfig();
  const totalDays = getTotalDays(config);
  const { prev, next } = getAdjacentDays(day);

  return (
    <>
      <main
        className="mx-auto max-w-lg pb-32 pt-5"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        }}
      >
        <DayHeader
          day={post.day}
          title={post.title}
          category={post.category}
          lead={post.mobile_lead}
          points={post.points}
          totalDays={totalDays}
        />
        <ArticleContent body={bodyForArticle(post.body)} />
      </main>
      <DayNav prev={prev} next={next} />
    </>
  );
}
