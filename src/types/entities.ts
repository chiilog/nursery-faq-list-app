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
  ageGroup?: string; // '0-1歳', '1-2歳', '2-3歳', '一般' など
  questions: Omit<
    Question,
    'id' | 'answer' | 'isAnswered' | 'answeredBy' | 'answeredAt'
  >[];
  createdAt: Date;
  updatedAt: Date;
}
