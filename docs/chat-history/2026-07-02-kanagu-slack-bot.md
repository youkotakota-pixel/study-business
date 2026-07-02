# チャット履歴: 金具学習 Slack Bot 構築

- **日付**: 2026年7月2日
- **リポジトリ**: `study-business`（`youkotakota-pixel/study-business`）
- **ローカルパス**: `C:\Users\PC_User\src\kotani-output\study-business`
- **目的**: 4社共通の機構部品知識を毎日 Slack に届ける個人学習 Bot の設計・実装

---

## 目次

1. [チャット1: 機能構想（grill-me）](#チャット1-機能構想grill-me)
2. [チャット2: SLACK_WEBHOOK_URL とは](#チャット2-slack_webhook_url-とは)
3. [チャット3: Webhook 作成手順](#チャット3-webhook-作成手順)
4. [チャット4: 実装前の準備](#チャット4-実装前の準備)
5. [チャット5: Webhook 文字化け](#チャット5-webhook-文字化け)
6. [チャット6: 専用リポジトリの作り方](#チャット6-専用リポジトリの作り方)
7. [チャット7: Public への変更](#チャット7-public-への変更)
8. [チャット8: 実装](#チャット8-実装)
9. [チャット9: .env は必要か](#チャット9-env-は必要か)
10. [チャット10: 携帯 Slack 向け精査](#チャット10-携帯-slack-向け精査)
11. [合意事項まとめ](#合意事項まとめ)
12. [実装済みファイル一覧](#実装済みファイル一覧)

---

## チャット1: 機能構想（grill-me）

### ユーザー

> grill-meで下記のような機能を作りたい。なるべく費用は掛からないようにしてほしい。まず、https://www.takigen.co.jp/ https://www.shibutani-appit.jp/top/ https://info.tochigiya.jp/ https://www.sugatsune.co.jp/ に共通する商品についてその商品の仕組みが全く分からない素人（図面も読み方が分からない）社会人が転職でこの業界に入った場合、覚えなければいけない知識を毎日slackに少しずつ文章と図を使って投稿する仕組みを作るにはどうしたらいいと思う？

### アシスタント（要約）

grill-me スキルで1問ずつ設計を詰めた。

**参照メーカー（4社）**

| メーカー | URL |
|----------|-----|
| タキゲン | https://www.takigen.co.jp/ |
| シブタニ（APPIT） | https://www.shibutani-appit.jp/top/ |
| 栃木屋 | https://info.tochigiya.jp/ |
| スガツネ | https://www.sugatsune.co.jp/ |

**主な質問と回答**

| # | 質問 | ユーザーの回答 |
|---|------|----------------|
| Q1 | 利用者と運用主体 | 自社新入向けだが **個人利用** |
| Q2 | コンテンツの作り方 | **カリキュラム骨格を GitHub に置き、毎日の投稿は ChatGPT API が生成** |
| Q3 | 図の形式 | **Mermaid（テキスト図）** |
| Q4 | 学習範囲 | 当初90日 → **金具全般**に拡大 |
| Q5 | 投稿前の確認 | 当初 PR 確認 → 後述で変更 |
| Q6 | Slack 投稿先 | **自分専用プライベートチャンネル** |
| Q7 | 自動実行タイミング | **毎日0時**、マージ確認なし |
| Q8 | マージなしでの品質担保 | **AI が各サイト情報を統合して品質の良いものを生成**（ChatGPT 有料可） |
| Q9 | 情報の参照方法 | **カテゴリ・用途のみ参照、説明は独自執筆** |
| Q10 | 期間 | **365日（1年）** |
| Q11 | 土日祝 | **毎日投稿** |
| Q12 | Slack の見え方 | **本文 + GitHub リンク** |
| Q13 | AI 生成タイミング | **月12回（月ごとに約31日分）** |
| Q14 | リポジトリ | **専用の新しい GitHub リポジトリ** |
| Q15 | 生成モデル | **GPT-4o** |

**API 初心者向け補足（ユーザー追加質問への回答）**

- ChatGPT Plus（アプリ月額）と API は**別契約**
- API は [platform.openai.com](https://platform.openai.com) でクレジットチャージ（従量課金）
- GPT-4o mini: 月数百円未満（1日1回生成の場合）
- Gemini Flash: 無料枠が広く API 初心者向きだが、マージなし・品質優先なら GPT-4o を推奨

**用語説明: マージ**

- GitHub の PR（下書き）を本番に取り込む操作
- 有料サービスではない
- 後のやり取りで「マージ確認なし」に方針変更

**用語説明: Mermaid**

- テキストで書く図表記法（無料）
- GitHub 上では図として表示される
- Slack 標準では図にならない → GitHub リンクで閲覧

**費用見積もり（月額）**

| 項目 | 費用 |
|------|------|
| GitHub Actions | 0円 |
| Slack Webhook | 0円 |
| GPT-4o（月31日分生成） | 500〜1,500円/月 |
| 合計 | おおよそ 500〜1,500円/月 |

---

## チャット2: SLACK_WEBHOOK_URL とは

### ユーザー

> SLACK_WEBHOOK_URLとは？

### アシスタント

**`SLACK_WEBHOOK_URL`** は Slack にメッセージを送るための専用 URL（Incoming Webhook のアドレス）を、GitHub Actions 等の環境変数名として呼ぶときの名前。

```
GitHub Actions → HTTP POST → SLACK_WEBHOOK_URL → Slack チャンネル
```

| 方式 | 用途 |
|------|------|
| Incoming Webhook URL | 決まったチャンネルに投稿するだけ（今回向き） |
| Bot Token | 読み取り・返信など高機能（今回は不要） |

- 費用: 無料
- URL はパスワード同様に扱い、GitHub Secrets に保存
- 漏れたら Slack 側で再発行（ローテーション）

---

## チャット3: Webhook 作成手順

### ユーザー

> Webhook の作り方を手順通りに

### アシスタント

手順を提示（公式: [Sending messages using incoming webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks)）

1. Slack でプライベートチャンネル作成（例: `#daily-kanagu`）
2. https://api.slack.com/apps でアプリ作成（From scratch）
3. Incoming Webhooks を On
4. Add New Webhook to Workspace → チャンネル選択 → 許可
5. Webhook URL をコピー
6. GitHub Secrets に `SLACK_WEBHOOK_URL` として登録

**PowerShell テスト（UTF-8 対応版）**

```powershell
$webhookUrl = "https://hooks.slack.com/services/あなたの/URL/をここに"
$body = '{"text": "テスト投稿: 金具学習Botの接続確認です"}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $bytes -ContentType "application/json; charset=utf-8"
```

---

## チャット4: 実装前の準備

### ユーザー

> 実装する前にGITHUBに2つのAPIキーを登録済。他にすればいいことは？新たなフォルダを作ったほうが良い？

### アシスタント

**はい、専用フォルダ・専用リポジトリを推奨**（`workspace-ui-kit` とは別）。

推奨パス例: `C:\Users\PC_User\src\kanagu-daily-bot\`  
→ 実際には `C:\Users\PC_User\src\kotani-output\study-business` を使用。

**チェックリスト**

- [x] `SLACK_WEBHOOK_URL` 登録
- [x] `OPENAI_API_KEY` 登録
- [ ] Slack テスト投稿成功
- [ ] 専用リポジトリ作成
- [ ] 開始日の決定（`2026-07-07`）

---

## チャット5: Webhook 文字化け

### ユーザー

> Webhook のテストが?? ?????: ????Bot???????になる

### アシスタント

**原因**: PowerShell が日本語を UTF-8 で正しく送れていない（Webhook 自体は動作している）。

**解決策**: UTF-8 バイト列で送信（チャット3のコマンド参照）。

GitHub Actions 上では UTF-8 として動くため、本番投稿では問題にならない。

---

## チャット6: 専用リポジトリの作り方

### ユーザー

> 専用リポジトリはどうやればいいんだっけ？

### アシスタント

1. https://github.com/new でリポジトリ作成（例: `study-business`）
2. `git clone` でローカルに取得
3. そのリポジトリの Secrets に API キー2つを登録
4. 初回 push

```powershell
cd C:\Users\PC_User\src\kotani-output
git clone https://github.com/youkotakota-pixel/study-business.git
cd study-business
```

---

## チャット7: Public への変更

### ユーザー

> 後からPublicにするのはどうすればいい？

### アシスタント

GitHub リポジトリ → **Settings** → **Danger Zone** → **Change visibility** → **Make public**

**注意**

- Secrets（API キー）は Public でも見えない
- コード・`posts/*.md` の中身は公開される
- 推奨: テスト中は Private → 完了後に Public

---

## チャット8: 実装

### ユーザー

> clone まで完了した

パス: `C:\Users\PC_User\src\kotani-output\study-business`

### ユーザー

> 指摘通り実装して

### アシスタント（実施内容）

1. プロジェクト構成・スクリプト・GitHub Actions を実装
2. 365日カリキュラム（`curriculum/index.yaml`）を生成
3. GitHub に push
4. Actions で 2026年7月分（day-001〜026）を GPT-4o で生成（約5分）
5. Slack テスト投稿（Day 1）成功
6. JST 日付計算のバグを修正して push

**リポジトリ**: https://github.com/youkotakota-pixel/study-business

**自動運用**

| タイミング | 動作 |
|------------|------|
| 毎日 0:00 JST | 当日分を Slack 投稿 |
| 毎月1日 0:00 JST | 当月分の記事を生成 |

初回自動投稿: **2026年7月7日 0:00**（Day 001、`start_date` 基準）

---

## チャット9: .env は必要か

### ユーザー

> envファイルは必要ないの？

### アシスタント

| 用途 | `.env` 必要？ |
|------|---------------|
| GitHub Actions 自動運用 | **不要**（Secrets で足りる） |
| ローカル手動テスト | **任意**（PowerShell の `$env:` でも可） |

現状のコードは `.env` を自動読み込みしていない。`.gitignore` には `.env` が含まれている。

---

## チャット10: 携帯 Slack 向け精査

### ユーザー

> slackを携帯で見る前提でデータを精査して

### アシスタント（実施内容）

**改善前の問題**

- 長い URL がそのまま表示される
- 要約が1文だけ
- プレーンテキストのみで見づらい
- Mermaid は Slack 非対応

**改善後（Block Kit）**

```
Day 001 機構部品（金具）とは何か        ← ヘッダー
📂 はじめに・業界基礎 · 1/365日目      ← カテゴリ・進捗
（120字の mobile_lead 要約）
今日のポイント（3つ・各45字以内）
[ 図つき全文を見る ]                   ← ボタン → GitHub
スマホ: ボタンをタップ → GitHub で Mermaid 図を表示
```

**データ精査**

- 既存26記事に `mobile_lead` を付与（`npm run patch:mobile`）
- `config.yaml` に携帯向け設定を追加
- 今後の AI 生成プロンプトに携帯向けルールを追加
- GitHub に push し、携帯向けフォーマットで Slack テスト投稿を再実行（成功）

---

## 合意事項まとめ

| 項目 | 内容 |
|------|------|
| 利用者 | 個人学習用（業界初心者の自分） |
| 対象 | 金具全般（ハンドル、蝶番、ラッチ、錠前、キャスター等） |
| 期間 | 365日、毎日0時投稿（土日祝含む） |
| 情報源 | 4社サイトはカテゴリ参照のみ、説明は独自執筆 |
| 生成 | 月1回 GPT-4o で約31日分を事前生成 |
| 図 | Mermaid（GitHub で閲覧） |
| Slack | Block Kit、mobile_lead + 今日のポイント3つ + 全文ボタン |
| 確認フロー | マージ確認なし |
| インフラ | GitHub Actions + Slack Webhook + OpenAI API |
| リポジトリ | `youkotakota-pixel/study-business` |
| 開始日 | `2026-07-07`（`config.yaml`） |
| 月額費用 | おおよそ 500〜1,500円 |

---

## 実装済みファイル一覧

```
study-business/
├── config.yaml
├── curriculum/
│   └── index.yaml              # 365日カリキュラム
├── posts/
│   └── day-001.md 〜 day-026.md
├── scripts/
│   ├── build-curriculum.ts     # カリキュラム生成
│   ├── generate-month.ts       # 月次 GPT-4o 記事生成
│   ├── post-to-slack.ts        # Slack 投稿（Block Kit）
│   ├── patch-mobile-lead.ts    # mobile_lead 付与
│   └── lib.ts                  # 共通ユーティリティ
├── .github/workflows/
│   ├── post-daily.yml          # 毎日0時 JST 投稿
│   └── generate-monthly.yml    # 毎月1日0時 JST 生成
├── docs/
│   └── chat-history/
│       └── 2026-07-02-kanagu-slack-bot.md  # 本ファイル
├── package.json
├── tsconfig.json
└── README.md
```

### npm スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run curriculum:build` | 365日カリキュラム再生成 |
| `npm run generate:month -- --year=2026 --month=7` | 指定月の記事生成 |
| `npm run patch:mobile` | 既存記事に mobile_lead 付与 |
| `npm run post:daily` | 当日分を Slack 投稿 |
| `npm run post:test` | Day 1 を Slack 投稿 |

### GitHub Secrets

| Name | 内容 |
|------|------|
| `OPENAI_API_KEY` | OpenAI API キー |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL |

---

## 関連リンク

- リポジトリ: https://github.com/youkotakota-pixel/study-business
- Actions: https://github.com/youkotakota-pixel/study-business/actions
- タキゲン: https://www.takigen.co.jp/
- シブタニ APPIT: https://www.shibutani-appit.jp/top/
- 栃木屋: https://info.tochigiya.jp/
- スガツネ: https://www.sugatsune.co.jp/
- Slack Webhook 公式: https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks
- OpenAI API 料金: https://developers.openai.com/api/docs/pricing

---

*このファイルは Cursor チャット（2026-07-02）のやり取りを記録したものです。*
