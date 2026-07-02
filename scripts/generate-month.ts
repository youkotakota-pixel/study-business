import { existsSync, readFileSync, writeFileSync } from "node:fs";
import OpenAI from "openai";
import {
  dayFileName,
  getDayNumberForDate,
  loadConfig,
  todayInJst,
  loadCurriculum,
  postPath,
  type CurriculumDay,
} from "./lib.js";

function parseArgs(): { year: number; month: number } {
  const now = new Date();
  const yearArg = process.argv.find((arg) => arg.startsWith("--year="));
  const monthArg = process.argv.find((arg) => arg.startsWith("--month="));

  if (yearArg && monthArg) {
    return {
      year: Number(yearArg.split("=")[1]),
      month: Number(monthArg.split("=")[1]),
    };
  }

  // JST の当月分を生成（毎月1日 0:00 実行を想定）
  const jst = todayInJst();
  return { year: jst.getFullYear(), month: jst.getMonth() + 1 };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getTargetDays(
  year: number,
  month: number,
  startDate: string,
): CurriculumDay[] {
  const curriculum = loadCurriculum();
  const count = daysInMonth(year, month);
  const targets: CurriculumDay[] = [];

  for (let d = 1; d <= count; d += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayNum = getDayNumberForDate(new Date(`${date}T12:00:00Z`), startDate);
    if (dayNum == null) continue;
    const entry = curriculum.days.find((item) => item.day === dayNum);
    if (entry) targets.push(entry);
  }

  return targets;
}

function buildPrompt(
  entry: CurriculumDay,
  manufacturers: Array<{ name: string; url: string }>,
  previousTitles: string[],
): string {
  const refs = manufacturers.map((m) => `- ${m.name}: ${m.url}`).join("\n");

  return `あなたは産業用機構部品の入門講師です。図面が読めない異業種から転職した社会人向けに、1日分の学習記事を書いてください。

## 今日のテーマ
- Day: ${entry.day}
- カテゴリ: ${entry.category}
- タイトル: ${entry.title}
- 学習目標: ${entry.objective}

## 参照メーカー（カテゴリ名・用途の参照のみ。型番の羅列やカタログ文言の転載は禁止）
${refs}

## これまでの直近テーマ（重複を避ける）
${previousTitles.slice(-5).join("\n") || "なし"}

## 執筆ルール
1. 特定メーカーの宣伝にならないよう、業界共通の仕組みとして説明する
2. 型番・寸法の暗記は不要。動き・役割・使われ方を中心に
3. 専門用語は初出時に平易な言葉で補足する
4. 図面の読み方ができなくても理解できるようにする
5. 事実不明な断定は避け、一般的な原理で説明する
6. 800〜1200文字程度の日本語
7. 必ず Mermaid の flowchart または sequenceDiagram を1つ含める
8. 出力は Markdown 全文のみ（前置きやコードフェンスで囲まない）

## 出力フォーマット（この frontmatter から始める）
---
day: ${entry.day}
title: "${entry.title}"
category: "${entry.category}"
---

# Day ${String(entry.day).padStart(3, "0")}: ${entry.title}

（本文）

## 図で理解する

\`\`\`mermaid
（ここに図）
\`\`\`

## 今日のポイント
- （3つ）

## 明日へのつながり
（1〜2文）`;
}

async function generatePost(
  client: OpenAI,
  model: string,
  temperature: number,
  prompt: string,
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content:
          "産業用金具の入門教材を書く専門家。正確で平易な日本語。Markdownのみ出力。",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI から空の応答が返りました");
  return text.startsWith("---") ? text : `---\nday: 0\ntitle: "error"\n---\n\n${text}`;
}

async function main(): Promise<void> {
  const config = loadConfig();
  const { year, month } = parseArgs();
  const targets = getTargetDays(year, month, config.start_date);

  if (targets.length === 0) {
    console.log(`${year}-${month} に該当する学習日がありません（start_date 外）`);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY が設定されていません");

  const client = new OpenAI({ apiKey });
  const generated: number[] = [];
  const skipped: number[] = [];

  for (const entry of targets) {
    const path = postPath(entry.day);
    if (existsSync(path)) {
      skipped.push(entry.day);
      continue;
    }

    const previousTitles = targets
      .filter((t) => t.day < entry.day)
      .map((t) => `Day ${t.day}: ${t.title}`);

    const prompt = buildPrompt(entry, config.reference_manufacturers, previousTitles);
    console.log(`Generating Day ${entry.day}: ${entry.title}`);

    const content = await generatePost(
      client,
      config.openai.model,
      config.openai.temperature,
      prompt,
    );
    writeFileSync(path, `${content.trim()}\n`, "utf8");
    generated.push(entry.day);

    // レート制限対策
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  console.log(`Done. generated=${generated.join(",") || "none"} skipped=${skipped.join(",") || "none"}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
