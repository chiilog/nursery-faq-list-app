# nursery-faq-list-app

保育園・幼稚園見学で使える、質問リストを管理するアプリ

## 環境設定

### Google Analytics 4 (GA4) 設定

GA4でアクセス解析を行う場合は、以下の手順で測定IDを設定してください：

#### 追加の環境変数

GA4機能の有効/無効を切り替えるため、以下の環境変数も設定可能です。

```bash
# 有効化（デフォルト想定）
VITE_ANALYTICS_ENABLED=true
# 明示的に無効化したい場合（例: ステージングやPRプレビュー）
VITE_ANALYTICS_ENABLED=false
```

アプリは `VITE_ANALYTICS_ENABLED === 'false'` のときは同意があっても初期化を行いません。

#### ローカル開発環境

```bash
# .env.local ファイルに追加
VITE_GA4_MEASUREMENT_ID=G-あなたの測定ID
```

#### 本番環境（AWS Amplify）

1. AWS Amplify Console → アプリを選択
2. 「環境変数」タブを開く
3. 新しい環境変数を追加：
   - キー: `VITE_GA4_MEASUREMENT_ID`
   - 値: `G-あなたの測定ID`

**注意:** GA4測定IDはGoogle Analytics 4のプロパティ設定から取得できます（例: G-XXXXXXXXXX）

### Microsoft Clarity 設定

Microsoft Clarityでユーザーエクスペリエンス分析を行う場合は、以下の手順でプロジェクトIDを設定してください：

#### ローカル開発環境

```bash
# .env.local ファイルに追加
VITE_CLARITY_PROJECT_ID=あなたのプロジェクトID
```

#### 本番環境（AWS Amplify）

1. AWS Amplify Console → アプリを選択
2. 「環境変数」タブを開く
3. 新しい環境変数を追加：
   - キー: `VITE_CLARITY_PROJECT_ID`
   - 値: `あなたのプロジェクトID`

**注意:** Microsoft ClarityプロジェクトIDはMicrosoft Clarityダッシュボードのプロジェクト設定から取得できます（例: abcdef1234）
