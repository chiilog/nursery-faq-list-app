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
  - 実装時期: Phase 1完了後

### アクセシビリティテスト拡張

- [ ] **スクリーンリーダー対応テスト**
  - aria-live を使用した動的コンテンツ更新の通知テスト
  - キーボードナビゲーションの順序テスト
  - 実装時期: Phase 1完了後

## 技術的改善項目

### エラーハンドリング

- [ ] **境界値テスト**
  - 非常に長い保育園名の表示テスト
  - 特殊文字を含むデータの処理テスト
  - 日付データの境界値テスト（過去/未来の極端な日付）

## 注意事項

- このTODOリストは品質向上のための改善項目です
- 実装計画（`.kiro/specs/nursery-visit-qa-app/tasks.md`）の進捗を優先してください
- 各項目の実装時期は目安です。実際の開発状況に応じて調整してください
