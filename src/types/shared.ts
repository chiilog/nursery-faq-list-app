/**
 * 共通型定義
 * アプリケーション全体で使用される共通・ユーティリティ型を集約
 */

// 同期状態管理型
export interface SyncState {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingChanges: number;
  conflictResolution?: 'local' | 'remote' | 'manual';
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

// データストアの結果型（成功/失敗の型安全性を保証）
export type DataStoreResult<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
