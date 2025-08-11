/**
 * データモデルの型定義
 * 保育園中心の設計に基づいた型安全性を保証
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
  insights?: string[]; // 気づきタグの配列（タグ形式で管理）
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

export interface SyncState {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingChanges: number;
  conflictResolution?: 'local' | 'remote' | 'manual';
}

// 保育園作成時の入力データ型
export interface CreateNurseryInput {
  name: string;
  visitDate?: Date;
}

// 保育園更新時の入力データ型
export interface UpdateNurseryInput {
  name?: string;
  visitSessions?: VisitSession[];
}

// 見学セッション作成時の入力データ型
export interface CreateVisitSessionInput {
  visitDate: Date;
  status?: VisitSessionStatus;
  insights?: string[]; // 気づきタグの配列
  questions?: CreateQuestionInput[];
  sharedWith?: string[];
}

// 見学セッション更新時の入力データ型
export interface UpdateVisitSessionInput {
  visitDate?: Date;
  status?: VisitSessionStatus;
  insights?: string[]; // 気づきタグの配列
}

// 質問作成時の入力データ型
export interface CreateQuestionInput {
  text: string;
  answer?: string;
  isAnswered?: boolean;
}

// 質問更新時の入力データ型
export interface UpdateQuestionInput {
  text?: string;
  answer?: string;
  isAnswered?: boolean;
}

// 質問テンプレート作成時の入力データ型
export interface CreateQuestionTemplateInput {
  title: string;
  description?: string;
  ageGroup?: string;
  questions: Omit<
    Question,
    'id' | 'answer' | 'isAnswered' | 'answeredBy' | 'answeredAt'
  >[];
}

// 見学セッションの統計情報型
export interface VisitSessionStats {
  total: number;
  answered: number;
  unanswered: number;
  progress: number;
}

// 保育園の統計情報型
export interface NurseryStats {
  totalSessions: number;
  completedSessions: number;
  plannedSessions: number;
  cancelledSessions: number;
  totalQuestions: number;
  totalAnsweredQuestions: number;
  overallProgress: number;
}
