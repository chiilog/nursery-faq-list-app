/**
 * 保育園状態管理ストア（Zustand）
 * 保育園中心設計に基づいた状態管理とエラーハンドリング
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Nursery,
  CreateNurseryInput,
  UpdateNurseryInput,
  VisitSession,
  CreateVisitSessionInput,
  UpdateVisitSessionInput,
  SyncState,
  NurseryStats,
} from '../types/data';
import { nurseryDataStore, NurseryDataStoreError } from '../services/nurseryDataStore';

// エラー情報の型定義
export interface AppError {
  message: string;
  code?: string;
  timestamp: Date;
}

// ローディング状態の型定義
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

// ストアの状態型定義
interface NurseryState {
  // データ状態
  nurseries: Nursery[];
  currentNursery: Nursery | null;
  currentVisitSession: VisitSession | null;

  // UI状態
  loading: LoadingState;
  error: AppError | null;
  syncState: SyncState;

  // アクション: 保育園管理
  loadNurseries: () => Promise<void>;
  createNursery: (input: CreateNurseryInput) => Promise<string>;
  updateNursery: (id: string, updates: UpdateNurseryInput) => Promise<void>;
  deleteNursery: (id: string) => Promise<void>;
  setCurrentNursery: (id: string | null) => Promise<void>;

  // アクション: 見学セッション管理
  createVisitSession: (nurseryId: string, input: CreateVisitSessionInput) => Promise<string>;
  updateVisitSession: (sessionId: string, updates: UpdateVisitSessionInput) => Promise<void>;
  deleteVisitSession: (sessionId: string) => Promise<void>;
  setCurrentVisitSession: (sessionId: string | null) => Promise<void>;

  // アクション: エラー・状態管理
  clearError: () => void;
  setLoading: (loading: LoadingState) => void;

  // アクション: ユーティリティ
  getNurseryStats: (nurseryId: string) => NurseryStats | null;
}

// 初期状態
const initialState = {
  nurseries: [],
  currentNursery: null,
  currentVisitSession: null,
  loading: { isLoading: false },
  error: null,
  syncState: {
    isOnline: true,
    pendingChanges: 0,
  },
};

/**
 * 保育園ストア
 */
