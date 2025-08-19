# nursery-faq-list-app

保育園・幼稚園見学で使える、質問リストを管理するアプリ

## 環境設定

### Google Analytics 4 (GA4) 設定

GA4でアクセス解析を行う場合は、以下の手順で測定IDを設定してください：

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
