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
  /** 進捗率（%）。0〜100 の整数を想定 */
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
  /** 全体進捗率（%）。0〜100 の整数を想定 */
  overallProgress: number;
}

// データストアの結果型（成功/失敗の型安全性を保証）
export type DataStoreResult<T, E = unknown> =
  | { success: true; data: T }
  | { success: false; error: E };
