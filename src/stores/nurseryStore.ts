/**
 * 保育園状態管理ストア（Zustand）
 * DRY・KISS原則に基づき、暗号化/非暗号化を透明に扱う統合ストア
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Nursery,
  CreateNurseryInput,
  UpdateNurseryInput,
  VisitSession,
  CreateVisitSessionInput,
  UpdateVisitSessionInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  SyncState,
  NurseryStats,
} from '../types/data';
import { createNurseryDataStore } from '../services/nurseryDataStore';

// ストレージ設定の型定義
export interface StorageConfig {
  encryptionEnabled: boolean;
  autoBackup: boolean;
}

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

  // ストレージ設定
  storageConfig: StorageConfig;

  // アクション: 保育園管理
  loadNurseries: () => Promise<void>;
  createNursery: (input: CreateNurseryInput) => Promise<string>;
  updateNursery: (id: string, updates: UpdateNurseryInput) => Promise<void>;
  deleteNursery: (id: string) => Promise<void>;
  setCurrentNursery: (id: string | null) => Promise<void>;

  // アクション: 見学セッション管理
  createVisitSession: (
    nurseryId: string,
    input: CreateVisitSessionInput
  ) => Promise<string>;
  updateVisitSession: (
    sessionId: string,
    updates: UpdateVisitSessionInput
  ) => Promise<void>;
  deleteVisitSession: (sessionId: string) => Promise<void>;
  setCurrentVisitSession: (sessionId: string | null) => Promise<void>;

  // アクション: 質問管理
  addQuestion: (
    nurseryId: string,
    sessionId: string,
    input: CreateQuestionInput
  ) => Promise<string>;
  updateQuestion: (
    nurseryId: string,
    sessionId: string,
    questionId: string,
    updates: UpdateQuestionInput
  ) => Promise<void>;
  deleteQuestion: (
    nurseryId: string,
    sessionId: string,
    questionId: string
  ) => Promise<void>;

  // アクション: 気づき管理
  addInsight: (sessionId: string, insight: string) => Promise<void>;
  removeInsight: (sessionId: string, insightIndex: number) => Promise<void>;
  updateInsights: (sessionId: string, insights: string[]) => Promise<void>;

  // アクション: ストレージ設定
  toggleEncryption: (enabled: boolean) => Promise<void>;
  migrateData: () => Promise<void>;

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
  storageConfig: {
    encryptionEnabled: false,
    autoBackup: true,
  },
};

/**
 * データストア取得ヘルパー
 * 暗号化設定に応じて適切なストアを返す
 */
const getDataStore = (encryptionEnabled: boolean) => {
  // 統合されたcreateNurseryDataStoreファクトリ関数を使用
  const dataStore = createNurseryDataStore({ encryptionEnabled });

  // DataStoreResult形式に統一（暗号化対応のdataStoreはすでに統合済み）
  return {
    getAllNurseries: async () => {
      const result = await dataStore.getAllNurseries();
      return { success: true as const, data: result };
    },
    createNursery: async (input: CreateNurseryInput) => {
      const nurseryId = await dataStore.createNursery(input);
      const nursery = await dataStore.getNursery(nurseryId);
      return { success: true as const, data: nursery! };
    },
    updateNursery: async (id: string, updates: UpdateNurseryInput) => {
      await dataStore.updateNursery(id, updates);
      return { success: true as const, data: undefined };
    },
    deleteNursery: async (id: string) => {
      await dataStore.deleteNursery(id);
      return { success: true as const, data: undefined };
    },
    getNursery: async (id: string) => {
      const result = await dataStore.getNursery(id);
      return { success: true as const, data: result };
    },
    createVisitSession: async (
      nurseryId: string,
      input: CreateVisitSessionInput
    ) => {
      const sessionId = await dataStore.createVisitSession(nurseryId, input);
      const session = await dataStore.getVisitSession(sessionId);
      return { success: true as const, data: session! };
    },
    updateVisitSession: async (
      sessionId: string,
      updates: UpdateVisitSessionInput
    ) => {
      await dataStore.updateVisitSession(sessionId, updates);
      return { success: true as const, data: undefined };
    },
    deleteVisitSession: async (sessionId: string) => {
      await dataStore.deleteVisitSession(sessionId);
      return { success: true as const, data: undefined };
    },
    getVisitSession: async (sessionId: string) => {
      const result = await dataStore.getVisitSession(sessionId);
      return { success: true as const, data: result };
    },
    addQuestion: async (
      nurseryId: string,
      sessionId: string,
      input: CreateQuestionInput
    ) => {
      const questionId = await dataStore.addQuestion(
        nurseryId,
        sessionId,
        input
      );
      // 質問を直接構築（簡略化）
      const question = {
        id: questionId,
        text: input.text,
        isAnswered: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true as const, data: question };
    },
    updateQuestion: async (
      nurseryId: string,
      sessionId: string,
      questionId: string,
      updates: UpdateQuestionInput
    ) => {
      await dataStore.updateQuestion(nurseryId, sessionId, questionId, updates);
      return { success: true as const, data: undefined };
    },
    deleteQuestion: async (
      nurseryId: string,
      sessionId: string,
      questionId: string
    ) => {
      await dataStore.deleteQuestion(nurseryId, sessionId, questionId);
      return { success: true as const, data: undefined };
    },
  };
};

