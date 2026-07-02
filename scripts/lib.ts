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
  site_base_url?: string;
  reference_manufacturers: Array<{ name: string; url: string }>;
  openai: { model: string; temperature: number };
  slack?: {
    total_days: number;
    mobile_lead_max_chars: number;
    mobile_point_max_chars: number;
  };
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

export type ParsedPost = {
  day: number;
  title: string;
  category: string;
  lead: string;
  points: string[];
  body: string;
};

export type SlackBlock = Record<string, unknown>;

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

export function articleUrl(config: AppConfig, day: number): string {
  if (config.site_base_url) {
    const base = config.site_base_url.replace(/\/$/, "");
    return `${base}/day/${String(day).padStart(3, "0")}`;
  }

  const repo = process.env.GITHUB_REPOSITORY ?? config.github_repo;
  const branch = process.env.GITHUB_REF_NAME ?? config.default_branch;
  return githubBlobUrl(repo, branch, day);
}

export function truncate(text: string, max: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

export function extractLead(body: string, maxChars: number): string {
  const intro = body.split(/\n## /)[0] ?? body;
  const paragraphs = intro
    .replace(/^#.+$/m, "")
    .split(/\n\n+/)
    .map((p) => stripMarkdown(p))
    .filter((p) => p.length > 15 && !p.startsWith("以下の"));

  return truncate(paragraphs[0] ?? "", maxChars);
}

function extractPoints(body: string, maxChars: number): string[] {
  const section =
    body.match(/## 今日のポイント\s*\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";

  return section
    .split("\n")
    .map((line) => stripMarkdown(line.replace(/^[-*]\s+/, "")))
    .filter((line) => line.length > 0)
    .slice(0, 3)
    .map((line) => truncate(line, maxChars));
}

export function parsePost(content: string, config?: AppConfig): ParsedPost {
  const leadMax = config?.slack?.mobile_lead_max_chars ?? 120;
  const pointMax = config?.slack?.mobile_point_max_chars ?? 45;

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return {
      day: 0,
      title: "学習投稿",
      category: "",
      lead: truncate(content, leadMax),
      points: [],
      body: content,
    };
  }

  const front = match[1];
  const body = match[2].trim();
  const day = Number(front.match(/^day:\s*(\d+)/m)?.[1] ?? 0);
  const title = front.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] ?? "学習投稿";
  const category = front.match(/^category:\s*"?(.+?)"?\s*$/m)?.[1] ?? "";
  const mobileLead = front.match(/^mobile_lead:\s*"(.+)"\s*$/m)?.[1];

  return {
    day,
    title,
    category,
    lead: mobileLead
      ? truncate(mobileLead.replace(/\\"/g, '"'), leadMax)
      : extractLead(body, leadMax),
    points: extractPoints(body, pointMax),
    body,
  };
}

/** @deprecated parsePost を使用 */
export function parsePostFrontmatter(content: string): {
  title: string;
  summary: string;
  body: string;
} {
  const parsed = parsePost(content);
  return { title: parsed.title, summary: parsed.lead, body: parsed.body };
}

export function buildSlackPayload(
  parsed: ParsedPost,
  articleUrl: string,
  totalDays = 365,
): { text: string; blocks: SlackBlock[] } {
  const dayLabel = `Day ${String(parsed.day).padStart(3, "0")}`;
  const headerText = truncate(`${dayLabel} ${parsed.title}`, 145);
  const fallbackText = `${dayLabel}: ${parsed.title}`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: headerText, emoji: true },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📂 *${parsed.category}*　·　${parsed.day} / ${totalDays} 日目`,
        },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: parsed.lead },
    },
  ];

  if (parsed.points.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*今日のポイント*\n${parsed.points.map((p) => `• ${p}`).join("\n")}`,
      },
    });
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "図つき全文を見る", emoji: true },
        url: articleUrl,
        action_id: `read-day-${parsed.day}`,
      },
    ],
  });
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "スマホ: ボタンをタップ → 図つき全文を表示",
      },
    ],
  });

  return { text: fallbackText, blocks };
}
