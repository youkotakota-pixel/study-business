import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, "..");

export type AppConfig = {
  start_date: string;
  timezone: string;
  default_branch: string;
  github_repo: string;
  reference_manufacturers: Array<{ name: string; url: string }>;
  openai: { model: string; temperature: number };
};

export type CurriculumDay = {
  day: number;
  category: string;
  title: string;
  objective: string;
};

export type Curriculum = {
  total_days: number;
  days: CurriculumDay[];
};

export function loadConfig(): AppConfig {
  const path = join(ROOT, "config.yaml");
  return parseYaml(readFileSync(path, "utf8")) as AppConfig;
}

export function loadCurriculum(): Curriculum {
  const path = join(ROOT, "curriculum", "index.yaml");
  if (!existsSync(path)) {
    throw new Error(
      "curriculum/index.yaml がありません。先に npm run curriculum:build を実行してください。",
    );
  }
  return parseYaml(readFileSync(path, "utf8")) as Curriculum;
}

export function dayFileName(day: number): string {
  return `day-${String(day).padStart(3, "0")}.md`;
}

export function postPath(day: number): string {
  return join(ROOT, "posts", dayFileName(day));
}

function formatJstYmd(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function parseJstDate(ymd: string): Date {
  return new Date(`${ymd}T00:00:00+09:00`);
}

/** GitHub Actions (UTC) から見た「いまの JST 日付」 */
export function todayInJst(): Date {
  return parseJstDate(formatJstYmd(new Date()));
}

export function getDayNumberForDate(date: Date, startDate: string): number | null {
  const targetYmd = formatJstYmd(date);
  const targetMs = parseJstDate(targetYmd).getTime();
  const startMs = parseJstDate(startDate).getTime();
  const diffDays = Math.floor((targetMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays < 1 || diffDays > 365) return null;
  return diffDays;
}

export function githubBlobUrl(
  repo: string,
  branch: string,
  day: number,
): string {
  return `https://github.com/${repo}/blob/${branch}/posts/${dayFileName(day)}`;
}

export function parsePostFrontmatter(content: string): {
  title: string;
  summary: string;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { title: "学習投稿", summary: content.slice(0, 200), body: content };
  }
  const front = match[1];
  const body = match[2].trim();
  const title = front.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] ?? "学習投稿";
  const summary =
    body
      .replace(/```[\s\S]*?```/g, "")
      .replace(/#+\s/g, "")
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? title;
  return { title, summary, body };
}
