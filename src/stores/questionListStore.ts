/**
 * 質問リスト状態管理ストア（Zustand）
 * 設計書に基づいた状態管理とエラーハンドリング
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  QuestionList,
  CreateQuestionListInput,
  UpdateQuestionListInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  SyncState,
} from '../types/data';
import { dataStore, DataStoreError } from '../services/dataStore';
import {
  nurseryDataStore,
  NurseryDataStoreError,
} from '../services/nurseryDataStore';
import { getQuestionListStats } from '../utils/data';

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
interface QuestionListState {
  // データ状態
  questionLists: QuestionList[];
  currentList: QuestionList | null;
  templates: QuestionList[];

  // UI状態
  loading: LoadingState;
  error: AppError | null;
  syncState: SyncState;

  // アクション: 質問リスト管理
  loadQuestionLists: () => Promise<void>;
  createQuestionList: (input: CreateQuestionListInput) => Promise<string>;
  updateQuestionList: (
    id: string,
    updates: UpdateQuestionListInput
  ) => Promise<void>;
  deleteQuestionList: (id: string) => Promise<void>;
  setCurrentList: (id: string | null) => Promise<void>;

  // アクション: 質問管理
  addQuestion: (listId: string, input: CreateQuestionInput) => Promise<string>;
  updateQuestion: (
    listId: string,
    questionId: string,
    updates: UpdateQuestionInput
  ) => Promise<void>;
  deleteQuestion: (listId: string, questionId: string) => Promise<void>;
  answerQuestion: (
    listId: string,
    questionId: string,
    answer: string
  ) => Promise<void>;

  // アクション: テンプレート管理
  loadTemplates: () => Promise<void>;
  createFromTemplate: (
    templateId: string,
    customizations: CreateQuestionListInput
  ) => Promise<string>;

  // アクション: エラー・状態管理
  clearError: () => void;
  setLoading: (loading: LoadingState) => void;
  clearAllData: () => Promise<void>;

  // アクション: ユーティリティ
  getQuestionListStats: (listId: string) => {
    total: number;
    answered: number;
    unanswered: number;
    progress: number;
  } | null;
}

// 初期状態
const initialState = {
  questionLists: [],
  currentList: null,
  templates: [],
  loading: { isLoading: false },
  error: null,
  syncState: {
    isOnline: true,
    pendingChanges: 0,
  },
};

/**
 * 質問リストストア
 */
