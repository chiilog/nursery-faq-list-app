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
} from '../types/data';

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
  visitDate: string; // ISO date string
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
  priority: 'high' | 'medium' | 'low';
  category?: string;
  orderIndex: number;
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

// ユーティリティ関数
function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

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
      const nurseryId = generateId('nursery');
      const now = getCurrentTimestamp();

      // 見学日が指定されている場合は初期見学セッションを作成
      const visitSessions: VisitSession[] = [];
      if (input.visitDate) {
        const sessionId = generateId('session');
        visitSessions.push({
          id: sessionId,
          visitDate: input.visitDate,
          status: 'planned',
          questions: [],
          createdAt: now,
          updatedAt: now,
        });
      }

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
              visitDate: new Date(session.visitDate),
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

  getAllNurseries(): Promise<Nursery[]> {
    return new Promise((resolve, reject) => {
      try {
        const nurseriesData = localStorage.getItem(NURSERIES_STORAGE_KEY);
        if (!nurseriesData) {
          resolve([]);
          return;
        }

        const serializedNurseries = JSON.parse(nurseriesData) as Record<
          string,
          SerializedNursery
        >;

        const nurseries = Object.values(serializedNurseries).map(
          (nurseryData: SerializedNursery): Nursery => ({
            ...nurseryData,
            createdAt: new Date(nurseryData.createdAt),
            updatedAt: new Date(nurseryData.updatedAt),
            visitSessions: nurseryData.visitSessions.map(
              (session: SerializedVisitSession): VisitSession => ({
                ...session,
                visitDate: new Date(session.visitDate),
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
          })
        );

        resolve(nurseries);
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

      const sessionId = generateId('session');
      const now = getCurrentTimestamp();

      const visitSession: VisitSession = {
        id: sessionId,
        visitDate: input.visitDate,
        status: input.status || 'planned',
        questions:
          input.questions?.map((q, index) => ({
            id: generateId('question'),
            text: q.text,
            answer: '',
            isAnswered: false,
            priority: q.priority || 'medium',
            category: q.category,
            orderIndex: index,
            createdAt: now,
            updatedAt: now,
          })) || [],
        notes: input.notes,
        sharedWith: [],
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

      const questionId = `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      const newQuestion: Question = {
        id: questionId,
        text: input.text,
        answer: input.answer || '',
        isAnswered: input.isAnswered || false,
        priority: input.priority || 'medium',
        category: input.category || '基本情報',
        orderIndex: input.orderIndex,
        createdAt: now,
        updatedAt: now,
      };

      session.questions.push(newQuestion);
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
      if (updates.priority !== undefined) question.priority = updates.priority;
      if (updates.category !== undefined) question.category = updates.category;
      if (updates.orderIndex !== undefined)
        question.orderIndex = updates.orderIndex;
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
}

// シングルトンインスタンス
export const nurseryDataStore = new NurseryDataStore();
