/**
 * 既存 posts に mobile_lead を付与（携帯 Slack 向けデータ精査）
 * OpenAI API は使わず、本文から要約を抽出する。
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractLead, loadConfig, ROOT, truncate } from "./lib.js";

function main(): void {
  const config = loadConfig();
  const maxChars = config.slack?.mobile_lead_max_chars ?? 120;
  const postsDir = join(ROOT, "posts");
  const files = readdirSync(postsDir).filter((f) => /^day-\d{3}\.md$/.test(f));

  let updated = 0;

  for (const file of files) {
    const path = join(postsDir, file);
    let content = readFileSync(path, "utf8");

    // 既存の mobile_lead を削除して再生成（精査し直し用）
    content = content.replace(/^mobile_lead:.*\r?\n/m, "");

    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
      console.warn(`Skip (invalid frontmatter): ${file}`);
      continue;
    }

    const body = match[2].trim();
    const lead = extractLead(body, maxChars);
    const safeLead = lead.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    const patched = content.replace(
      /(category:\s*"[^"]*")\r?\n/,
      `$1\nmobile_lead: "${safeLead}"\n`,
    );

    if (patched === content) {
      console.warn(`Skip (category not found): ${file}`);
      continue;
    }

    writeFileSync(path, patched, "utf8");
    updated += 1;
    console.log(`Updated ${file}: ${truncate(lead, 60)}`);
  }

  console.log(`Done. ${updated} files patched with mobile_lead.`);
}

main();
