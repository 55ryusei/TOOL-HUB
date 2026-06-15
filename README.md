# TOOL HUB

自作ツールを一か所からワンタップで起動するランチャー（PWA）。
デザインは ASUS ROG 風（黒×赤ネオン）× ガラスモーフィズム。

## 使い方

```bash
npm install
npm run dev       # 開発サーバ（http://localhost:5173）
```

ブラウザで開くと：

- 起動時に粒子が集まって「TOOL HUB」のタイトルになる
- 背景の WebGL シェーダーがマウスに反応して揺らぐ
- カードはホバーで吸着・傾き・赤グロー、クリックでツールが新しいタブで開く
- 「＋ ツールを追加」で名前・URL を登録 → カードが増える（ブラウザに保存／リロードしても残る）
- 追加したカードは右上の × で削除できる

## ツールを直書きで追加する

`src/data/defaultTools.ts` の配列を編集します（ここに書いたものは消えません）。

```ts
{
  id: 'default-mytool',  // 一意な文字列
  name: 'ツール名',       // 必須
  url: 'https://...',     // 必須（デプロイ済みの URL 推奨）
  icon: '🛠',            // 任意（絵文字）
  sub: '説明',            // 任意
}
```

> メモ：ローカルの `file:///C:/...` への直接リンクはブラウザがブロックします。
> ツールはデプロイして `https://` の URL にするのが確実です。

## PWA（PC アプリ風）としてインストール

```bash
npm run build
npm run preview   # http://localhost:4173
```

Chrome / Edge のアドレスバー右の「インストール」アイコンから入れると、
独立ウィンドウ＋デスクトップアイコンで起動します（スマホはホーム画面に追加）。

## デプロイ（任意）

`npm run build` で `dist/` に静的ファイルが出力されます。
Cloudflare Pages / Vercel などにそのまま上げれば、URL で・スマホからも使えます。

## 構成

- Vite + React + TypeScript
- Tailwind CSS v4（`src/index.css` の `@theme` で ROG カラー定義）
- React Three Fiber + 自作 GLSL（背景／`src/components/Background.tsx`）
- Framer Motion（タイトル・カードのアニメ）
- vite-plugin-pwa（manifest / Service Worker）

アイコンは `scripts/gen-icons.mjs`（依存なしの PNG 生成）で作成 → `public/icons/`。
