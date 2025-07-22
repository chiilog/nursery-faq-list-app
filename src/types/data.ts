/**
 * データモデルの型定義
 * 設計書に基づいたQuestionListとQuestionインターフェース
 */

export interface Question {
  id: string;
  text: string;
  answer?: string;
  isAnswered: boolean;
  priority: "high" | "medium" | "low";
  category?: string;
  order: number;
  answeredBy?: string; // 回答者ID
  answeredAt?: Date;
}

export interface QuestionList {
  id: string;
  title: string;
  nurseryName?: string;
  visitDate?: Date;
  questions: Question[];
  sharedWith?: string[]; // 共有相手のID
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
}

export interface SyncState {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingChanges: number;
  conflictResolution?: "local" | "remote" | "manual";
}

// 質問作成時の入力データ型
export interface CreateQuestionInput {
  text: string;
  priority?: "high" | "medium" | "low";
  category?: string;
}

// 質問リスト作成時の入力データ型
export interface CreateQuestionListInput {
  title: string;
  nurseryName?: string;
  visitDate?: Date;
  isTemplate?: boolean;
}

// 質問更新時の入力データ型
export interface UpdateQuestionInput {
  text?: string;
  answer?: string;
  priority?: "high" | "medium" | "low";
  category?: string;
  order?: number;
}

// 質問リスト更新時の入力データ型
export interface UpdateQuestionListInput {
  title?: string;
  nurseryName?: string;
  visitDate?: Date;
}