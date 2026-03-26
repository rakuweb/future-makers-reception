# コンテスト受付システム

QRコードを使ったコンテスト参加者の受付管理システムです。

- **サーバー（Vercel）**: 参加者登録 QR 生成ページ (`/register`)
- **ローカルPC（会場）**: 受付チェックイン・管理画面

---

## 動作環境

- Node.js 18 以上
- npm

---

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. データベースの初期化（ローカルのみ）

```bash
npx prisma migrate dev --name init
```

`prisma/dev.db` が作成されます。

---

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開くと各ページへのリンクが表示されます。

---

## ページ一覧

| ページ | URL | 説明 | 環境 |
|---|---|---|---|
| トップ | `/` | 各ページへのリンク | 両環境 |
| 登録フォーム | `/register` | 参加者情報を入力してQRコードを生成・印刷 | サーバー（Vercel） |
| 受付チェックイン | `/checkin` | QRスキャンで参加者を受付登録 | ローカル専用 |
| 管理画面 | `/admin` | 受付済み一覧の確認・CSVエクスポート | ローカル専用 |

---

## 使い方

### 事前準備（参加者側）

1. `https://<your-domain>/register` にアクセス
2. 名前・所属・学年・学籍番号を入力
3. 生成されたQRコードを印刷して持参

### 当日の受付（スタッフ側）

1. ローカルPCで `npm run dev` を起動
2. `http://localhost:3000/checkin` を開く
3. カメラ or USBリーダーで参加者のQRコードをスキャン
4. 内容を確認して「受付する」ボタンを押す
5. 「受付完了」が表示されたら完了（3秒後に自動リセット）

### 受付状況の確認

`http://localhost:3000/admin` から受付済み参加者の一覧を確認できます。
CSVエクスポートボタンで一覧をダウンロードできます（BOM付きUTF-8、Excel対応）。

---

## Vercel へのデプロイ

```bash
vercel --prod
```

`vercel.json` により、Vercel 上では `/checkin`・`/admin`・`/api/*` は 404 で制限されます。
`DATABASE_URL` 環境変数の設定は不要です（Vercel ではDBを使用しません）。

---

## QRコードの仕様

QRコードには以下のJSON文字列が埋め込まれています（URLではありません）。

```json
{"name":"山田太郎","affiliation":"工学部","grade":"3","studentId":"2112345"}
```

---

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **DB**: SQLite（ローカル専用）
- **ORM**: Prisma
- **QR生成**: qrcode.react
- **QRスキャン**: html5-qrcode
