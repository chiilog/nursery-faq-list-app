/**
 * NurseryDataStore の QuestionList 自動変換機能のテスト
 * TDD原則に従って、実装前にテストを作成
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nurseryDataStore } from './nurseryDataStore';
import type {
  QuestionList,
  Question,
  CreateQuestionListInput,
} from '../types/data';

// 既存のdataStoreをモック
vi.mock('./dataStore', () => ({
  dataStore: {
    getAllQuestionLists: vi.fn(),
    getQuestionList: vi.fn(),
    createQuestionList: vi.fn(),
    updateQuestionList: vi.fn(),
    deleteQuestionList: vi.fn(),
  },
}));

describe('NurseryDataStore - QuestionList Migration', () => {
  const mockQuestion: Question = {
    id: 'q1',
    text: 'テスト質問',
    answer: '',
    isAnswered: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockQuestionList: QuestionList = {
    id: 'list1',
    title: 'テスト保育園',
    nurseryName: 'テスト保育園',
    visitDate: new Date('2024-02-01'),
    questions: [mockQuestion],
    sharedWith: ['user2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isTemplate: false,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    // localStorage をクリア
    localStorage.clear();

    // dataStoreのデフォルトモック設定
    const { dataStore } = await import('./dataStore');
    vi.mocked(dataStore.getAllQuestionLists).mockResolvedValue([]);
  });

  describe('QuestionList データの自動変換', () => {
    it('既存のQuestionListデータをNursery/VisitSession構造に自動変換する', async () => {
      // Given: dataStore に QuestionList データが存在
      const { dataStore } = await import('./dataStore');
      vi.mocked(dataStore.getAllQuestionLists).mockResolvedValue([
        mockQuestionList,
      ]);

      // When: nurseryDataStore から保育園一覧を取得
      const nurseries = await nurseryDataStore.getAllNurseries();

      // Then: QuestionList が Nursery/VisitSession に変換される
      expect(nurseries).toHaveLength(1);
      const nursery = nurseries[0];
      expect(nursery.name).toBe('テスト保育園');
      expect(nursery.visitSessions).toHaveLength(1);

      const visitSession = nursery.visitSessions[0];
      expect(visitSession.visitDate).toEqual(mockQuestionList.visitDate);
      expect(visitSession.questions).toEqual(mockQuestionList.questions);
      expect(visitSession.sharedWith).toEqual(mockQuestionList.sharedWith);
    });

    it('同じ保育園名のQuestionListは1つのNurseryにまとめられる', async () => {
      // Given: 同じ保育園名の複数のQuestionList
      const questionLists: QuestionList[] = [
        {
          ...mockQuestionList,
          id: 'list1',
          nurseryName: '同じ保育園',
          visitDate: new Date('2024-02-01'),
        },
        {
          ...mockQuestionList,
          id: 'list2',
          nurseryName: '同じ保育園',
          visitDate: new Date('2024-02-15'),
        },
      ];

      const { dataStore } = await import('./dataStore');
      vi.mocked(dataStore.getAllQuestionLists).mockResolvedValue(questionLists);

      // When: nurseryDataStore から保育園一覧を取得
      const nurseries = await nurseryDataStore.getAllNurseries();

      // Then: 1つのNurseryに2つのVisitSessionが含まれる
      expect(nurseries).toHaveLength(1);
      const nursery = nurseries[0];
      expect(nursery.name).toBe('同じ保育園');
      expect(nursery.visitSessions).toHaveLength(2);
    });

    it('変換されたデータがlocalStorageに保存される', async () => {
      // Given: dataStore に QuestionList データが存在
      const { dataStore } = await import('./dataStore');
      vi.mocked(dataStore.getAllQuestionLists).mockResolvedValue([
        mockQuestionList,
      ]);

      // When: nurseryDataStore から保育園一覧を取得
      await nurseryDataStore.getAllNurseries();

      // Then: 変換されたデータがNursery形式でlocalStorageに保存される
      const stored = localStorage.getItem('nursery-app-nurseries');
      expect(stored).toBeTruthy();

      const parsedData = JSON.parse(stored!);
      expect(typeof parsedData).toBe('object');
      const nurseriesArray = Object.values(parsedData);
      expect(nurseriesArray.length).toBeGreaterThan(0);
      expect((nurseriesArray[0] as any).name).toBe('テスト保育園');
    });
  });

  describe('後方互換性API', () => {
    it('QuestionList形式でデータを取得できる', async () => {
      // Given: localStorage に Nursery/VisitSession データを直接保存
      const nursery = {
        id: 'nursery1',
        name: 'テスト保育園',
        visitSessions: [
          {
            id: 'session1',
            visitDate: new Date('2024-02-01').toISOString(),
            status: 'planned',
            questions: [
              {
                ...mockQuestion,
                createdAt: mockQuestion.createdAt.toISOString(),
                updatedAt: mockQuestion.updatedAt.toISOString(),
              },
            ],
            sharedWith: ['user2'],
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
          },
        ],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      };

      localStorage.setItem(
        'nursery-app-nurseries',
        JSON.stringify({ nursery1: nursery })
      );

      // When: QuestionList形式でデータを取得
      const questionLists = await nurseryDataStore.getAllQuestionListsCompat();

      // Then: Nursery/VisitSession が QuestionList 形式に変換される
      expect(questionLists).toHaveLength(1);
      const questionList = questionLists[0];
      expect(questionList.nurseryName).toBe('テスト保育園');
      expect(questionList.visitDate).toEqual(new Date('2024-02-01'));
      expect(questionList.questions[0].text).toBe('テスト質問');
      expect(questionList.sharedWith).toEqual(['user2']);
    });

    it('QuestionList形式でデータを作成できる', async () => {
      // Given: QuestionList形式の入力データ
      const input: CreateQuestionListInput = {
        title: '新しい保育園',
        nurseryName: '新しい保育園',
        visitDate: new Date('2024-03-01'),
        questions: [{ text: '新しい質問', answer: '', isAnswered: false }],
        sharedWith: ['user3'],
        isTemplate: false,
      };

      // When: QuestionList形式でデータを作成
      const createdId = await nurseryDataStore.createQuestionListCompat(input);

      // Then: Nursery/VisitSession として保存される
      const nurseries = await nurseryDataStore.getAllNurseries();
      expect(nurseries).toHaveLength(1);

      const nursery = nurseries[0];
      expect(nursery.name).toBe('新しい保育園');
      expect(nursery.visitSessions).toHaveLength(1); // デフォルトセッションは削除され、新しいセッションのみ

      // 作成されたセッションを確認
      const newSession = nursery.visitSessions[0];
      expect(newSession.id).toBe(createdId);
      expect(newSession.visitDate).toEqual(input.visitDate);
      expect(newSession.questions[0].text).toBe('新しい質問');
      expect(newSession.sharedWith).toEqual(input.sharedWith);

      // 作成されたIDが返される
      expect(createdId).toBeTruthy();
    });

    it('QuestionList形式でデータを更新できる', async () => {
      // Given: 既存のNursery/VisitSessionデータ
      const nurseryId = await nurseryDataStore.createNursery({
        name: 'テスト保育園',
      });

      const sessionId = await nurseryDataStore.createVisitSession(nurseryId, {
        visitDate: new Date('2024-02-01'),
        questions: [{ text: '元の質問', answer: '', isAnswered: false }],
      });

      // When: QuestionList形式で更新
      await nurseryDataStore.updateQuestionListCompat(sessionId, {
        nurseryName: '更新された保育園',
        visitDate: new Date('2024-02-15'),
      });

      // Then: Nursery/VisitSessionが更新される
      const nursery = await nurseryDataStore.getNursery(nurseryId);
      expect(nursery?.name).toBe('更新された保育園');

      const visitSession = await nurseryDataStore.getVisitSession(sessionId);
      expect(visitSession?.visitDate).toEqual(new Date('2024-02-15'));
    });
  });

  describe('データ移行の制御', () => {
    it('移行済みフラグが設定されている場合、重複移行を回避する', async () => {
      // Given: 移行済みフラグが設定済み
      localStorage.setItem('nursery-migration-completed', 'true');

      const { dataStore } = await import('./dataStore');
      const getAllQuestionListsSpy = vi.mocked(dataStore.getAllQuestionLists);

      // When: nurseryDataStore から保育園一覧を取得
      await nurseryDataStore.getAllNurseries();

      // Then: dataStore.getAllQuestionLists が呼ばれない
      expect(getAllQuestionListsSpy).not.toHaveBeenCalled();
    });

    it('強制移行オプションで重複移行を実行できる', async () => {
      // Given: 移行済みフラグが設定済みだが、強制移行を指定
      localStorage.setItem('nursery-migration-completed', 'true');

      const { dataStore } = await import('./dataStore');
      vi.mocked(dataStore.getAllQuestionLists).mockResolvedValue([
        mockQuestionList,
      ]);

      // When: 強制移行オプションで保育園一覧を取得
      const nurseries = await nurseryDataStore.getAllNurseries({
        forceMigration: true,
      });

      // Then: 移行が実行される
      expect(nurseries).toHaveLength(1);
      expect(nurseries[0].name).toBe('テスト保育園');
    });
  });
});
