# Contest Reception System - CLAUDE.md

## プロジェクト概要

コンテスト受付システム。参加者登録QR生成（サーバー）と受付チェックイン（ローカル）の2環境で動作する。

## アーキテクチャ

- **サーバー（Vercel）**: `/register` のみ。完全静的・APIなし・DBなし
- **ローカルPC（会場）**: `/checkin` `/admin` + SQLite + API Routes

## 技術スタック

- Next.js 14 App Router（TypeScript）
- Prisma + SQLite（ローカル専用）
- qrcode.react（QR生成）
- html5-qrcode（QRスキャン）

## QRコードの仕様

QRにはJSON文字列を埋め込む。URLではなくJSONをそのまま入れる。

```json
{"name":"山田太郎","affiliation":"工学部","grade":"3","studentId":"2112345"}
```

## DBスキーマ（ローカルのみ）

Participantテーブル（受付時に初めて作成）:

- id: String @id @default(uuid())
- name: String
- affiliation: String
- grade: String
- studentId: String @unique
- checkedInAt: DateTime @default(now())

## 重要な制約

- `/register` はサーバーコンポーネントを使わない。"use client" のみ
- `/checkin` `/admin` `/api/*` はローカル環境のみで動作を想定
- DBへの書き込みは受付時の1度のみ（事前登録なし）
- studentId の重複チェックを必ず行う（二重受付防止）

## ローカル起動

```bash
npx prisma migrate dev --name init
npm run dev
```

## デプロイ（Vercelへ）

- registerページのみを使用
- vercel.json でcheckin/adminへのアクセスを制限することが望ましい
- 環境変数 DATABASE_URL は不要（Vercel側ではDBを使わない）

## UIの方針

- シンプル・実用重視（TailwindCSS使用）
- /checkin は大きいフォント・ボタンで視認性重視
- /admin はテーブル表示 + CSVエクスポートボタン

## デザイン参照（Stitch MCP）
- Stitch MCP経由でデザインを参照すること
- StitchプロジェクトID: 13997678144417530222
- /checkin のデザインスクリーンID: 66752afd0b034e399fe6e3d0bb287400
- /register のデザインスクリーンID: 0a478acb45074e3c99f122158cce2cab
- デザイン改修時は get_screen_code または get_screen_image を使って参照する
- スタイリングはTailwindCSSに変換すること（Stitch固有クラスは使わない）
