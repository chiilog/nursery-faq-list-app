/**
 * 保育園データストア（暗号化対応）
 * 保育園中心設計に基づいたデータ永続化と暗号化
 * DRY・KISS原則により、暗号化/非暗号化を統合管理
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
import { generatePrefixedId } from '../utils/id';
import { addQuestionToQuestionsArray } from '../utils/data';
import {
  getOrCreateEncryptionKey,
  encryptData,
  decryptData,
  type EncryptedData,
} from './cryptoService';

// シリアライズされたデータの型定義（JSON形式）
interface SerializedNursery
  extends Omit<Nursery, 'visitSessions' | 'createdAt' | 'updatedAt'> {
  visitSessions: SerializedVisitSession[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface SerializedVisitSession
  extends Omit<
    VisitSession,
    'visitDate' | 'questions' | 'createdAt' | 'updatedAt'
  > {
  visitDate: string | null; // ISO date string or null for 未定
  questions: SerializedQuestion[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// insightsがオプショナルなバージョン
interface VisitSessionData extends Omit<SerializedVisitSession, 'insights'> {
  insights?: string[];
}

interface SerializedQuestion
  extends Omit<Question, 'answeredAt' | 'createdAt' | 'updatedAt'> {
  answeredAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

import { DataStoreError } from '../types/errors';
import { defaultStorageService, type StorageService } from './storageService';

// データストアエラークラス（統合）
export class NurseryDataStoreError extends DataStoreError {
  constructor(message: string, code: string, originalError?: Error) {
    super(message, code, originalError);
    this.name = 'NurseryDataStoreError';
  }
}

// ストレージ設定の型定義
export interface NurseryDataStoreOptions {
  encryptionEnabled?: boolean;
  storageService?: StorageService; // 依存性注入によりテスト可能性を向上
}

// ストレージキー
const NURSERIES_STORAGE_KEY = 'nursery-app-nurseries';
const ENCRYPTED_NURSERIES_STORAGE_KEY = 'encrypted_nurseries_data';

/**
 * 暗号化データの型ガード
 */
function isEncryptedDataMap(
  value: unknown
): value is Record<string, EncryptedData> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (item): item is EncryptedData =>
        item !== null &&
        typeof item === 'object' &&
        'data' in item &&
        'iv' in item &&
        typeof (item as Record<string, unknown>).data === 'string' &&
        typeof (item as Record<string, unknown>).iv === 'string'
    )
  );
}

// ユーティリティ関数

function getCurrentTimestamp(): Date {
  return new Date();
}

/**
 * 保育園データストア（暗号化対応）
 *
 * 依存性注入パターンによりストレージ操作を抽象化し、
 * テスタビリティと保守性を向上させた実装
 */
class NurseryDataStore {
  private encryptionEnabled: boolean;
  private storage: StorageService;

  constructor(options: NurseryDataStoreOptions = {}) {
    this.encryptionEnabled = options.encryptionEnabled ?? false;
    this.storage = options.storageService ?? defaultStorageService;
  }

