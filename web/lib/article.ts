/** ヘッダーで既に表示するセクションを本文から除く */
export function bodyForArticle(body: string): string {
  return body
    .replace(/^#\s+.+$/m, "")
    .replace(/## 今日のポイント\s*\n[\s\S]*?(?=\n## |$)/, "")
    .trim();
}
