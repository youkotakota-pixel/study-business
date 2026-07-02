import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

import { postsDir } from "@/lib/paths";

export type PostFrontmatter = {
  day: number;
  title: string;
  category: string;
  mobile_lead?: string;
};

export type Post = PostFrontmatter & {
  slug: string;
  body: string;
  points: string[];
};

function dayFileName(day: number): string {
  return `day-${String(day).padStart(3, "0")}.md`;
}

function extractPoints(body: string): string[] {
  const section =
    body.match(/## 今日のポイント\s*\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";

  return section
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1"))
    .filter((line) => line.length > 0)
    .slice(0, 3);
}

export function listPostDays(): number[] {
  const dir = postsDir();
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((name) => /^day-\d{3}\.md$/.test(name))
    .map((name) => Number(name.match(/day-(\d{3})\.md/)?.[1] ?? 0))
    .filter((day) => day > 0)
    .sort((a, b) => a - b);
}

export function getPost(day: number): Post | null {
  const path = join(postsDir(), dayFileName(day));
  if (!existsSync(path)) return null;

  const raw = readFileSync(path, "utf8");
  const { data, content } = matter(raw);
  const body = content.trim();

  return {
    day: Number(data.day ?? day),
    title: String(data.title ?? `Day ${day}`),
    category: String(data.category ?? ""),
    mobile_lead: data.mobile_lead ? String(data.mobile_lead) : undefined,
    slug: String(day).padStart(3, "0"),
    body,
    points: extractPoints(body),
  };
}

export function getAdjacentDays(day: number): {
  prev: number | null;
  next: number | null;
} {
  const days = listPostDays();
  const index = days.indexOf(day);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? days[index - 1]! : null,
    next: index < days.length - 1 ? days[index + 1]! : null,
  };
}
