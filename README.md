# study-business — 金具学習 Slack Bot

機構部品（金具）の仕組みを、毎日 Slack に少しずつ届ける個人学習 Bot です。  
[タキゲン](https://www.takigen.co.jp/)・[シブタニ APPIT](https://www.shibutani-appit.jp/top/)・[栃木屋](https://info.tochigiya.jp/)・[スガツネ](https://www.sugatsune.co.jp/) のカテゴリを参照しつつ、業界共通の原理として **365日分** を学びます。

## 構成

| パス | 内容 |
|------|------|
| `config.yaml` | 開始日・リポジトリ・OpenAI 設定 |
| `curriculum/index.yaml` | 365日分の学習目次 |
| `posts/day-NNN.md` | 各日の学習記事（Mermaid 図付き） |
| `scripts/` | 生成・投稿スクリプト |
| `.github/workflows/` | 自動実行（毎日投稿・月次生成） |

## 初回セットアップ

### 1. 依存関係のインストール

```powershell
cd C:\Users\PC_User\src\kotani-output\study-business
npm install
```

### 2. カリキュラム生成

```powershell
npm run curriculum:build
```

### 3. GitHub Secrets（リポジトリ Settings → Secrets）

| Name | 内容 |
|------|------|
| `OPENAI_API_KEY` | OpenAI API キー |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL |

### 4. 開始日の確認

`config.yaml` の `start_date` を確認してください（デフォルト: `2026-07-07`）。

## 使い方

### 当月分の記事を生成（ローカル）

```powershell
$env:OPENAI_API_KEY = "sk-..."
npm run generate:month -- --year=2026 --month=7
```

### Slack にテスト投稿

```powershell
$env:SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/..."
npm run post:test
```

### GitHub Actions で手動実行

- **Post daily to Slack** → `day` に番号を入れるとその日を投稿
- **Generate monthly posts** → `year` / `month` で対象月を生成

## 自動スケジュール（JST）

| ワークフロー | タイミング |
|--------------|------------|
| `post-daily.yml` | 毎日 0:00 JST |
| `generate-monthly.yml` | 毎月1日 0:00 JST に当月分を生成 |

## 1日の流れ

1. 毎月1日 0:00 — GPT-4o が当月分の `posts/day-NNN.md` を生成してコミット
2. 毎日 0:00 — 当日分を Slack に投稿（本文 + GitHub リンク）

## 費用の目安

| 項目 | 費用 |
|------|------|
| GitHub Actions | 無料枠内 |
| Slack Webhook | 無料 |
| GPT-4o（月31日分生成） | 約 500〜1,500円/月 |

## 注意

- 各社カタログの文言転載は行いません（カテゴリ参照 + 独自執筆）
- AI 生成の内容に誤りがある場合は `posts/day-NNN.md` を手修正してください