export const useNurseryStore = create<NurseryState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 保育園管理アクション
      async loadNurseries() {
        const { setLoading, clearError } = get();

        try {
          setLoading({
            isLoading: true,
            operation: '保育園リストを読み込み中...',
          });
          clearError();

          const nurseries = await nurseryDataStore.getAllNurseries();

          set((state) => ({
            nurseries,
            // 現在の保育園が削除されている場合はクリア
            currentNursery: state.currentNursery
              ? nurseries.find((n) => n.id === state.currentNursery!.id) || null
              : null,
          }));
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '保育園リストの読み込みに失敗しました',
            code: error instanceof NurseryDataStoreError ? error.code : 'LOAD_NURSERIES_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async createNursery(input: CreateNurseryInput) {
        const { setLoading, clearError, loadNurseries } = get();

        try {
          setLoading({ isLoading: true, operation: '保育園を作成中...' });
          clearError();

          const nurseryId = await nurseryDataStore.createNursery(input);

          // リストを再読み込み
          await loadNurseries();

          return nurseryId;
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '保育園の作成に失敗しました',
            code:
              error instanceof NurseryDataStoreError ? error.code : 'CREATE_NURSERY_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async updateNursery(id: string, updates: UpdateNurseryInput) {
        const { setLoading, clearError, loadNurseries } = get();

        try {
          setLoading({ isLoading: true, operation: '保育園情報を更新中...' });
          clearError();

          await nurseryDataStore.updateNursery(id, updates);

          // リストを再読み込み
          await loadNurseries();
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '保育園の更新に失敗しました',
            code:
              error instanceof NurseryDataStoreError ? error.code : 'UPDATE_NURSERY_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async deleteNursery(id: string) {
        const { setLoading, clearError, loadNurseries } = get();

        try {
          setLoading({ isLoading: true, operation: '保育園を削除中...' });
          clearError();

          await nurseryDataStore.deleteNursery(id);

          // 削除された保育園が現在の保育園の場合はクリア
          set((state) => ({
            currentNursery:
              state.currentNursery?.id === id ? null : state.currentNursery,
            currentVisitSession: null, // 関連する見学セッションもクリア
          }));

          // リストを再読み込み
          await loadNurseries();
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '保育園の削除に失敗しました',
            code:
              error instanceof NurseryDataStoreError ? error.code : 'DELETE_NURSERY_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async setCurrentNursery(id: string | null) {
        const { setLoading, clearError } = get();

        if (!id) {
          set({ currentNursery: null, currentVisitSession: null });
          return;
        }

        try {
          setLoading({
            isLoading: true,
            operation: '保育園情報を読み込み中...',
          });
          clearError();

          const nursery = await nurseryDataStore.getNursery(id);
          set({ 
            currentNursery: nursery,
            currentVisitSession: null, // 保育園変更時は見学セッションもクリア
          });
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '保育園情報の読み込みに失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : 'LOAD_NURSERY_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
        } finally {
          setLoading({ isLoading: false });
        }
      },

      // 見学セッション管理アクション
      async createVisitSession(nurseryId: string, input: CreateVisitSessionInput) {
        const { setLoading, clearError, setCurrentNursery } = get();

        try {
          setLoading({ isLoading: true, operation: '見学セッションを作成中...' });
          clearError();

          const sessionId = await nurseryDataStore.createVisitSession(nurseryId, input);

          // 現在の保育園を更新
          await setCurrentNursery(nurseryId);

          return sessionId;
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '見学セッションの作成に失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : 'CREATE_SESSION_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async updateVisitSession(sessionId: string, updates: UpdateVisitSessionInput) {
        const { setLoading, clearError, currentNursery, setCurrentNursery } = get();

        try {
          setLoading({ isLoading: true, operation: '見学セッション情報を更新中...' });
          clearError();

          await nurseryDataStore.updateVisitSession(sessionId, updates);

          // 現在の保育園を更新
          if (currentNursery) {
            await setCurrentNursery(currentNursery.id);
          }
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '見学セッションの更新に失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : 'UPDATE_SESSION_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async deleteVisitSession(sessionId: string) {
        const { setLoading, clearError, currentNursery, setCurrentNursery } = get();

        try {
          setLoading({ isLoading: true, operation: '見学セッションを削除中...' });
          clearError();

          await nurseryDataStore.deleteVisitSession(sessionId);

          // 削除されたセッションが現在のセッションの場合はクリア
          set((state) => ({
            currentVisitSession:
              state.currentVisitSession?.id === sessionId 
                ? null 
                : state.currentVisitSession,
          }));

          // 現在の保育園を更新
          if (currentNursery) {
            await setCurrentNursery(currentNursery.id);
          }
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '見学セッションの削除に失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : 'DELETE_SESSION_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async setCurrentVisitSession(sessionId: string | null) {
        const { setLoading, clearError, currentNursery } = get();

        if (!sessionId) {
          set({ currentVisitSession: null });
          return;
        }

        try {
          setLoading({
            isLoading: true,
            operation: '見学セッション情報を読み込み中...',
          });
          clearError();

          const session = await nurseryDataStore.getVisitSession(sessionId);
          
          if (session) {
            set({ currentVisitSession: session });
          } else {
            throw new Error('見学セッションが見つかりません');
          }
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : '見学セッション情報の読み込みに失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : 'LOAD_SESSION_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
        } finally {
          setLoading({ isLoading: false });
        }
      },

      // エラー・状態管理アクション
      clearError() {
        set({ error: null });
      },

      setLoading(loading: LoadingState) {
        set({ loading });
      },

      // ユーティリティアクション
      getNurseryStats(nurseryId: string) {
        const { nurseries, currentNursery } = get();

        let targetNursery: Nursery | undefined;

        if (currentNursery && currentNursery.id === nurseryId) {
          targetNursery = currentNursery;
        } else {
          targetNursery = nurseries.find((nursery) => nursery.id === nurseryId);
        }

        if (!targetNursery) {
          return null;
        }

        const totalSessions = targetNursery.visitSessions.length;
        const completedSessions = targetNursery.visitSessions.filter(
          (session) => session.status === 'completed'
        ).length;
        const plannedSessions = targetNursery.visitSessions.filter(
          (session) => session.status === 'planned'
        ).length;
        const cancelledSessions = targetNursery.visitSessions.filter(
          (session) => session.status === 'cancelled'
        ).length;

        const totalQuestions = targetNursery.visitSessions.reduce(
          (total, session) => total + session.questions.length,
          0
        );
        const totalAnsweredQuestions = targetNursery.visitSessions.reduce(
          (total, session) => 
            total + session.questions.filter((q) => q.isAnswered).length,
          0
        );

        const overallProgress = totalQuestions > 0 
          ? Math.round((totalAnsweredQuestions / totalQuestions) * 100 * 100) / 100
          : 0;

        return {
          totalSessions,
          completedSessions,
          plannedSessions,
          cancelledSessions,
          totalQuestions,
          totalAnsweredQuestions,
          overallProgress,
        };
      },
    }),
    {
      name: 'nursery-store',
      // デバッグモードでのみdevtoolsを有効化
      enabled: import.meta.env?.DEV ?? false,
    }
  )
);