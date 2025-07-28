# Chrome Site Blocker

## 機能

- 現在のサイトをワンクリックでブロック/解除
- サブドメインを含むドメイン単位でのブロック（例：`example.com`をブロックすると`www.example.com`もブロック）
- 時間制限機能（設定した時間まで一時的にブロックを解除）
- シンプルなポップアップUI

## インストール

1. このリポジトリをクローン
```bash
git clone <repository-url>
cd chrome-site-blocker
```

2. 依存関係をインストール
```bash
npm install
```

3. 拡張機能をビルド
```bash
npm run build
```

4. Chromeに拡張機能を読み込み
   - `chrome://extensions/` を開く
   - 「デベロッパーモード」を有効にする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `dist` ディレクトリを選択

## 使用方法

1. ブロックしたいサイトにアクセス
2. 拡張機能のアイコンをクリック
3. 「Block this site」ボタンをクリックしてブロック
4. ブロックを解除するには「Unblock this site」ボタンをクリック

## 開発

### ビルドコマンド

- `npm run build`: 完全ビルド（popup + content + manifest）
- `npm run build:popup`: ReactポップアップをViteでビルド
- `npm run build:content`: contentスクリプトをdistにコピー
- `npm run build:manifest`: manifestをdistにコピー

### コード品質

- `npm run lint`: Biomeを使用してソースファイルをlint
- `npm run format`: Biomeを使用してソースファイルをフォーマット

### 技術スタック

- **ポップアップUI**: React 19 + TypeScript
- **ビルドシステム**: Vite
- **content scripts**: Plain JavaScript
- **Linter/Formatter**: Biome

