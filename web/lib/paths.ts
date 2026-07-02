import { join } from "node:path";

export function contentDir(): string {
  return join(process.cwd(), "content");
}

export function postsDir(): string {
  return join(contentDir(), "posts");
}
