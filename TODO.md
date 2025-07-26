# TODO リスト

## テスト改善項目

### ビジュアル回帰テスト

- [ ] **NurseryCard コンポーネント** (`src/components/NurseryCard.test.tsx`)
  - ホバー状態のスタイルテスト（shadow: 'md', transform: 'translateY(-1px)', borderColor: 'brand.200'）
  - フォーカス状態のスタイルテスト（shadow: 'outline', borderColor: 'brand.300'）
  - アクティブ状態のスタイルテスト（transform: 'translateY(0)', shadow: 'sm'）
  - トランジション効果のテスト（transition: "all 0.2s ease-in-out"）
  - 実装時期: Phase 1b完了後（4.5 保育園詳細画面実装後）
  - ツール候補: @testing-library/jest-dom のtoHaveStyle、またはstorybook + chromatic

### パフォーマンステスト

- [ ] **レンダリング性能測定**
  - 大量の保育園カード（100件以上）表示時の性能テスト
  - メモ化効果の検証
  - 実装時期: Phase 1完了後（タスク7.1-7.2の最適化時に実施）

- [ ] **NurseryCreator パフォーマンステスト**
  - 大量入力時の応答性テスト
  - 連続保存クリックの防止確認
  - 実装時期: Phase 1完了後の最適化時に実施

### アクセシビリティテスト拡張

- [ ] **スクリーンリーダー対応テスト**
  - aria-live を使用した動的コンテンツ更新の通知テスト
  - キーボードナビゲーションの順序テスト
  - 実装時期: Phase 1完了後

## 技術的改善項目

### セキュリティテスト

- [ ] **XSS攻撃対策テスト**
  - 悪意のあるスクリプト入力に対する防御テスト
  - HTMLタグ入力時の適切なエスケープ確認
  - 実装時期: Phase 2の認証機能実装時に実施

- [ ] **データ注入攻撃対策テスト**
  - SQLインジェクション対策確認（D1データベース使用時）
  - 実装時期: Phase 2の認証機能実装時に実施

### E2Eテスト

- [ ] **主要ユーザーフローのテスト**
  - 保育園追加から質問回答まで一連の操作テスト
  - クロスブラウザテスト
  - PWA機能のテスト
  - 実装時期: タスク6.3で実施予定

### エラーハンドリング

- [ ] **境界値テスト**
  - 非常に長い保育園名の表示テスト
  - 特殊文字を含むデータの処理テスト
  - 日付データの境界値テスト（過去/未来の極端な日付）

### テスト修正項目

- [ ] **Router.test.tsx の失敗テスト修正**
  - **テスト名**: `ルートパスで質問リスト一覧が表示される`
  - **エラー**: `Unable to find an accessible element with the role "heading" and name /質問リスト一覧/i`
  - **原因**: テストが期待している「質問リスト一覧」見出しが存在しない。実際の画面には「保育園見学質問リスト」が表示されている
  - **修正方法**: テストの期待値を実際の画面表示に合わせて修正
  - **ファイル**: `src/components/Router.test.tsx:47-51`
- [ ] **Router.test.tsx の失敗テスト修正**
  - **テスト名**: `すべてのページでLayoutコンポーネントが使用される`
  - **エラー**: `Unable to find an accessible element with the role "navigation" and name /メインナビゲーション/i`
  - **原因**: テストが期待している「メインナビゲーション」が存在しない。現在のLayoutにはnavigation要素がない
  - **修正方法**: Layoutコンポーネントのnavigation実装またはテストの期待値修正
  - **ファイル**: `src/components/Router.test.tsx:71-75`
  - **優先度**: 中（ナビゲーション機能の実装方針決定後に修正）

## 注意事項

- このTODOリストは品質向上のための改善項目です
- 実装計画（`.kiro/specs/nursery-visit-qa-app/tasks.md`）の進捗を優先してください
- 各項目の実装時期は目安です。実際の開発状況に応じて調整してください
