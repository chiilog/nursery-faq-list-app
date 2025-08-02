/**
 * データモデルの型定義
 * 保育園中心の設計に基づいた型安全性を保証
 */

// 質問の優先度
export type QuestionPriority = 'high' | 'medium' | 'low';

// 見学セッションのステータス
export type VisitSessionStatus = 'planned' | 'completed' | 'cancelled';

// 質問の型定義
export interface Question {
  id: string;
  text: string;
  answer?: string;
  isAnswered: boolean;
  priority: QuestionPriority;
  category?: string;
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
  notes?: string;
  sharedWith?: string[]; // 共有相手のID
  createdAt: Date;
  updatedAt: Date;
}

// 保育園の型定義
export interface Nursery {
  id: string;
  name: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  visitSessions: VisitSession[];
  notes?: string;
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

/**
 * @deprecated 旧設計の型定義 - 保育園中心設計への移行後に削除予定
 * NOTE: この型は後方互換性のために一時的に残しています。
 * 新規実装では使用せず、Nursery/VisitSession/Questionの構造を使用してください。
 * 削除予定: 全てのコンポーネントが新設計に移行完了後
 */
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
  address?: string;
  phoneNumber?: string;
  website?: string;
  notes?: string;
  visitSessions?: VisitSession[]; // 内部実装用（一時的に追加）
}

// 見学セッション作成時の入力データ型
export interface CreateVisitSessionInput {
  visitDate: Date;
  status?: VisitSessionStatus;
  notes?: string;
  questions?: CreateQuestionInput[];
}

// 見学セッション更新時の入力データ型
export interface UpdateVisitSessionInput {
  visitDate?: Date;
  status?: VisitSessionStatus;
  notes?: string;
}

// 質問作成時の入力データ型
export interface CreateQuestionInput {
  text: string;
  answer?: string;
  isAnswered?: boolean;
  priority?: QuestionPriority;
  category?: string;
}

// 質問更新時の入力データ型
export interface UpdateQuestionInput {
  text?: string;
  answer?: string;
  isAnswered?: boolean;
  priority?: QuestionPriority;
  category?: string;
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

/**
 * @deprecated 旧設計の入力型 - 保育園中心設計への移行後に削除予定
 * NOTE: 既存のコンポーネントとの互換性のため一時的に残しています。
 * 新規実装では CreateNurseryInput/CreateVisitSessionInput を使用してください。
 */
export interface CreateQuestionListInput {
  title: string;
  nurseryName?: string;
  visitDate?: Date;
  isTemplate?: boolean;
}

/**
 * @deprecated 旧設計の更新型 - 保育園中心設計への移行後に削除予定
 * NOTE: 既存のコンポーネントとの互換性のため一時的に残しています。
 * 新規実装では UpdateNurseryInput/UpdateVisitSessionInput を使用してください。
 */
export interface UpdateQuestionListInput {
  title?: string;
  nurseryName?: string;
  visitDate?: Date;
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

/**
 * @deprecated 旧設計の統計型 - 保育園中心設計への移行後に削除予定
 * NOTE: 既存のコンポーネントとの互換性のため一時的に残しています。
 * 新規実装では VisitSessionStats/NurseryStats を使用してください。
 */
export interface QuestionListStats {
  total: number;
  answered: number;
  unanswered: number;
  progress: number;
}
