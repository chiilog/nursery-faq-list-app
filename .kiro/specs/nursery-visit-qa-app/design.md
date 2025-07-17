# 設計書

## 概要

保育園・幼稚園見学質問リスト管理アプリは、PWA（Progressive Web App）として実装し、ローカルファースト設計を採用します。スマートフォンでの使いやすさを最優先とし、オフライン機能とリアルタイム同期を提供する現代的な Web アプリケーションです。

## アーキテクチャ

### 全体アーキテクチャ

```
┌─────────────────────────────────────┐
│           PWA Frontend              │
│  ┌─────────────┐ ┌─────────────────┐│
│  │   React     │ │  Service Worker ││
│  │ Components  │ │  (Offline Cache)││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
           │                 │
           ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│   IndexedDB     │ │   Firebase/     │
│ (Offline Cache) │ │   Supabase      │
└─────────────────┘ └─────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   PostgreSQL    │
                   │   (Supabase)    │
                   └─────────────────┘
```

### 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **UI フレームワーク**: Chakra UI + Emotion
- **状態管理**: Zustand（軽量でシンプル）
- **バックエンド**: Supabase（PostgreSQL + リアルタイム機能）
- **オフラインキャッシュ**: IndexedDB（Dexie.js ラッパー使用）
- **PWA**: Workbox（Service Worker 管理）
- **認証**: Supabase Auth
- **リアルタイム通信**: Supabase Realtime
- **テスト**: Vitest + React Testing Library
- **ホスティング**: Vercel（PWA最適化、自動デプロイ）

#### Supabase 選択理由

- **PostgreSQL**: 構造化データに最適
- **リアルタイム機能**: WebSocket ベースの自動同期
- **認証機能**: 簡単なユーザー管理
- **Row Level Security**: データベースレベルでのセキュリティ
- **オープンソース**: ベンダーロックイン回避

## コンポーネント設計

### 主要コンポーネント

#### 1. アプリケーション層

- **App**: ルートコンポーネント、PWA 初期化
- **Router**: ページルーティング管理
- **Layout**: 共通レイアウト、ナビゲーション

#### 2. ページコンポーネント

- **HomePage**: 質問リスト一覧、新規作成
- **QuestionListPage**: 質問リスト表示・編集
- **TemplatePage**: テンプレート選択・管理
- **SettingsPage**: アプリ設定、データ管理
- **PrintPage**: 印刷用レイアウト

#### 3. 機能コンポーネント

- **QuestionItem**: 個別質問表示・編集
- **AnswerInput**: 回答入力フォーム
- **SyncIndicator**: 同期状況表示
- **OfflineIndicator**: オフライン状態表示
- **ShareModal**: 共有設定モーダル

### データモデル

#### QuestionList（質問リスト）

```typescript
interface QuestionList {
  id: string;
  title: string;
  nurseryName?: string;
  visitDate?: Date;
  questions: Question[];
  sharedWith?: string[]; // 共有相手のID
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
}
```

#### Question（質問）

```typescript
interface Question {
  id: string;
  text: string;
  answer?: string;
  isAnswered: boolean;
  priority: "high" | "medium" | "low";
  category?: string;
  order: number;
  answeredBy?: string; // 回答者ID
  answeredAt?: Date;
}
```

#### SyncState（同期状態）

```typescript
interface SyncState {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingChanges: number;
  conflictResolution?: "local" | "remote" | "manual";
}
```

## インターフェース設計

### API 設計（内部）

#### データストア（IndexedDB）

```typescript
class DataStore {
  // 質問リスト管理
  async createQuestionList(list: QuestionList): Promise<string>;
  async getQuestionList(id: string): Promise<QuestionList | null>;
  async updateQuestionList(
    id: string,
    updates: Partial<QuestionList>
  ): Promise<void>;
  async deleteQuestionList(id: string): Promise<void>;
  async getAllQuestionLists(): Promise<QuestionList[]>;

  // 質問管理
  async updateQuestion(
    listId: string,
    questionId: string,
    updates: Partial<Question>
  ): Promise<void>;
  async addQuestion(
    listId: string,
    question: Omit<Question, "id">
  ): Promise<string>;
  async deleteQuestion(listId: string, questionId: string): Promise<void>;

  // テンプレート管理
  async getTemplates(): Promise<QuestionList[]>;
  async createFromTemplate(
    templateId: string,
    customizations: Partial<QuestionList>
  ): Promise<string>;
}
```

#### Supabase サービス

