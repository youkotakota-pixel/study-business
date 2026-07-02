import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const repoRoot = join(webRoot, "..");
const contentDir = join(webRoot, "content");

mkdirSync(join(contentDir, "posts"), { recursive: true });

const sources = [
  { from: join(repoRoot, "posts"), to: join(contentDir, "posts") },
  { from: join(repoRoot, "config.yaml"), to: join(contentDir, "config.yaml") },
  {
    from: join(repoRoot, "curriculum", "index.yaml"),
    to: join(contentDir, "curriculum.yaml"),
  },
];

for (const { from, to } of sources) {
  if (!existsSync(from)) {
    console.warn(`[sync-content] skip missing: ${from}`);
    continue;
  }
  cpSync(from, to, { recursive: true });
  console.log(`[sync-content] copied ${from} -> ${to}`);
}