export const useQuestionListStore = create<QuestionListState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 質問リスト管理アクション
      async loadQuestionLists() {
        const { setLoading, clearError } = get();

        try {
          setLoading({
            isLoading: true,
            operation: '質問リストを読み込み中...',
          });
          clearError();

          // 新アーキテクチャのnurseryDataStoreのCompat APIを使用
          const lists = await nurseryDataStore.getAllQuestionListsCompat();

          set((state) => ({
            questionLists: lists,
            // 現在のリストが削除されている場合はクリア
            currentList: state.currentList
              ? lists.find((l) => l.id === state.currentList!.id) || null
              : null,
          }));
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : error instanceof DataStoreError
                  ? error.message
                  : '質問リストの読み込みに失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : error instanceof DataStoreError
                  ? error.code
                  : 'LOAD_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async createQuestionList(input: CreateQuestionListInput) {
        const { setLoading, clearError, loadQuestionLists } = get();

        try {
          setLoading({ isLoading: true, operation: '質問リストを作成中...' });
          clearError();

          // 新アーキテクチャのnurseryDataStoreのCompat APIを使用
          const newListId =
            await nurseryDataStore.createQuestionListCompat(input);

          // リストを再読み込み
          await loadQuestionLists();

          return newListId;
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : error instanceof DataStoreError
                  ? error.message
                  : '質問リストの作成に失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : error instanceof DataStoreError
                  ? error.code
                  : 'CREATE_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async updateQuestionList(id: string, updates: UpdateQuestionListInput) {
        const { setLoading, clearError, loadQuestionLists } = get();

        try {
          setLoading({ isLoading: true, operation: '質問リストを更新中...' });
          clearError();

          // 新アーキテクチャのnurseryDataStoreのCompat APIを使用
          await nurseryDataStore.updateQuestionListCompat(id, updates);

          // リストを再読み込み
          await loadQuestionLists();
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof NurseryDataStoreError
                ? error.message
                : error instanceof DataStoreError
                  ? error.message
                  : '質問リストの更新に失敗しました',
            code:
              error instanceof NurseryDataStoreError
                ? error.code
                : error instanceof DataStoreError
                  ? error.code
                  : 'UPDATE_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async deleteQuestionList(id: string) {
        const { setLoading, clearError, loadQuestionLists } = get();

        try {
          setLoading({ isLoading: true, operation: '質問リストを削除中...' });
          clearError();

          await dataStore.deleteQuestionList(id);

          // 削除されたリストが現在のリストの場合はクリア
          set((state) => ({
            currentList:
              state.currentList?.id === id ? null : state.currentList,
          }));

          // リストを再読み込み
          await loadQuestionLists();
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : '質問リストの削除に失敗しました',
            code:
              error instanceof DataStoreError ? error.code : 'DELETE_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async setCurrentList(id: string | null) {
        const { setLoading, clearError } = get();

        if (!id) {
          set({ currentList: null });
          return;
        }

        try {
          setLoading({
            isLoading: true,
            operation: '質問リストを読み込み中...',
          });
          clearError();

          const list = await dataStore.getQuestionList(id);
          set({ currentList: list });
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : '質問リストの読み込みに失敗しました',
            code:
              error instanceof DataStoreError
                ? error.code
                : 'LOAD_CURRENT_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
        } finally {
          setLoading({ isLoading: false });
        }
      },

      // 質問管理アクション
      async addQuestion(listId: string, input: CreateQuestionInput) {
        const { setLoading, clearError, setCurrentList } = get();

        try {
          setLoading({ isLoading: true, operation: '質問を追加中...' });
          clearError();

          const questionId = await dataStore.addQuestion(listId, input);

          // 現在のリストを更新
          await setCurrentList(listId);

          return questionId;
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : '質問の追加に失敗しました',
            code:
              error instanceof DataStoreError
                ? error.code
                : 'ADD_QUESTION_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async updateQuestion(
        listId: string,
        questionId: string,
        updates: UpdateQuestionInput
      ) {
        const { setLoading, clearError, setCurrentList } = get();

        try {
          setLoading({ isLoading: true, operation: '質問を更新中...' });
          clearError();

          await dataStore.updateQuestion(listId, questionId, updates);

          // 現在のリストを更新
          await setCurrentList(listId);
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : '質問の更新に失敗しました',
            code:
              error instanceof DataStoreError
                ? error.code
                : 'UPDATE_QUESTION_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async deleteQuestion(listId: string, questionId: string) {
        const { setLoading, clearError, setCurrentList } = get();

        try {
          setLoading({ isLoading: true, operation: '質問を削除中...' });
          clearError();

          await dataStore.deleteQuestion(listId, questionId);

          // 現在のリストを更新
          await setCurrentList(listId);
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : '質問の削除に失敗しました',
            code:
              error instanceof DataStoreError
                ? error.code
                : 'DELETE_QUESTION_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async answerQuestion(listId: string, questionId: string, answer: string) {
        const { updateQuestion } = get();

        await updateQuestion(listId, questionId, {
          answer,
        });
      },

      // テンプレート管理アクション
      async loadTemplates() {
        const { setLoading, clearError } = get();

        try {
          setLoading({
            isLoading: true,
            operation: 'テンプレートを読み込み中...',
          });
          clearError();

          const templates = await dataStore.getTemplates();
          set({ templates });
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : 'テンプレートの読み込みに失敗しました',
            code:
              error instanceof DataStoreError
                ? error.code
                : 'LOAD_TEMPLATES_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
        } finally {
          setLoading({ isLoading: false });
        }
      },

      async createFromTemplate(
        templateId: string,
        customizations: CreateQuestionListInput
      ) {
        const { setLoading, clearError, loadQuestionLists } = get();

        try {
          setLoading({
            isLoading: true,
            operation: 'テンプレートから作成中...',
          });
          clearError();

          const newListId = await dataStore.createFromTemplate(
            templateId,
            customizations
          );

          // リストを再読み込み
          await loadQuestionLists();

          return newListId;
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : 'テンプレートからの作成に失敗しました',
            code:
              error instanceof DataStoreError
                ? error.code
                : 'CREATE_FROM_TEMPLATE_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
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

      async clearAllData() {
        const { setLoading, clearError } = get();

        try {
          setLoading({ isLoading: true, operation: '全データを削除中...' });
          clearError();

          await dataStore.clearAllData();

          // 状態をリセット
          set(initialState);
        } catch (error) {
          const appError: AppError = {
            message:
              error instanceof DataStoreError
                ? error.message
                : 'データの削除に失敗しました',
            code:
              error instanceof DataStoreError
                ? error.code
                : 'CLEAR_DATA_FAILED',
            timestamp: new Date(),
          };
          set({ error: appError });
          throw error;
        } finally {
          setLoading({ isLoading: false });
        }
      },

      // ユーティリティアクション
      getQuestionListStats(listId: string) {
        const { questionLists, currentList } = get();

        let targetList: QuestionList | undefined;

        if (currentList && currentList.id === listId) {
          targetList = currentList;
        } else {
          targetList = questionLists.find((list) => list.id === listId);
        }

        return targetList ? getQuestionListStats(targetList) : null;
      },
    }),
    {
      name: 'question-list-store',
      // デバッグモードでのみdevtoolsを有効化
      enabled: import.meta.env?.DEV ?? false,
    }
  )
);