  /**
   * 暗号化データを保存
   */
  private async saveEncryptedData(
    data: Record<string, Nursery>
  ): Promise<void> {
    try {
      const key = await getOrCreateEncryptionKey();
      const encryptedData: Record<string, EncryptedData> = {};

      for (const [nurseryId, nursery] of Object.entries(data)) {
        // シリアライズされた形式で保存して読み込み時との整合性を保つ
        const serializedNursery = this.serializeNursery(nursery);
        const serializedJson = JSON.stringify(serializedNursery);
        encryptedData[nurseryId] = await encryptData(serializedJson, key);
      }

      this.storage.setItem(
        ENCRYPTED_NURSERIES_STORAGE_KEY,
        JSON.stringify(encryptedData)
      );
    } catch (error) {
      throw new NurseryDataStoreError(
        '暗号化データの保存に失敗しました',
        'ENCRYPTED_SAVE_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 暗号化データを読み込み
   */
  private async loadEncryptedData(): Promise<
    Record<string, SerializedNursery>
  > {
    try {
      const encryptedData = this.storage.getItem(
        ENCRYPTED_NURSERIES_STORAGE_KEY
      );
      if (!encryptedData) {
        return {};
      }

      const parsedData: unknown = JSON.parse(encryptedData);
      if (!isEncryptedDataMap(parsedData)) {
        throw new Error('無効な暗号化データ形式');
      }

      const key = await getOrCreateEncryptionKey();
      const decryptedData: Record<string, SerializedNursery> = {};

      for (const [nurseryId, encrypted] of Object.entries(parsedData)) {
        const decryptedJson = await decryptData(encrypted, key);
        try {
          const parsedNursery: unknown = JSON.parse(decryptedJson);
          // 基本的な型チェック
          if (
            !parsedNursery ||
            typeof parsedNursery !== 'object' ||
            !('id' in parsedNursery) ||
            typeof (parsedNursery as Record<string, unknown>).id !== 'string'
          ) {
            throw new Error(
              `Invalid nursery data structure for ID: ${nurseryId}`
            );
          }
          decryptedData[nurseryId] = parsedNursery as SerializedNursery;
        } catch (parseError) {
          throw new Error(
            `Failed to parse decrypted data for nursery ${nurseryId}: ${
              parseError instanceof Error
                ? parseError.message
                : String(parseError)
            }`
          );
        }
      }

      return decryptedData;
    } catch (error) {
      throw new NurseryDataStoreError(
        '暗号化データの読み込みに失敗しました',
        'ENCRYPTED_LOAD_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * データを保存（暗号化設定に応じて自動選択）
   */
  private async saveData(data: Record<string, Nursery>): Promise<void> {
    if (this.encryptionEnabled) {
      await this.saveEncryptedData(data);
    } else {
      this.storage.setItem(NURSERIES_STORAGE_KEY, JSON.stringify(data));
    }
  }

  /**
   * NurseryオブジェクトをSerializedNursery形式に変換する
   *
   * @private
   * @param nursery 変換元のNurseryオブジェクト
   * @returns シリアライズされたNurseryオブジェクト
   */
  private serializeNursery(nursery: Nursery): SerializedNursery {
    return {
      ...nursery,
      createdAt: nursery.createdAt.toISOString(),
      updatedAt: nursery.updatedAt.toISOString(),
      visitSessions: nursery.visitSessions.map((session) => ({
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

  /**
   * データを読み込み（暗号化設定に応じて自動選択）
   */
  private async loadData(): Promise<Record<string, SerializedNursery>> {
    if (this.encryptionEnabled) {
      // 暗号化データは既にシリアライズ済みで保存されているので直接返す
      return await this.loadEncryptedData();
    } else {
      const nurseriesData = this.storage.getItem(NURSERIES_STORAGE_KEY);
      if (!nurseriesData) {
        return {};
      }
      return JSON.parse(nurseriesData) as Record<string, SerializedNursery>;
    }
  }
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
          insights: [], // 気づきタグの初期値として空配列を設定
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
      await this.saveNurseries([...nurseries, nursery]);

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

  async getNursery(id: string): Promise<Nursery | null> {
    try {
      const nurseriesData = await this.loadData();
      const nurseryData = nurseriesData[id];

      if (!nurseryData) {
        return null;
      }

      const nursery: Nursery = {
        ...nurseryData,
        createdAt: new Date(nurseryData.createdAt),
        updatedAt: new Date(nurseryData.updatedAt),
        visitSessions: nurseryData.visitSessions.map(
          (session: VisitSessionData): VisitSession => ({
            ...session,
            insights: session.insights ?? [], // insights を空配列で正規化
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

      return nursery;
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

  async getAllNurseries(): Promise<Nursery[]> {
    try {
      const nurseriesData = await this.loadData();

      let needsMigration = false;
      const nurseries = Object.values(nurseriesData).map(
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
                insights: [], // 気づきタグの初期値として空配列を設定
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              },
            ];
            needsMigration = true;
          }

          return {
            ...nurseryData,
            createdAt: new Date(nurseryData.createdAt),
            updatedAt: new Date(nurseryData.updatedAt),
            visitSessions: visitSessions.map(
              (session: VisitSessionData): VisitSession => ({
                ...session,
                insights: session.insights ?? [], // insights を空配列で正規化
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

      if (needsMigration) {
        // マイグレーション発生時のみ保存してIDの安定性を確保
        await this.saveNurseries(nurseries);
      }

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
      const updated = nurseries.map((n) => (n.id === id ? updatedNursery : n));
      await this.saveNurseries(updated);
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
      const remaining = nurseries.filter((n) => n.id !== id);
      await this.saveNurseries(remaining);
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
        insights: input.insights ?? [],
        sharedWith: input.sharedWith ?? [],
        createdAt: now,
        updatedAt: now,
      };

      const updatedNursery: Nursery = {
        ...nursery,
        visitSessions: [...nursery.visitSessions, visitSession],
        updatedAt: now,
      };

      const nurseries = await this.getAllNurseries();
      const updated = nurseries.map((n) =>
        n.id === nurseryId ? updatedNursery : n
      );
      await this.saveNurseries(updated);

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
  private async saveNurseries(nurseries: Nursery[]): Promise<void> {
    try {
      const nurseriesMap = nurseries.reduce(
        (acc, n) => {
          acc[n.id] = n;
          return acc;
        },
        {} as Record<string, Nursery>
      );

      await this.saveData(nurseriesMap);
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

      await this.saveNurseries(nurseries);

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

      await this.saveNurseries(nurseries);
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
      await this.saveNurseries(nurseries);
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
  clearAllData(): void {
    try {
      if (this.encryptionEnabled) {
        this.storage.removeItem(ENCRYPTED_NURSERIES_STORAGE_KEY);
      } else {
        this.storage.removeItem(NURSERIES_STORAGE_KEY);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの削除に失敗しました',
          'CLEAR_DATA_FAILED',
          error
        );
      } else {
        throw new Error('Unknown error occurred');
      }
    }
  }
}

/**
 * 保育園データストアのファクトリ関数
 *
 * @param options - データストアの設定オプション
 * @returns 設定されたNurseryDataStoreインスタンス
 *
 * @example
 * ```typescript
 * // 暗号化有効
 * const encryptedStore = createNurseryDataStore({ encryptionEnabled: true });
 *
 * // カスタムストレージサービス
 * const customStore = createNurseryDataStore({
 *   storageService: new MockStorageService()
 * });
 * ```
 */
export const createNurseryDataStore = (options?: NurseryDataStoreOptions) => {
  return new NurseryDataStore(options);
};

/**
 * デフォルトの保育園データストアインスタンス（非暗号化）
 * アプリケーション全体で使用される標準のデータストア
 */
export const nurseryDataStore = new NurseryDataStore({
  encryptionEnabled: false,
});
