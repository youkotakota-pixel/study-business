import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

import { contentDir } from "@/lib/paths";

export type AppConfig = {
  start_date: string;
  timezone: string;
  default_branch: string;
  github_repo: string;
  site_base_url?: string;
  slack?: {
    total_days: number;
    mobile_lead_max_chars: number;
    mobile_point_max_chars: number;
  };
};

export function loadConfig(): AppConfig {
  const path = join(contentDir(), "config.yaml");
  return parseYaml(readFileSync(path, "utf8")) as AppConfig;
}

export function getTotalDays(config: AppConfig): number {
  return config.slack?.total_days ?? 365;
}
