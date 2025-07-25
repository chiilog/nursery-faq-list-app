# 要件定義書

## はじめに

保育園・幼稚園見学時に使用する質問リスト管理アプリケーションです。主に 0〜3 歳児の保護者が見学時にスマートフォンで簡単に質問を管理し、回答を記録できることを目的としています。既存のスプレッドシートや Notion では実現できない、モバイル特化の使いやすさと夫婦間での情報共有機能を提供します。

## 要件

### 要件 1：スマートフォン最適化された保育園見学管理

**ユーザーストーリー：** 保護者として、複数の保育園見学を効率的に管理し、各見学時にスマートフォンで簡単に質問リストを確認し、回答を入力したい。そうすることで、保育園ごとに整理された情報を基に適切な判断ができる。

#### 受入基準

1. WHEN ユーザーが保育園を管理する THEN システムは 保育園ごとに見学情報を整理して表示する
2. WHEN ユーザーが質問リストを表示する THEN システムは スマートフォン画面に最適化されたレイアウトで質問を表示する
3. WHEN ユーザーが回答を入力する THEN システムは 画面の不要な拡大を防ぎ、快適な入力体験を提供する
4. WHEN ユーザーが質問に回答を入力する THEN システムは その質問をリストの下部に移動し、未回答の質問を上部に表示する
5. WHEN ユーザーがアプリを使用する THEN システムは 保育園中心の直感的なナビゲーションを提供する
6. WHEN ユーザーがホーム画面を開く THEN システムは 保育園カード一覧をメインコンテンツとして表示する
7. WHEN ユーザーが保育園カードをタップする THEN システムは その保育園の詳細画面に遷移し、全ての関連機能を1画面で提供する

### 要件 2：夫婦間でのリアルタイム情報共有

**ユーザーストーリー：** 夫婦として、見学時に互いの質問と回答をリアルタイムで共有したい。そうすることで、効率的に役割分担しながら情報収集ができる。

#### 受入基準

1. WHEN 一方の保護者が質問に回答を入力する THEN システムは その情報をもう一方の保護者のデバイスにリアルタイムで同期する
2. WHEN 保護者が質問リストを確認する THEN システムは 現在パートナーがどの質問を入力中かを表示する
3. WHEN 複数のデバイスから同じ質問リストにアクセスする THEN システムは データの整合性を保持する

### 要件 3：質問テンプレート機能

**ユーザーストーリー：** 初めて見学する保護者として、何を質問すべきかわからない時に、テンプレートから質問リストを作成したい。そうすることで、重要な確認事項を漏らすことなく見学できる。

#### 受入基準

1. WHEN ユーザーが新しい質問リストを作成する THEN システムは 事前定義された質問テンプレートを選択肢として提供する
2. WHEN ユーザーがテンプレートを選択する THEN システムは そのテンプレートの質問項目を質問リストに追加する
3. WHEN ユーザーがテンプレートから質問リストを作成する THEN システムは ユーザーが質問を追加・編集・削除できる機能を提供する
4. IF ユーザーが年齢別テンプレートを選択する THEN システムは その年齢に適した質問項目を提供する

### 要件 4：印刷機能

**ユーザーストーリー：** 保護者として、デジタルデバイスを使わずに手書きで記録したい場合に、質問リストを印刷したい。そうすることで、手のひらサイズの紙で手軽にメモを取ることができる。

#### 受入基準

1. WHEN ユーザーが印刷機能を使用する THEN システムは 質問リストを印刷に適したフォーマットで出力する
2. WHEN 印刷用フォーマットを生成する THEN システムは 手のひらサイズでの使用を考慮したレイアウトを提供する
3. WHEN 印刷用フォーマットを表示する THEN システムは 回答記入用のスペースを各質問項目に含める

### 要件 5：オフライン機能

**ユーザーストーリー：** 保護者として、見学先で電波が不安定な場合でも質問リストを使用し、回答を入力したい。そうすることで、通信環境に関係なく見学に集中できる。

#### 受入基準

1. WHEN ユーザーがオフライン状態でアプリを使用する THEN システムは 質問リストの表示と回答入力を継続して提供する
2. WHEN ユーザーがオフライン状態で回答を入力する THEN システムは データをローカルストレージに保存する
3. WHEN デバイスがオンライン状態に復帰する THEN システムは ローカルに保存されたデータを自動的にサーバーと同期する
4. WHEN 複数のデバイスがオフライン状態で同じ質問リストを編集する THEN システムは オンライン復帰時に競合を適切に処理する
5. WHEN ユーザーがオフライン状態を確認する THEN システムは 現在の接続状態を明確に表示する

### 要件 6：データセキュリティとプライバシー

**ユーザーストーリー：** 保護者として、子供や家族の個人情報を含む見学記録を安全に管理したい。そうすることで、プライバシーを保護しながら安心してアプリを使用できる。

#### 受入基準

1. WHEN ユーザーがデータを保存する THEN システムは ローカルストレージ内のデータを暗号化して保存する
2. WHEN ユーザーがアプリを終了する THEN システムは 機密性の高いデータをメモリから適切にクリアする
3. WHEN ユーザーがデータ削除を要求する THEN システムは 指定されたデータを完全に削除する機能を提供する
4. WHEN ユーザーがデータをエクスポートする THEN システムは データを安全な形式でエクスポートする機能を提供する
5. WHEN システムがエラーログを記録する THEN システムは 個人情報を含まない形でログを記録する

### 要件 7：質問リストのカスタマイズ

**ユーザーストーリー：** 保護者として、自分の状況や関心事に合わせて質問リストをカスタマイズしたい。そうすることで、個別のニーズに対応した効果的な見学ができる。

#### 受入基準

1. WHEN ユーザーが質問リストを編集する THEN システムは 質問の追加、編集、削除機能を提供する
2. WHEN ユーザーが質問を追加する THEN システムは 自由形式のテキスト入力を受け付ける
3. WHEN ユーザーが質問の順序を変更する THEN システムは ドラッグ&ドロップまたは同等の直感的な操作を提供する
4. WHEN ユーザーが質問リストを保存する THEN システムは 変更内容を永続化する
