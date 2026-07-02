import { existsSync, readFileSync } from "node:fs";
import {
  dayFileName,
  getDayNumberForDate,
  githubBlobUrl,
  loadConfig,
  parsePostFrontmatter,
  postPath,
  todayInJst,
} from "./lib.js";

function parseDayArg(): number | null {
  const dayArg = process.argv.find((arg) => arg.startsWith("--day="));
  if (dayArg) return Number(dayArg.split("=")[1]);
  return null;
}

async function postToSlack(webhookUrl: string, text: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack 投稿失敗: ${response.status} ${body}`);
  }
}

async function main(): Promise<void> {
  const config = loadConfig();
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("SLACK_WEBHOOK_URL が設定されていません");

  const explicitDay = parseDayArg();
  const day =
    explicitDay ??
    getDayNumberForDate(todayInJst(), config.start_date);

  if (day == null) {
    console.log("今日は学習期間外です（start_date〜365日間）");
    return;
  }

  const path = postPath(day);
  if (!existsSync(path)) {
    throw new Error(
      `${dayFileName(day)} がありません。先に npm run generate:month を実行してください。`,
    );
  }

  const content = readFileSync(path, "utf8");
  const { title, summary } = parsePostFrontmatter(content);
  const url = githubBlobUrl(
    process.env.GITHUB_REPOSITORY ?? config.github_repo,
    process.env.GITHUB_REF_NAME ?? config.default_branch,
    day,
  );

  const message = [
    `📘 *Day ${String(day).padStart(3, "0")}: ${title}*`,
    "",
    summary,
    "",
    `🔍 図で見る → ${url}`,
    "",
    `#金具学習 #${dayFileName(day).replace(".md", "")}`,
  ].join("\n");

  await postToSlack(webhookUrl, message);
  console.log(`Posted Day ${day} to Slack`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
