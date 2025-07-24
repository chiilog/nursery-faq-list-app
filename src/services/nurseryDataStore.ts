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
} from '../types/data';

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
      
      const nursery: Nursery = {
        id: nurseryId,
        name: input.name,
        address: input.address,
        phoneNumber: input.phoneNumber,
        website: input.website,
        notes: input.notes,
        visitSessions: [],
        createdAt: now,
        updatedAt: now,
      };

      const nurseries = await this.getAllNurseries();
      const nurseriesMap = nurseries.reduce((acc, n) => {
        acc[n.id] = n;
        return acc;
      }, {} as Record<string, Nursery>);
      
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

  async getNursery(id: string): Promise<Nursery | null> {
    try {
      const nurseriesData = localStorage.getItem(NURSERIES_STORAGE_KEY);
      if (!nurseriesData) return null;
      
      const nurseries = JSON.parse(nurseriesData) as Record<string, any>;
      const nurseryData = nurseries[id];
      
      if (!nurseryData) return null;
      
      return {
        ...nurseryData,
        createdAt: new Date(nurseryData.createdAt),
        updatedAt: new Date(nurseryData.updatedAt),
        visitSessions: nurseryData.visitSessions.map((session: any) => ({
          ...session,
          visitDate: new Date(session.visitDate),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの読み込みに失敗しました',
          'LOAD_FAILED',
          error
        );
      }
      throw error;
    }
  }

  async getAllNurseries(): Promise<Nursery[]> {
    try {
      const nurseriesData = localStorage.getItem(NURSERIES_STORAGE_KEY);
      if (!nurseriesData) return [];
      
      const nurseries = JSON.parse(nurseriesData) as Record<string, any>;
      
      return Object.values(nurseries).map((nurseryData: any) => ({
        ...nurseryData,
        createdAt: new Date(nurseryData.createdAt),
        updatedAt: new Date(nurseryData.updatedAt),
        visitSessions: nurseryData.visitSessions.map((session: any) => ({
          ...session,
          visitDate: new Date(session.visitDate),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        })),
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの読み込みに失敗しました',
          'LOAD_FAILED',
          error
        );
      }
      throw error;
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
      const nurseriesMap = nurseries.reduce((acc, n) => {
        acc[n.id] = n.id === id ? updatedNursery : n;
        return acc;
      }, {} as Record<string, Nursery>);

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
      const nurseriesMap = nurseries.reduce((acc, n) => {
        if (n.id !== id) {
          acc[n.id] = n;
        }
        return acc;
      }, {} as Record<string, Nursery>);

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
        questions: input.questions?.map((q, index) => ({
          id: generateId('question'),
          text: q.text,
          answer: '',
          isAnswered: false,
          priority: q.priority || 'medium',
          category: q.category,
          order: index,
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
      const nurseriesMap = nurseries.reduce((acc, n) => {
        acc[n.id] = n.id === nurseryId ? updatedNursery : n;
        return acc;
      }, {} as Record<string, Nursery>);

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
        const session = nursery.visitSessions.find(s => s.id === sessionId);
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
        const index = nursery.visitSessions.findIndex(s => s.id === sessionId);
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
        const sessionExists = nursery.visitSessions.some(s => s.id === sessionId);
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
        s => s.id !== sessionId
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

  // データクリア
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(NURSERIES_STORAGE_KEY);
    } catch (error) {
      if (error instanceof Error) {
        throw new NurseryDataStoreError(
          'データの削除に失敗しました',
          'CLEAR_DATA_FAILED',
          error
        );
      }
      throw error;
    }
  }
}

// シングルトンインスタンス
export const nurseryDataStore = new NurseryDataStore();