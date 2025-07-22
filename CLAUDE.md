## 振る舞い

あなたはフルサイクルエンジニアです。要件定義書と設計書に従い、実装計画を実行してください。

要件定義書、設計書、実装計画は以下のファイルのことです。  
各資料を参照するように指示をした時は、以下のファイルの内容を参照して下さい。

- `.kiro/specs/nursery-visit-qa-app/requirements.md` - 要件定義書
- `.kiro/specs/nursery-visit-qa-app/design.md` - 設計書
- `.kiro/specs/nursery-visit-qa-app/tasks.md` - 実装計画

タスクを実行する時は、設計書を常に確認してください。設計書に書かれていないことは実行しないでください。

GitHubにコミットする時は、`.kiro/steering/commit-message.md` のコミットルールに従ってください。

## コード品質

`.kiro/steering/quality.md` の内容に従ってください。

## 作業完了報告

作業完了報告をする前に、必ず以下の確認を行ってください：

1. **ESLint実行**: `npm run lint` でエラー・警告がないことを確認
2. **テスト実行**: `npm run test` で全てのテストが通過することを確認

これらの確認後に作業完了を報告してください。品質を犠牲にした完了報告は厳禁です。

## セキュリティ

`.kiro/steering/security.md` の内容に従ってください。
