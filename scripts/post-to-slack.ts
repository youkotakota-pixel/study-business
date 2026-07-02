import { existsSync, readFileSync } from "node:fs";
import {
  articleUrl,
  buildSlackPayload,
  dayFileName,
  getDayNumberForDate,
  loadConfig,
  parsePost,
  postPath,
  todayInJst,
} from "./lib.js";

function parseDayArg(): number | null {
  const dayArg = process.argv.find((arg) => arg.startsWith("--day="));
  if (dayArg) return Number(dayArg.split("=")[1]);
  return null;
}

async function postToSlack(
  webhookUrl: string,
  payload: { text: string; blocks: unknown[] },
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
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
    explicitDay ?? getDayNumberForDate(todayInJst(), config.start_date);

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
  const parsed = parsePost(content, config);
  const url = articleUrl(config, day);

  const totalDays = config.slack?.total_days ?? 365;
  const payload = buildSlackPayload(parsed, url, totalDays);

  await postToSlack(webhookUrl, payload);
  console.log(`Posted Day ${day} to Slack (mobile blocks)`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
