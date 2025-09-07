/**
 * エンティティ型定義
 * ドメインエンティティの型定義を集約
 */

// 見学セッションのステータス
export type VisitSessionStatus = 'planned' | 'completed' | 'cancelled';

// 質問の型定義
export interface Question {
  id: string;
  text: string;
  answer?: string;
  isAnswered: boolean;
  answeredBy?: string; // 回答者ID
  answeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 見学セッションの型定義
export interface VisitSession {
  id: string;
  visitDate: Date | null; // nullの場合は「未定」を表現
  status: VisitSessionStatus;
  questions: Question[];
  insights: string[]; // 気づきタグの配列（タグ形式で管理）
  sharedWith?: string[]; // 共有相手のID
  createdAt: Date;
  updatedAt: Date;
}

// 保育園の型定義
export interface Nursery {
  id: string;
  name: string;
  visitSessions: VisitSession[];
  createdAt: Date;
  updatedAt: Date;
}

// テンプレート型定義（判別共用体）
export type Template = SystemTemplate | CustomTemplate;

export interface SystemTemplate {
  id: string;
  name: string;
  questions: ReadonlyArray<string>;
  isSystem: true; // true: システム提供
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomTemplate {
  id: string;
  name: string;
  questions: ReadonlyArray<string>;
  isSystem: false; // false: ユーザー作成
  createdBy: string; // ユーザーID（カスタムテンプレートの場合必須）
  createdAt: Date;
  updatedAt: Date;
}

// 型ガード関数
export function isSystemTemplate(
  template: Template
): template is SystemTemplate {
  return template.isSystem === true;
}

export function isCustomTemplate(
  template: Template
): template is CustomTemplate {
  return template.isSystem === false;
}
