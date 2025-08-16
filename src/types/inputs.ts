/**
 * 入力型定義
 * CRUD操作用の入力型定義を集約
 */

import type { VisitSession, Question, VisitSessionStatus } from './entities';

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
  sharedWith?: string[];
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