```typescript
class SupabaseService {
  // OAuth認証管理
  async signInWithGoogle(): Promise<User>;
  async signInWithLine(): Promise<User>;
  async signOut(): Promise<void>;
  async getCurrentUser(): Promise<User | null>;

  // 質問リスト管理
  async createQuestionList(
    list: Omit<QuestionList, "id" | "createdAt" | "updatedAt">
  ): Promise<QuestionList>;
  async getQuestionLists(): Promise<QuestionList[]>;
  async updateQuestionList(
    id: string,
    updates: Partial<QuestionList>
  ): Promise<QuestionList>;
  async deleteQuestionList(id: string): Promise<void>;

  // 共有機能
  async shareQuestionList(listId: string, email: string): Promise<void>;
  async getSharedLists(): Promise<QuestionList[]>;
  async removeShare(listId: string, userId: string): Promise<void>;

  // リアルタイム同期
  subscribeToQuestionList(
    listId: string,
    callback: (payload: any) => void
  ): RealtimeSubscription;
  subscribeToSharedLists(
    callback: (payload: any) => void
  ): RealtimeSubscription;

  // 状態管理
  getSyncState(): SyncState;
  onSyncStateChange(callback: (state: SyncState) => void): void;
}
```

#### データベーススキーマ（Supabase）

```sql
-- ユーザープロファイル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE, -- 任意（プロバイダーによっては取得できない場合がある）
  display_name TEXT,
  provider TEXT NOT NULL, -- 'google', 'line' など
  provider_id TEXT NOT NULL, -- プロバイダー固有のユーザーID
  avatar_url TEXT, -- プロフィール画像URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- 質問リスト
CREATE TABLE question_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  nursery_name TEXT,
  visit_date DATE,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 質問
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES question_lists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  answer TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  category TEXT,
  order_index INTEGER NOT NULL,
  answered_by UUID REFERENCES profiles(id),
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 共有設定
CREATE TABLE question_list_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES question_lists(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('read', 'write')) DEFAULT 'write',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, shared_with)
);
```

### UI/UX 設計原則

#### モバイルファースト設計

- **タッチターゲット**: 最小 44px×44px
- **フォントサイズ**: 最小 16px（ズーム防止）
- **入力フィールド**: 大きめのタップエリア
- **スクロール**: 慣性スクロール対応

#### レスポンシブデザイン

- **ブレークポイント**:
  - Mobile: 320px-768px
  - Tablet: 768px-1024px
  - Desktop: 1024px+

#### アクセシビリティ

- **ARIA 属性**: 適切なラベリング
- **キーボードナビゲーション**: Tab 順序の最適化
- **カラーコントラスト**: WCAG AA 準拠
- **スクリーンリーダー**: 対応

## エラーハンドリング

### エラー分類と対応

#### 1. ネットワークエラー

- **オフライン状態**: ローカルストレージで継続動作
- **同期失敗**: 再試行機能、手動同期オプション
- **接続タイムアウト**: ユーザーフレンドリーなエラーメッセージ

#### 2. データエラー

- **保存失敗**: 自動リトライ、データ復旧機能
- **競合発生**: 競合解決 UI、マージ機能
- **データ破損**: バックアップからの復元

#### 3. ユーザーエラー

- **入力検証**: リアルタイムバリデーション
- **操作ミス**: Undo/Redo 機能
- **誤削除**: 削除確認ダイアログ、ゴミ箱機能

### エラー監視

```typescript
class ErrorHandler {
  logError(error: Error, context: string): void;
  showUserFriendlyMessage(error: Error): void;
  reportCriticalError(error: Error): void;
  recoverFromError(error: Error): Promise<boolean>;
}
```

## テスト戦略（TDD 採用）

### TDD（テスト駆動開発）アプローチ

#### Red-Green-Refactor サイクル

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを書く
3. **Refactor**: コードを改善する

#### テスト分類（t-wada 流）

#### 1. 単体テスト（Unit Test）- 70%

**目的**: 個別の関数・コンポーネントの動作確認

```typescript
// 例: 質問の回答状態更新
describe("Question", () => {
  test("回答を入力すると isAnswered が true になる", () => {
    // Red: 失敗するテストを先に書く
    const question = new Question("質問内容");
    question.setAnswer("回答内容");
    expect(question.isAnswered).toBe(true);
  });
});
```

**対象**:

- ビジネスロジック関数
- React コンポーネント（React Testing Library）
- カスタムフック
- ユーティリティ関数

#### 2. 統合テスト（Integration Test）- 20%

**目的**: コンポーネント間の連携確認