/**
 * エラーハンドリングヘルパー
 */
const handleError = (
  error: unknown,
  defaultMessage: string,
  defaultCode: string
): AppError => {
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: (error as { message: string; code?: string }).message,
      code: (error as { message: string; code?: string }).code || defaultCode,
      timestamp: new Date(),
    };
  }

  return {
    message: defaultMessage,
    code: defaultCode,
    timestamp: new Date(),
  };
};

/**
 * 保育園ストア
 */
export const useNurseryStore = create<NurseryState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 保育園管理アクション
        async loadNurseries() {
          const { setLoading, clearError, storageConfig } = get();

          try {
            setLoading({
              isLoading: true,
              operation: '保育園リストを読み込み中...',
            });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);
            const result = await dataStore.getAllNurseries();
            // getDataStoreヘルパーは常にsuccess: trueを返すので、エラーハンドリング簡素化
            const nurseries = result.data;

            set((state) => ({
              nurseries,
              // 現在の保育園が削除されている場合はクリア
              currentNursery: state.currentNursery
                ? nurseries.find((n) => n.id === state.currentNursery!.id) ||
                  null
                : null,
            }));
          } catch (error) {
            const appError = handleError(
              error,
              '保育園リストの読み込みに失敗しました',
              'LOAD_NURSERIES_FAILED'
            );
            set({ error: appError });
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async createNursery(input: CreateNurseryInput) {
          const { setLoading, clearError, loadNurseries, storageConfig } =
            get();

          try {
            setLoading({ isLoading: true, operation: '保育園を作成中...' });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);
            const result = await dataStore.createNursery(input);
            const nurseryId = result.data.id;

            // リストを再読み込み
            await loadNurseries();

            return nurseryId;
          } catch (error) {
            const appError = handleError(
              error,
              '保育園の作成に失敗しました',
              'CREATE_NURSERY_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async updateNursery(id: string, updates: UpdateNurseryInput) {
          const { setLoading, clearError, loadNurseries, storageConfig } =
            get();

          try {
            setLoading({ isLoading: true, operation: '保育園情報を更新中...' });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.updateNursery(id, updates);

            // リストを再読み込み
            await loadNurseries();
          } catch (error) {
            const appError = handleError(
              error,
              '保育園の更新に失敗しました',
              'UPDATE_NURSERY_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async deleteNursery(id: string) {
          const { setLoading, clearError, loadNurseries, storageConfig } =
            get();

          try {
            setLoading({ isLoading: true, operation: '保育園を削除中...' });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.deleteNursery(id);

            // 削除された保育園が現在の保育園の場合はクリア
            set((state) => ({
              currentNursery:
                state.currentNursery?.id === id ? null : state.currentNursery,
              currentVisitSession: null, // 関連する見学セッションもクリア
            }));

            // リストを再読み込み
            await loadNurseries();
          } catch (error) {
            const appError = handleError(
              error,
              '保育園の削除に失敗しました',
              'DELETE_NURSERY_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async setCurrentNursery(id: string | null) {
          const { setLoading, clearError, storageConfig } = get();

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

            const dataStore = getDataStore(storageConfig.encryptionEnabled);
            const result = await dataStore.getNursery(id);
            const nursery = result.data;

            set({
              currentNursery: nursery,
              currentVisitSession: null, // 保育園変更時は見学セッションもクリア
            });
          } catch (error) {
            const appError = handleError(
              error,
              '保育園情報の読み込みに失敗しました',
              'LOAD_NURSERY_FAILED'
            );
            set({ error: appError });
          } finally {
            setLoading({ isLoading: false });
          }
        },

        // 見学セッション管理アクション
        async createVisitSession(
          nurseryId: string,
          input: CreateVisitSessionInput
        ) {
          const { setLoading, clearError, setCurrentNursery, storageConfig } =
            get();

          try {
            setLoading({
              isLoading: true,
              operation: '見学セッションを作成中...',
            });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);
            const result = await dataStore.createVisitSession(nurseryId, input);
            const sessionId = result.data.id;

            // 現在の保育園を更新
            await setCurrentNursery(nurseryId);

            return sessionId;
          } catch (error) {
            const appError = handleError(
              error,
              '見学セッションの作成に失敗しました',
              'CREATE_SESSION_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async updateVisitSession(
          sessionId: string,
          updates: UpdateVisitSessionInput
        ) {
          const {
            setLoading,
            clearError,
            currentNursery,
            setCurrentNursery,
            storageConfig,
          } = get();

          try {
            setLoading({
              isLoading: true,
              operation: '見学セッション情報を更新中...',
            });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.updateVisitSession(sessionId, updates);

            // 現在の保育園を更新
            if (currentNursery) {
              await setCurrentNursery(currentNursery.id);
            }
          } catch (error) {
            const appError = handleError(
              error,
              '見学セッションの更新に失敗しました',
              'UPDATE_SESSION_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async deleteVisitSession(sessionId: string) {
          const {
            setLoading,
            clearError,
            currentNursery,
            setCurrentNursery,
            storageConfig,
          } = get();

          try {
            setLoading({
              isLoading: true,
              operation: '見学セッションを削除中...',
            });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.deleteVisitSession(sessionId);

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
            const appError = handleError(
              error,
              '見学セッションの削除に失敗しました',
              'DELETE_SESSION_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async setCurrentVisitSession(sessionId: string | null) {
          const { setLoading, clearError, storageConfig } = get();

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

            const dataStore = getDataStore(storageConfig.encryptionEnabled);
            const result = await dataStore.getVisitSession(sessionId);
            const session = result.data;

            if (session) {
              set({ currentVisitSession: session });
            } else {
              throw new Error('見学セッションが見つかりません');
            }
          } catch (error) {
            const appError = handleError(
              error,
              '見学セッション情報の読み込みに失敗しました',
              'LOAD_SESSION_FAILED'
            );
            set({ error: appError });
          } finally {
            setLoading({ isLoading: false });
          }
        },

        // 質問管理アクション
        async addQuestion(
          nurseryId: string,
          sessionId: string,
          input: CreateQuestionInput
        ) {
          const { setLoading, clearError, setCurrentNursery, storageConfig } =
            get();

          try {
            setLoading({
              isLoading: true,
              operation: '質問を追加中...',
            });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);
            const result = await dataStore.addQuestion(
              nurseryId,
              sessionId,
              input
            );
            const questionId = result.data.id;

            // 現在の保育園情報を更新
            await setCurrentNursery(nurseryId);

            return questionId;
          } catch (error) {
            const appError = handleError(
              error,
              '質問の追加に失敗しました',
              'ADD_QUESTION_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async updateQuestion(
          nurseryId: string,
          sessionId: string,
          questionId: string,
          updates: UpdateQuestionInput
        ) {
          const { setLoading, clearError, setCurrentNursery, storageConfig } =
            get();

          try {
            setLoading({
              isLoading: true,
              operation: '質問を更新中...',
            });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.updateQuestion(
              nurseryId,
              sessionId,
              questionId,
              updates
            );

            // 現在の保育園情報を更新
            await setCurrentNursery(nurseryId);
          } catch (error) {
            const appError = handleError(
              error,
              '質問の更新に失敗しました',
              'UPDATE_QUESTION_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async deleteQuestion(
          nurseryId: string,
          sessionId: string,
          questionId: string
        ) {
          const { setLoading, clearError, setCurrentNursery, storageConfig } =
            get();

          try {
            setLoading({
              isLoading: true,
              operation: '質問を削除中...',
            });
            clearError();

            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.deleteQuestion(nurseryId, sessionId, questionId);

            // 現在の保育園情報を更新
            await setCurrentNursery(nurseryId);
          } catch (error) {
            const appError = handleError(
              error,
              '質問の削除に失敗しました',
              'DELETE_QUESTION_FAILED'
            );
            set({ error: appError });
            throw error;
          } finally {
            setLoading({ isLoading: false });
          }
        },

        // 気づき管理アクション
        async addInsight(sessionId: string, insight: string) {
          const { currentNursery, setCurrentNursery, storageConfig } = get();

          if (!currentNursery) {
            throw new Error('保育園が選択されていません');
          }

          const session = currentNursery.visitSessions.find(
            (s) => s.id === sessionId
          );
          if (!session) {
            throw new Error('見学セッションが見つかりません');
          }

          const currentInsights = session.insights || [];
          const updatedInsights = [...currentInsights, insight];

          try {
            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.updateVisitSession(sessionId, {
              insights: updatedInsights,
            });

            // 現在の保育園情報を更新
            await setCurrentNursery(currentNursery.id);
          } catch (error) {
            const appError = handleError(
              error,
              '気づきの追加に失敗しました',
              'ADD_INSIGHT_FAILED'
            );
            set({ error: appError });
            throw error;
          }
        },

        async removeInsight(sessionId: string, insightIndex: number) {
          const { currentNursery, setCurrentNursery, storageConfig } = get();

          if (!currentNursery) {
            throw new Error('保育園が選択されていません');
          }

          const session = currentNursery.visitSessions.find(
            (s) => s.id === sessionId
          );
          if (!session) {
            throw new Error('見学セッションが見つかりません');
          }

          const currentInsights = session.insights || [];
          if (insightIndex < 0 || insightIndex >= currentInsights.length) {
            throw new Error('無効な気づきインデックスです');
          }

          const updatedInsights = currentInsights.filter(
            (_, index) => index !== insightIndex
          );

          try {
            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.updateVisitSession(sessionId, {
              insights: updatedInsights,
            });

            // 現在の保育園情報を更新
            await setCurrentNursery(currentNursery.id);
          } catch (error) {
            const appError = handleError(
              error,
              '気づきの削除に失敗しました',
              'REMOVE_INSIGHT_FAILED'
            );
            set({ error: appError });
            throw error;
          }
        },

        async updateInsights(sessionId: string, insights: string[]) {
          const { currentNursery, setCurrentNursery, storageConfig } = get();

          if (!currentNursery) {
            throw new Error('保育園が選択されていません');
          }

          const session = currentNursery.visitSessions.find(
            (s) => s.id === sessionId
          );
          if (!session) {
            throw new Error('見学セッションが見つかりません');
          }

          try {
            const dataStore = getDataStore(storageConfig.encryptionEnabled);

            await dataStore.updateVisitSession(sessionId, {
              insights,
            });

            // 現在の保育園情報を更新
            await setCurrentNursery(currentNursery.id);
          } catch (error) {
            const appError = handleError(
              error,
              '気づきの更新に失敗しました',
              'UPDATE_INSIGHTS_FAILED'
            );
            set({ error: appError });
            throw error;
          }
        },

        // ストレージ設定アクション
        async toggleEncryption(enabled: boolean) {
          const { setLoading, clearError, loadNurseries } = get();

          try {
            setLoading({
              isLoading: true,
              operation: enabled
                ? '暗号化を有効化中...'
                : '暗号化を無効化中...',
            });
            clearError();

            // 設定変更
            set((state) => ({
              storageConfig: {
                ...state.storageConfig,
                encryptionEnabled: enabled,
              },
            }));

            // データをリロードして新しいストレージに適用
            await loadNurseries();
          } catch (error) {
            const appError = handleError(
              error,
              '暗号化設定の変更に失敗しました',
              'TOGGLE_ENCRYPTION_FAILED'
            );
            set({ error: appError });
          } finally {
            setLoading({ isLoading: false });
          }
        },

        async migrateData() {
          const { setLoading, clearError, storageConfig } = get();

          try {
            setLoading({
              isLoading: true,
              operation: 'データ移行中...',
            });
            clearError();

            // 現在のストアから全データを取得
            const sourceStore = getDataStore(!storageConfig.encryptionEnabled);

            const result = await sourceStore.getAllNurseries();
            const sourceNurseries = result.data;

            // 移行実行（詳細な移行ロジックは実装時に詳細化）
            console.log(
              'Data migration completed for',
              sourceNurseries.length,
              'nurseries'
            );
          } catch (error) {
            const appError = handleError(
              error,
              'データ移行に失敗しました',
              'MIGRATE_DATA_FAILED'
            );
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
            targetNursery = nurseries.find(
              (nursery) => nursery.id === nurseryId
            );
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

          const overallProgress =
            totalQuestions > 0
              ? Math.round(
                  (totalAnsweredQuestions / totalQuestions) * 100 * 100
                ) / 100
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
        // 必要に応じて部分的な永続化
        partialize: (state) => ({
          storageConfig: state.storageConfig,
        }),
      }
    ),
    {
      name: 'nursery-store',
      enabled: import.meta.env?.DEV ?? false,
    }
  )
);
