/**
 * データ変換ユーティリティのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import {
  convertQuestionListToNursery,
  convertNurseryToQuestionList,
  convertCreateQuestionListInput,
  migrateAllQuestionLists,
  addQuestionListToNursery,
} from './dataConversion';
import type {
  QuestionList,
  Nursery,
  VisitSession,
  Question,
  CreateQuestionListInput,
} from '../types/data';

// モックID生成
let idCounter = 0;
vi.mock('./id', () => ({
  generatePrefixedId: vi.fn(
    (prefix: string) => `${prefix}_test_${++idCounter}`
  ),
}));

describe('dataConversion', () => {
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

  describe('convertQuestionListToNursery', () => {
    it('QuestionListを正しくNurseryとVisitSessionに変換する', () => {
      const result = convertQuestionListToNursery(mockQuestionList);

      // Nurseryの検証
      expect(result.nursery.name).toBe('テスト保育園');
      expect(result.nursery.visitSessions).toHaveLength(1);
      expect(result.nursery.visitSessions[0]).toEqual(result.visitSession);
      expect(result.nursery.createdAt).toEqual(mockQuestionList.createdAt);

      // VisitSessionの検証
      expect(result.visitSession.visitDate).toEqual(mockQuestionList.visitDate);
      expect(result.visitSession.status).toBe('planned');
      expect(result.visitSession.questions).toEqual(mockQuestionList.questions);
      expect(result.visitSession.sharedWith).toEqual(
        mockQuestionList.sharedWith
      );
    });

    it('保育園名が未設定の場合、デフォルト名を使用する', () => {
      const listWithoutNurseryName = {
        ...mockQuestionList,
        nurseryName: undefined,
      };
      const result = convertQuestionListToNursery(listWithoutNurseryName);

      expect(result.nursery.name).toBe('未設定の保育園');
    });

    it('テンプレートの場合、特別な処理を行う', () => {
      const templateList = {
        ...mockQuestionList,
        isTemplate: true,
        title: 'テンプレート名',
      };
      const result = convertQuestionListToNursery(templateList);

      expect(result.nursery.name).toBe('テンプレート: テンプレート名');
      expect(result.visitSession.notes).toBe(
        'テンプレートから作成: テンプレート名'
      );
    });
  });

  describe('convertNurseryToQuestionList', () => {
    it('NurseryとVisitSessionを正しくQuestionListに変換する', () => {
      const mockVisitSession: VisitSession = {
        id: 'session1',
        visitDate: new Date('2024-02-01'),
        status: 'planned',
        questions: [mockQuestion],
        sharedWith: ['user2'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockNursery: Nursery = {
        id: 'nursery1',
        name: 'テスト保育園',
        visitSessions: [mockVisitSession],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const result = convertNurseryToQuestionList(
        mockNursery,
        mockVisitSession
      );

      expect(result.id).toBe('session1');
      expect(result.title).toBe('テスト保育園');
      expect(result.nurseryName).toBe('テスト保育園');
      expect(result.visitDate).toEqual(mockVisitSession.visitDate);
      expect(result.questions).toEqual(mockVisitSession.questions);
      expect(result.isTemplate).toBe(false);
    });
  });

  describe('convertCreateQuestionListInput', () => {
    it('CreateQuestionListInputを正しく分割する', () => {
      const input: CreateQuestionListInput = {
        title: 'テスト保育園',
        nurseryName: 'テスト保育園',
        visitDate: new Date('2024-02-01'),
        questions: [{ text: '質問1', answer: '', isAnswered: false }],
        sharedWith: ['user2'],
        isTemplate: false,
      };

      const result = convertCreateQuestionListInput(input);

      expect(result.nurseryInput.name).toBe('テスト保育園');
      expect(result.visitSessionInput.visitDate).toEqual(input.visitDate);
      expect(result.visitSessionInput.questions).toEqual(input.questions);
      expect(result.visitSessionInput.sharedWith).toEqual(input.sharedWith);
    });

    it('保育園名が未設定の場合、タイトルを使用する', () => {
      const input: CreateQuestionListInput = {
        title: 'タイトル',
        isTemplate: false,
      };

      const result = convertCreateQuestionListInput(input);

      expect(result.nurseryInput.name).toBe('タイトル');
    });
  });

  describe('migrateAllQuestionLists', () => {
    it('複数のQuestionListを正しく移行する', () => {
      const lists: QuestionList[] = [
        {
          ...mockQuestionList,
          id: 'list1',
          title: '保育園A',
          nurseryName: '保育園A',
        },
        {
          ...mockQuestionList,
          id: 'list2',
          title: '保育園A',
          nurseryName: '保育園A',
        },
        {
          ...mockQuestionList,
          id: 'list3',
          title: '保育園B',
          nurseryName: '保育園B',
        },
      ];

      const result = migrateAllQuestionLists(lists);

      // 2つの保育園が作成されることを確認
      expect(result.nurseries.size).toBe(2);

      // 3つのセッションが作成されることを確認
      expect(result.visitSessions.size).toBe(3);

      // マッピングが正しく作成されることを確認
      expect(result.mapping.size).toBe(3);
      expect(result.mapping.has('list1')).toBe(true);
      expect(result.mapping.has('list2')).toBe(true);
      expect(result.mapping.has('list3')).toBe(true);
    });

    it('同じ保育園名のリストは1つのNurseryにまとめられる', () => {
      const lists: QuestionList[] = [
        {
          ...mockQuestionList,
          id: 'list1',
          nurseryName: '同じ保育園',
        },
        {
          ...mockQuestionList,
          id: 'list2',
          nurseryName: '同じ保育園',
        },
      ];

      const result = migrateAllQuestionLists(lists);

      // 1つの保育園のみ作成される
      expect(result.nurseries.size).toBe(1);

      const nursery = Array.from(result.nurseries.values())[0];
      expect(nursery.name).toBe('同じ保育園');
      expect(nursery.visitSessions.length).toBe(2);
    });
  });

  describe('addQuestionListToNursery', () => {
    it('既存のNurseryに新しいVisitSessionを追加する', () => {
      const existingSession: VisitSession = {
        id: 'existing_session',
        visitDate: new Date('2024-01-15'),
        status: 'planned',
        questions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const nursery: Nursery = {
        id: 'nursery1',
        name: 'テスト保育園',
        visitSessions: [existingSession],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const result = addQuestionListToNursery(mockQuestionList, nursery);

      expect(result.updatedNursery.visitSessions.length).toBe(2);
      expect(result.updatedNursery.visitSessions[0]).toBe(existingSession);
      expect(result.newVisitSession.questions).toEqual(
        mockQuestionList.questions
      );
    });
  });
});