```typescript
// 例: 質問リスト作成フロー
describe("質問リスト作成", () => {
  test("テンプレートから質問リストを作成できる", async () => {
    // Red: 統合的な動作のテストを先に書く
    render(<QuestionListCreator />);

    // テンプレート選択
    await user.click(screen.getByText("0歳児テンプレート"));

    // カスタマイズ
    await user.type(screen.getByLabelText("園名"), "テスト保育園");

    // 保存
    await user.click(screen.getByText("保存"));

    // 結果確認
    expect(screen.getByText("質問リストが作成されました")).toBeInTheDocument();
  });
});
```

**対象**:

- ページコンポーネント間の連携
- データフロー（API → Store → Component）
- Supabase との連携

#### 3. E2E テスト（End-to-End Test）- 10%

**目的**: ユーザーシナリオ全体の動作確認

```typescript
// 例: 見学当日の使用シナリオ
test("見学当日: 質問リストを使って回答を記録できる", async ({ page }) => {
  // ログイン（ボタンのテキストで特定）
  await page.goto("/login");
  await page.getByRole("button", { name: "Googleでログイン" }).click();

  // 質問リスト選択（見出しで特定）
  await page.getByRole("heading", { name: "保育園見学質問リスト" }).click();

  // 質問に回答（ラベルで特定）
  const answerInput = page.getByLabelText("回答を入力してください");
  await answerInput.fill("回答内容");
  await answerInput.press("Enter");

  // 回答済み質問が下に移動することを確認（テキストで特定）
  await expect(page.getByText("回答済み")).toBeVisible();
});
```

### TDD 実践のためのツール設定

#### テスト環境

- **テストランナー**: Vitest（高速、TypeScript 対応）
- **コンポーネントテスト**: React Testing Library
- **E2E テスト**: Playwright
- **モック**: MSW（Mock Service Worker）
- **カバレッジ**: c8（Vitest 内蔵）

#### テスト支援ツール

```typescript
// テストヘルパー
export const renderWithProviders = (ui: ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClient>
        <SupabaseProvider>{children}</SupabaseProvider>
      </QueryClient>
    ),
  });
};

// モックデータファクトリー
export const createMockQuestionList = (overrides = {}) => ({
  id: "mock-list-id",
  title: "テスト質問リスト",
  questions: [],
  createdAt: new Date(),
  ...overrides,
});

// セマンティックなテストヘルパー
export const testHelpers = {
  // ロール・ラベル・テキストベースの要素取得
  getQuestionInput: (container: HTMLElement) =>
    screen.getByLabelText(/質問を入力/i),
  getAnswerInput: (container: HTMLElement) =>
    screen.getByLabelText(/回答を入力/i),
  getSaveButton: (container: HTMLElement) =>
    screen.getByRole("button", { name: /保存/i }),
  getQuestionList: (container: HTMLElement) =>
    screen.getByRole("list", { name: /質問リスト/i }),
};
```

### TDD 開発フロー例

#### 機能開発の流れ

1. **要件理解**: 受入基準をテストケースに変換
2. **Red**: 失敗するテストを書く
3. **Green**: 最小限の実装でテストを通す
4. **Refactor**: コードを改善（テストは変更しない）
5. **繰り返し**: 次の機能に進む

#### 継続的改善

- **テストファースト**: 実装前にテストを書く習慣
- **小さなステップ**: 一度に一つの機能のみ実装
- **リファクタリング**: 動作を変えずにコードを改善
- **テストの保守**: テストコードも品質を保つ

## セキュリティ設計

### データ保護

#### 暗号化

```typescript
class CryptoService {
  async encryptData(data: string, key: CryptoKey): Promise<ArrayBuffer>;
  async decryptData(
    encryptedData: ArrayBuffer,
    key: CryptoKey
  ): Promise<string>;
  async generateKey(): Promise<CryptoKey>;
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
}
```

#### データライフサイクル

- **作成時**: 自動暗号化
- **保存時**: IndexedDB 内で暗号化状態
- **読み込み時**: 自動復号化
- **削除時**: 完全削除（ガベージコレクション対応）

### プライバシー保護

- **ログ記録**: 個人情報除外
- **エラー報告**: 匿名化
- **分析データ**: 収集しない（プライバシーファースト）

## パフォーマンス最適化

### 読み込み最適化

- **コード分割**: React.lazy + Suspense
- **リソース最適化**: 画像圧縮、フォント最適化
- **キャッシュ戦略**: Service Worker 活用

### 実行時最適化

- **仮想化**: 大量質問リスト対応
- **デバウンス**: 入力処理最適化
- **メモ化**: React.memo, useMemo 活用

### ストレージ最適化

- **データ圧縮**: 保存前圧縮
- **インデックス**: 検索性能向上
- **クリーンアップ**: 不要データ自動削除
