# コード品質チェック & 修正

以下の手順で品質チェックと修正を実行してください：

## 1. コメントのチェック

コメントとドキュメンテーション\*\*

- **TDDコメント（"TDD Red:", "TDD Green:", "TDD Refactor:"など）は最終的には削除してください**
- **すべての関数とクラスには以下のJSDocコメントを付けてください**：
  - `@description` - 関数やクラスの目的と動作の説明
  - `@param` - 各パラメータの型と説明
  - `@returns` - 戻り値の型と説明
  - `@throws` - 投げる可能性のある例外（該当する場合）
  - `@example` - 使用例（複雑な関数の場合）
- **ファイルの最終バージョンではプロダクション品質のコメントのみを残してください**

**JSDocの例**：

````typescript
/**
 * @description ユーザーの年齢から成人かどうかを判定する
 * @param age - ユーザーの年齢
 * @returns 成人の場合true、未成年の場合false
 * @throws {Error} 年齢が負の数の場合
 * @example
 * ```typescript
 * const isAdult = checkAdult(20); // true
 * const isMinor = checkAdult(17); // false
 * ```
 */
function checkAdult(age: number): boolean {
  // ...
}
````

## 2. 型チェック実行

```bash
npm run typecheck
```

## 3. ESLintチェック実行

```bash
npm run lint:fix
```

## 4. エラーがある場合の対応

- TypeScriptエラー: 該当ファイルを編集して型エラーを修正
- ESLintエラー: `npm run lint -- --fix` を優先し、残ったものを手動修正

## 5. 修正後の再チェック

```bash
npm run typecheck && npm run lint:fix
```

## 6. テストの実行

TypeScriptエラーとESLintエラーが解消されたら、テストを実行してください。

```bash
npm run test
```

**重要**: エラーが検出された場合は、エラー内容を分析して該当ファイルを実際に編集・修正してください。報告だけでなく、実際の修正作業まで行ってください。最終的に「エラーなし」の状態まで修正を完了させてください。
