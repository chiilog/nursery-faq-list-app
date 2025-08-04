/**
 * 保育園データストア（ローカルストレージ）
 * 保育園中心設計に基づいたデータ永続化
 */

import type {
  Nursery,
  CreateNurseryInput,
  UpdateNurseryInput,
  VisitSession,
  CreateVisitSessionInput,
  UpdateVisitSessionInput,
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionList,
  CreateQuestionListInput,
  UpdateQuestionListInput,
} from '../types/data';
import { generatePrefixedId } from '../utils/id';
import { addQuestionToQuestionsArray } from '../utils/data';
import {
  migrateAllQuestionLists,
  convertNurseryToQuestionList,
  convertCreateQuestionListInput,
} from '../utils/dataConversion';
import { dataStore } from './dataStore';

// シリアライズされたデータの型定義（JSON形式）
interface SerializedNursery {
  id: string;
  name: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  visitSessions: SerializedVisitSession[];
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface SerializedVisitSession {
  id: string;
  visitDate: string | null; // ISO date string or null for 未定
  status: 'planned' | 'completed' | 'cancelled';
  questions: SerializedQuestion[];
  notes?: string;
  sharedWith?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface SerializedQuestion {
  id: string;
  text: string;
  answer?: string;
  isAnswered: boolean;
  answeredBy?: string;
  answeredAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// データストアエラークラス
export class NurseryDataStoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NurseryDataStoreError';
  }
}

// ローカルストレージキー
const NURSERIES_STORAGE_KEY = 'nursery-app-nurseries';
const MIGRATION_FLAG_KEY = 'nursery-migration-completed';

// ユーティリティ関数

function getCurrentTimestamp(): Date {
  return new Date();
}

/**
 * 保育園データストア
 */
class NurseryDataStore {
  // 保育園管理
  async createNursery(input: CreateNurseryInput): Promise<string> {
    try {
      const nurseryId = generatePrefixedId('nursery');
      const now = getCurrentTimestamp();

      // デフォルトの見学セッションを作成（見学日は未指定でも可）
      const sessionId = generatePrefixedId('session');
      const visitSessions: VisitSession[] = [
        {
          id: sessionId,
          visitDate: input.visitDate || null, // 見学日未指定の場合はnullで「未定」を表現
          status: 'planned',
          questions: [],
          createdAt: now,
          updatedAt: now,
        },
      ];

      const nursery: Nursery = {
        id: nurseryId,
        name: input.name,
        visitSessions,
        createdAt: now,
        updatedAt: now,
      };

      const nurseries = await this.getAllNurseries();
      const nurseriesMap = nurseries.reduce(
        (acc, n) => {
          acc[n.id] = n;
          return acc;
        },
        {} as Record<string, Nursery>
      );

      nurseriesMap[nurseryId] = nursery;

      localStorage.setItem(NURSERIES_STORAGE_KEY, JSON.stringify(nurseriesMap));

      return nurseryId;
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの保存に失敗しました',
          'SAVE_FAILED',
          error
        );
      }
      throw error;
    }
  }

  getNursery(id: string): Promise<Nursery | null> {
    return new Promise((resolve, reject) => {
      try {
        const nurseriesData = localStorage.getItem(NURSERIES_STORAGE_KEY);
        if (!nurseriesData) {
          resolve(null);
          return;
        }

        const nurseries = JSON.parse(nurseriesData) as Record<
          string,
          SerializedNursery
        >;
        const nurseryData = nurseries[id];

        if (!nurseryData) {
          resolve(null);
          return;
        }

        const nursery: Nursery = {
          ...nurseryData,
          createdAt: new Date(nurseryData.createdAt),
          updatedAt: new Date(nurseryData.updatedAt),
          visitSessions: nurseryData.visitSessions.map(
            (session: SerializedVisitSession): VisitSession => ({
              ...session,
              visitDate: session.visitDate ? new Date(session.visitDate) : null,
              createdAt: new Date(session.createdAt),
              updatedAt: new Date(session.updatedAt),
              questions: session.questions.map(
                (question: SerializedQuestion) => ({
                  ...question,
                  answeredAt: question.answeredAt
                    ? new Date(question.answeredAt)
                    : undefined,
                  createdAt: new Date(question.createdAt),
                  updatedAt: new Date(question.updatedAt),
                })
              ),
            })
          ),
        };

        resolve(nursery);
      } catch (error) {
        if (error instanceof Error) {
          reject(
            new NurseryDataStoreError(
              'データの読み込みに失敗しました',
              'LOAD_FAILED',
              error
            )
          );
        } else {
          reject(new Error('Unknown error occurred'));
        }
      }
    });
  }

  async getAllNurseries(options?: {
    forceMigration?: boolean;
  }): Promise<Nursery[]> {
    try {
      // QuestionListデータからの自動移行を試行
      await this.migrateFromQuestionListsIfNeeded(options?.forceMigration);

      const nurseriesData = localStorage.getItem(NURSERIES_STORAGE_KEY);
      if (!nurseriesData) {
        return [];
      }

      const serializedNurseries = JSON.parse(nurseriesData) as Record<
        string,
        SerializedNursery
      >;

      const nurseries = Object.values(serializedNurseries).map(
        (nurseryData: SerializedNursery): Nursery => {
          // visitSessionsが空の場合はデフォルトセッションを作成（既存データのマイグレーション）
          let visitSessions = nurseryData.visitSessions;
          if (!visitSessions || visitSessions.length === 0) {
            const now = new Date();
            visitSessions = [
              {
                id: generatePrefixedId('session'),
                visitDate: null, // 見学日未定
                status: 'planned',
                questions: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              },
            ];
          }

          return {
            ...nurseryData,
            createdAt: new Date(nurseryData.createdAt),
            updatedAt: new Date(nurseryData.updatedAt),
            visitSessions: visitSessions.map(
              (session: SerializedVisitSession): VisitSession => ({
                ...session,
                visitDate: session.visitDate
                  ? new Date(session.visitDate)
                  : null,
                createdAt: new Date(session.createdAt),
                updatedAt: new Date(session.updatedAt),
                questions: session.questions.map(
                  (question: SerializedQuestion) => ({
                    ...question,
                    answeredAt: question.answeredAt
                      ? new Date(question.answeredAt)
                      : undefined,
                    createdAt: new Date(question.createdAt),
                    updatedAt: new Date(question.updatedAt),
                  })
                ),
              })
            ),
          };
        }
      );

      return nurseries;
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの読み込みに失敗しました',
          'LOAD_FAILED',
          error
        );
      } else {
        throw new Error('Unknown error occurred');
      }
    }
  }

  async updateNursery(id: string, updates: UpdateNurseryInput): Promise<void> {
    try {
      const nursery = await this.getNursery(id);
      if (!nursery) {
        throw new NurseryDataStoreError(
          '保育園が見つかりません',
          'NURSERY_NOT_FOUND'
        );
      }

      const updatedNursery: Nursery = {
        ...nursery,
        ...updates,
        updatedAt: getCurrentTimestamp(),
      };

      const nurseries = await this.getAllNurseries();
      const nurseriesMap = nurseries.reduce(
        (acc, n) => {
          acc[n.id] = n.id === id ? updatedNursery : n;
          return acc;
        },
        {} as Record<string, Nursery>
      );

      localStorage.setItem(NURSERIES_STORAGE_KEY, JSON.stringify(nurseriesMap));
    } catch (error) {
      if (error instanceof NurseryDataStoreError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの更新に失敗しました',
          'UPDATE_FAILED',
          error
        );
      }
      throw error;
    }
  }

  async deleteNursery(id: string): Promise<void> {
    try {
      const nurseries = await this.getAllNurseries();
      const nurseriesMap = nurseries.reduce(
        (acc, n) => {
          if (n.id !== id) {
            acc[n.id] = n;
          }
          return acc;
        },
        {} as Record<string, Nursery>
      );

      localStorage.setItem(NURSERIES_STORAGE_KEY, JSON.stringify(nurseriesMap));
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの削除に失敗しました',
          'DELETE_FAILED',
          error
        );
      }
      throw error;
    }
  }

  // 見学セッション管理
  async createVisitSession(
    nurseryId: string,
    input: CreateVisitSessionInput
  ): Promise<string> {
    try {
      const nursery = await this.getNursery(nurseryId);
      if (!nursery) {
        throw new NurseryDataStoreError(
          '保育園が見つかりません',
          'NURSERY_NOT_FOUND'
        );
      }

      const sessionId = generatePrefixedId('session');
      const now = getCurrentTimestamp();

      const visitSession: VisitSession = {
        id: sessionId,
        visitDate: input.visitDate,
        status: input.status || 'planned',
        questions:
          input.questions?.map((q) => ({
            id: generatePrefixedId('question'),
            text: q.text,
            answer: '',
            isAnswered: false,
            createdAt: now,
            updatedAt: now,
          })) || [],
        notes: input.notes,
        sharedWith: input.sharedWith || [],
        createdAt: now,
        updatedAt: now,
      };

      const updatedNursery: Nursery = {
        ...nursery,
        visitSessions: [...nursery.visitSessions, visitSession],
        updatedAt: now,
      };

      const nurseries = await this.getAllNurseries();
      const nurseriesMap = nurseries.reduce(
        (acc, n) => {
          acc[n.id] = n.id === nurseryId ? updatedNursery : n;
          return acc;
        },
        {} as Record<string, Nursery>
      );

      localStorage.setItem(NURSERIES_STORAGE_KEY, JSON.stringify(nurseriesMap));

      return sessionId;
    } catch (error) {
      if (error instanceof NurseryDataStoreError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          '見学セッションの作成に失敗しました',
          'CREATE_SESSION_FAILED',
          error
        );
      }
      throw error;
    }
  }

  async getVisitSession(sessionId: string): Promise<VisitSession | null> {
    try {
      const nurseries = await this.getAllNurseries();

      for (const nursery of nurseries) {
        const session = nursery.visitSessions.find((s) => s.id === sessionId);
        if (session) {
          return session;
        }
      }

      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          '見学セッションの読み込みに失敗しました',
          'LOAD_SESSION_FAILED',
          error
        );
      }
      throw error;
    }
  }

  async updateVisitSession(
    sessionId: string,
    updates: UpdateVisitSessionInput
  ): Promise<void> {
    try {
      const nurseries = await this.getAllNurseries();

      let targetNursery: Nursery | null = null;
      let sessionIndex = -1;

      for (const nursery of nurseries) {
        const index = nursery.visitSessions.findIndex(
          (s) => s.id === sessionId
        );
        if (index !== -1) {
          targetNursery = nursery;
          sessionIndex = index;
          break;
        }
      }

      if (!targetNursery || sessionIndex === -1) {
        throw new NurseryDataStoreError(
          '見学セッションが見つかりません',
          'SESSION_NOT_FOUND'
        );
      }

      const updatedSession: VisitSession = {
        ...targetNursery.visitSessions[sessionIndex],
        ...updates,
        updatedAt: getCurrentTimestamp(),
      };

      const updatedVisitSessions = [...targetNursery.visitSessions];
      updatedVisitSessions[sessionIndex] = updatedSession;

      await this.updateNursery(targetNursery.id, {
        visitSessions: updatedVisitSessions,
      });
    } catch (error) {
      if (error instanceof NurseryDataStoreError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          '見学セッションの更新に失敗しました',
          'UPDATE_SESSION_FAILED',
          error
        );
      }
      throw error;
    }
  }

  async deleteVisitSession(sessionId: string): Promise<void> {
    try {
      const nurseries = await this.getAllNurseries();

      let targetNursery: Nursery | null = null;

      for (const nursery of nurseries) {
        const sessionExists = nursery.visitSessions.some(
          (s) => s.id === sessionId
        );
        if (sessionExists) {
          targetNursery = nursery;
          break;
        }
      }

      if (!targetNursery) {
        throw new NurseryDataStoreError(
          '見学セッションが見つかりません',
          'SESSION_NOT_FOUND'
        );
      }

      const updatedVisitSessions = targetNursery.visitSessions.filter(
        (s) => s.id !== sessionId
      );

      await this.updateNursery(targetNursery.id, {
        visitSessions: updatedVisitSessions,
      });
    } catch (error) {
      if (error instanceof NurseryDataStoreError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          '見学セッションの削除に失敗しました',
          'DELETE_SESSION_FAILED',
          error
        );
      }
      throw error;
    }
  }

  // 保育園データを保存するヘルパーメソッド
  private saveNurseries(nurseries: Nursery[]): void {
    try {
      const nurseriesMap = nurseries.reduce(
        (acc, n) => {
          acc[n.id] = n;
          return acc;
        },
        {} as Record<string, Nursery>
      );

      localStorage.setItem(NURSERIES_STORAGE_KEY, JSON.stringify(nurseriesMap));
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの保存に失敗しました',
          'SAVE_FAILED',
          error
        );
      }
      throw error;
    }
  }

  // 質問管理
  async addQuestion(
    nurseryId: string,
    sessionId: string,
    input: CreateQuestionInput
  ): Promise<string> {
    try {
      const nurseries = await this.getAllNurseries();
      const nursery = nurseries.find((n) => n.id === nurseryId);

      if (!nursery) {
        throw new NurseryDataStoreError(
          '指定された保育園が見つかりません',
          'NURSERY_NOT_FOUND'
        );
      }

      const session = nursery.visitSessions.find((s) => s.id === sessionId);
      if (!session) {
        throw new NurseryDataStoreError(
          '指定された見学セッションが見つかりません',
          'SESSION_NOT_FOUND'
        );
      }

      const questionId = generatePrefixedId('question');
      const now = new Date();

      // 新しい質問を作成
      const newQuestion: Question = {
        id: questionId,
        text: input.text,
        answer: input.answer || '',
        isAnswered: input.isAnswered || false,
        createdAt: now,
        updatedAt: now,
      };

      // 共通関数を使用して質問配列を更新
      session.questions = addQuestionToQuestionsArray(
        session.questions,
        newQuestion
      );

      this.saveNurseries(nurseries);

      return questionId;
    } catch (error) {
      if (error instanceof NurseryDataStoreError) {
        throw error;
      }
      throw new NurseryDataStoreError(
        '質問の追加に失敗しました',
        'ADD_QUESTION_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  async updateQuestion(
    nurseryId: string,
    sessionId: string,
    questionId: string,
    updates: UpdateQuestionInput
  ): Promise<void> {
    try {
      const nurseries = await this.getAllNurseries();
      const nursery = nurseries.find((n) => n.id === nurseryId);

      if (!nursery) {
        throw new NurseryDataStoreError(
          '指定された保育園が見つかりません',
          'NURSERY_NOT_FOUND'
        );
      }

      const session = nursery.visitSessions.find((s) => s.id === sessionId);
      if (!session) {
        throw new NurseryDataStoreError(
          '指定された見学セッションが見つかりません',
          'SESSION_NOT_FOUND'
        );
      }

      const question = session.questions.find((q) => q.id === questionId);
      if (!question) {
        throw new NurseryDataStoreError(
          '指定された質問が見つかりません',
          'QUESTION_NOT_FOUND'
        );
      }

      // 質問を更新
      if (updates.text !== undefined) question.text = updates.text;
      if (updates.answer !== undefined) question.answer = updates.answer;
      if (updates.isAnswered !== undefined)
        question.isAnswered = updates.isAnswered;
      question.updatedAt = new Date();

      this.saveNurseries(nurseries);
    } catch (error) {
      if (error instanceof NurseryDataStoreError) {
        throw error;
      }
      throw new NurseryDataStoreError(
        '質問の更新に失敗しました',
        'UPDATE_QUESTION_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  async deleteQuestion(
    nurseryId: string,
    sessionId: string,
    questionId: string
  ): Promise<void> {
    try {
      const nurseries = await this.getAllNurseries();
      const nursery = nurseries.find((n) => n.id === nurseryId);

      if (!nursery) {
        throw new NurseryDataStoreError(
          '指定された保育園が見つかりません',
          'NURSERY_NOT_FOUND'
        );
      }

      const session = nursery.visitSessions.find((s) => s.id === sessionId);
      if (!session) {
        throw new NurseryDataStoreError(
          '指定された見学セッションが見つかりません',
          'SESSION_NOT_FOUND'
        );
      }

      const questionIndex = session.questions.findIndex(
        (q) => q.id === questionId
      );
      if (questionIndex === -1) {
        throw new NurseryDataStoreError(
          '指定された質問が見つかりません',
          'QUESTION_NOT_FOUND'
        );
      }

      session.questions.splice(questionIndex, 1);
      this.saveNurseries(nurseries);
    } catch (error) {
      if (error instanceof NurseryDataStoreError) {
        throw error;
      }
      throw new NurseryDataStoreError(
        '質問の削除に失敗しました',
        'DELETE_QUESTION_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  // データクリア
  clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(NURSERIES_STORAGE_KEY);
        resolve();
      } catch (error) {
        if (error instanceof Error) {
          reject(
            new NurseryDataStoreError(
              'データの削除に失敗しました',
              'CLEAR_DATA_FAILED',
              error
            )
          );
        } else {
          reject(new Error('Unknown error occurred'));
        }
      }
    });
  }

  // === QuestionList データの自動移行機能 ===

  /**
   * QuestionListデータからの自動移行を必要に応じて実行
   */
  private async migrateFromQuestionListsIfNeeded(
    forceMigration = false
  ): Promise<void> {
    // 強制移行でない場合、移行済みフラグをチェック
    if (!forceMigration) {
      const migrationCompleted = localStorage.getItem(MIGRATION_FLAG_KEY);
      if (migrationCompleted === 'true') {
        return; // 既に移行済み
      }
    }

    try {
      // 既存のQuestionListデータを取得
      const questionLists = await dataStore.getAllQuestionLists();

      if (!questionLists || questionLists.length === 0) {
        // 移行するデータがない場合もフラグを設定
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        return;
      }

      // QuestionListデータをNursery/VisitSession構造に変換
      const migrationResult = migrateAllQuestionLists(questionLists);

      // 変換されたデータをNursery形式で保存
      const serializedNurseries: Record<string, SerializedNursery> = {};

      for (const [nurseryId, nursery] of migrationResult.nurseries) {
        serializedNurseries[nurseryId] = {
          ...nursery,
          createdAt: nursery.createdAt.toISOString(),
          updatedAt: nursery.updatedAt.toISOString(),
          visitSessions: nursery.visitSessions.map((session: VisitSession) => ({
            ...session,
            visitDate: session.visitDate?.toISOString() || null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
            questions: session.questions.map((question) => ({
              ...question,
              answeredAt: question.answeredAt?.toISOString(),
              createdAt: question.createdAt.toISOString(),
              updatedAt: question.updatedAt.toISOString(),
            })),
          })),
        };
      }

      // localStorage に保存
      localStorage.setItem(
        NURSERIES_STORAGE_KEY,
        JSON.stringify(serializedNurseries)
      );

      // 移行完了フラグを設定
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    } catch (error) {
      console.error('QuestionList migration failed:', error);
      // 移行に失敗しても処理を続行（既存のNurseryデータがあるかもしれない）
    }
  }

  // === 後方互換性API（QuestionList形式でのアクセス） ===

  /**
   * QuestionList形式でデータを取得（後方互換性）
   */
  async getAllQuestionListsCompat(): Promise<QuestionList[]> {
    const nurseries = await this.getAllNurseries();
    const questionLists: QuestionList[] = [];

    for (const nursery of nurseries) {
      for (const visitSession of nursery.visitSessions) {
        const questionList = convertNurseryToQuestionList(
          nursery,
          visitSession
        );
        questionLists.push(questionList);
      }
    }

    return questionLists;
  }

  /**
   * QuestionList形式でデータを作成（後方互換性）
   */
  async createQuestionListCompat(
    input: CreateQuestionListInput
  ): Promise<string> {
    const { nurseryInput, visitSessionInput } =
      convertCreateQuestionListInput(input);

    // 同じ名前の保育園が既に存在するかチェック
    const existingNurseries = await this.getAllNurseries();
    const existingNursery = existingNurseries.find(
      (n) => n.name === nurseryInput.name
    );

    if (existingNursery) {
      // 既存の保育園に新しいVisitSessionを追加
      const sessionId = await this.createVisitSession(
        existingNursery.id,
        visitSessionInput
      );
      return sessionId;
    } else {
      // 新しい保育園を作成
      const nurseryId = await this.createNursery(nurseryInput);

      // createNurseryで作成されたデフォルトの空セッションを削除
      const nursery = await this.getNursery(nurseryId);
      if (
        nursery &&
        nursery.visitSessions.length === 1 &&
        nursery.visitSessions[0].questions.length === 0
      ) {
        await this.deleteVisitSession(nursery.visitSessions[0].id);
      }

      // 新しいセッションを作成
      const sessionId = await this.createVisitSession(
        nurseryId,
        visitSessionInput
      );
      return sessionId;
    }
  }

  /**
   * QuestionList形式でデータを更新（後方互換性）
   */
  async updateQuestionListCompat(
    sessionId: string,
    updates: UpdateQuestionListInput
  ): Promise<void> {
    // VisitSessionを検索
    const nurseries = await this.getAllNurseries();
    let targetNursery: Nursery | null = null;
    let targetSession: VisitSession | null = null;

    for (const nursery of nurseries) {
      const session = nursery.visitSessions.find((s) => s.id === sessionId);
      if (session) {
        targetNursery = nursery;
        targetSession = session;
        break;
      }
    }

    if (!targetNursery || !targetSession) {
      throw new NurseryDataStoreError(
        'セッションが見つかりません',
        'SESSION_NOT_FOUND'
      );
    }

    // 保育園名の更新
    if (updates.nurseryName && updates.nurseryName !== targetNursery.name) {
      await this.updateNursery(targetNursery.id, {
        name: updates.nurseryName,
      });
    }

    // VisitSessionの更新
    const sessionUpdates: UpdateVisitSessionInput = {};
    if (updates.visitDate !== undefined) {
      sessionUpdates.visitDate = updates.visitDate;
    }

    if (Object.keys(sessionUpdates).length > 0) {
      await this.updateVisitSession(sessionId, sessionUpdates);
    }
  }
}

// シングルトンインスタンス
export const nurseryDataStore = new NurseryDataStore();
