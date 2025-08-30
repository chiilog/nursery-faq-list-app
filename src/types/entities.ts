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

// 質問テンプレートの型定義
export interface QuestionTemplate {
  id: string;
  title: string;
  description?: string;
  isCustom: boolean; // true: ユーザー作成、false: システム提供
  questions: Array<{
    text: string;
    order?: number;
  }>;
  createdBy?: string; // ユーザーID（カスタムテンプレートの場合のみ）
  createdAt: Date;
  updatedAt: Date;
}

// 新しいテンプレート型定義（DRY/KISS原則に基づく統合版）
export interface Template {
  id: string;
  name: string;
  questions: string[]; // 質問文字列の配列にシンプル化
  isSystem: boolean; // true: システム提供、false: カスタム
  createdAt: string;
  updatedAt: string;
}
