# コード品質チェック & 修正

以下の手順で品質チェックと修正を実行してください：

## 1. 型チェック実行

```bash
npm run typecheck
```

## 2. ESLintチェック実行

```bash
npm run lint:fix
```

## 3. エラーがある場合の対応

- TypeScriptエラー: 該当ファイルを編集して型エラーを修正
- ESLintエラー: `npm run lint -- --fix` を優先し、残ったものを手動修正

## 4. 修正後の再チェック

```bash
npm run typecheck && npm run lint:fix
```

## 5. テストの実行

TypeScriptエラーとESLintエラーが解消されたら、テストを実行してください。

```bash
npm run test
```

**重要**: エラーが検出された場合は、エラー内容を分析して該当ファイルを実際に編集・修正してください。報告だけでなく、実際の修正作業まで行ってください。最終的に「エラーなし」の状態まで修正を完了させてください。
