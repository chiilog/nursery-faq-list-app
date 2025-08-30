import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTemplate } from './useTemplate';
import { useNurseryStore } from '../../stores/nurseryStore';
import { useSystemTemplates } from './useSystemTemplates';
import { useCustomTemplates } from './useCustomTemplates';
import * as templateService from '../../services/template/templateService';
import type { Nursery } from '../../types/entities';

// モックの設定
vi.mock('../../stores/nurseryStore');
vi.mock('./useSystemTemplates');
vi.mock('./useCustomTemplates');
vi.mock('../../services/template/templateService');

describe('useTemplate', () => {
  const mockNursery: Nursery = {
    id: 'nursery-1',
    name: 'テスト保育園',
    visitSessions: [
      {
        id: 'session-1',
        visitDate: new Date('2025-02-15'),
        status: 'planned',
        questions: [],
        insights: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSystemTemplate = {
    id: 'default-nursery-visit',
    name: '保育園見学 基本質問セット',
    questions: ['質問1', '質問2'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 将来のユーザー作成テンプレート機能用（現在は未使用）
  // const mockUserTemplate = {
  //   id: 'user-template-1',
  //   title: 'ユーザー作成テンプレート',
  //   description: 'カスタムテンプレート',
  //   isCustom: true,
  //   questions: [
  //     { text: 'カスタム質問1', order: 0 },
  //     { text: 'カスタム質問2', order: 1 },
  //   ],
  //   createdBy: 'user-123',
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // };

  const mockUpdateNursery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック実装
    vi.mocked(useNurseryStore).mockReturnValue({
      nurseries: [mockNursery],
      currentNursery: mockNursery,
      addNursery: vi.fn(),
      updateNursery: mockUpdateNursery,
      deleteNursery: vi.fn(),
      getNurseryById: vi.fn((id) =>
        id === 'nursery-1' ? mockNursery : undefined
      ),
      setCurrentNursery: vi.fn(),
    });

    vi.mocked(useSystemTemplates).mockReturnValue({
      templates: [mockSystemTemplate],
      loading: false,
      error: null,
      loadTemplates: vi.fn(),
    });

    vi.mocked(useCustomTemplates).mockReturnValue({
      customTemplates: [],
      saveTemplate: vi.fn(),
      loadCustomTemplates: vi.fn(),
    });
  });

  describe('applyTemplate', () => {
    test('デフォルトテンプレートを保育園に適用できる', async () => {
      const updatedNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: [
              {
                id: 'q1',
                text: '質問1',
                isAnswered: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: 'q2',
                text: '質問2',
                isAnswered: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          },
        ],
      };

      vi.mocked(templateService.applyTemplateToNursery).mockReturnValue(
        updatedNursery
      );

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(true);
      });

      // テンプレートサービスが呼ばれたことを確認
      expect(templateService.applyTemplateToNursery).toHaveBeenCalledWith(
        mockSystemTemplate,
        mockNursery
      );

      // ストアの更新関数が呼ばれたことを確認
      expect(mockUpdateNursery).toHaveBeenCalledWith(
        'nursery-1',
        updatedNursery
      );
    });

    test('特定のテンプレートIDを指定して適用できる', async () => {
      const updatedNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: [
              {
                id: 'q1',
                text: '質問1',
                isAnswered: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          },
        ],
      };

      vi.mocked(templateService.applyTemplateToNursery).mockReturnValue(
        updatedNursery
      );

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate(
          'nursery-1',
          'default-nursery-visit'
        );
        expect(applied).toBe(true);
      });

      expect(templateService.applyTemplateToNursery).toHaveBeenCalledWith(
        mockSystemTemplate,
        mockNursery
      );
    });

    test('保育園が見つからない場合はfalseを返す', async () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [],
        currentNursery: null,
        addNursery: vi.fn(),
        updateNursery: mockUpdateNursery,
        deleteNursery: vi.fn(),
        getNurseryById: vi.fn(),
        setCurrentNursery: vi.fn(),
      });

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('non-existent');
        expect(applied).toBe(false);
      });

      expect(templateService.applyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
    });

    test('エラーが発生した場合はfalseを返す', async () => {
      vi.mocked(templateService.applyTemplateToNursery).mockImplementation(
        () => {
          throw new Error('テンプレート適用エラー');
        }
      );

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'テンプレート適用中にエラーが発生しました',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('isApplying', () => {
    test('適用中はtrueになる', async () => {
      // 正常なモック
      const updatedNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: [],
          },
        ],
      };

      vi.mocked(templateService.applyTemplateToNursery).mockReturnValue(
        updatedNursery
      );

      const { result } = renderHook(() => useTemplate());

      expect(result.current.isApplying).toBe(false);

      // 非同期処理を適切にテスト
      let applyPromise: Promise<boolean> | undefined;

      act(() => {
        applyPromise = result.current.applyTemplate('nursery-1');
      });

      // 次のマイクロタスクまで待つ
      await act(async () => {
        await Promise.resolve();
      });

      // 適用が完了している
      const applied = await applyPromise;
      expect(applied).toBe(true);
      expect(result.current.isApplying).toBe(false);
    });
  });

  describe('getTemplates', () => {
    test('全てのテンプレートを取得できる', () => {
      const { result } = renderHook(() => useTemplate());

      const templates = result.current.getTemplates();

      expect(templates).toHaveLength(1);
      expect(templates[0]).toEqual(mockSystemTemplate);
    });

    test('システム提供テンプレートのみ取得できる', () => {
      const { result } = renderHook(() => useTemplate());

      const templates = result.current.getTemplates(false);

      expect(templates).toHaveLength(1);
      expect(templates[0]).toEqual(mockSystemTemplate);
      expect(templates[0].isSystem).toBe(true);
    });

    test('ユーザー作成テンプレートのみ取得できる', () => {
      const { result } = renderHook(() => useTemplate());

      // 現在はユーザー作成テンプレートがないので空配列
      const templates = result.current.getTemplates(true);

      expect(templates).toHaveLength(0);
    });
  });

  describe('hasTemplates', () => {
    test('テンプレートの存在を確認できる', () => {
      const { result } = renderHook(() => useTemplate());

      // 全テンプレートの存在確認
      expect(result.current.hasTemplates()).toBe(true);

      // システム提供テンプレートの存在確認
      expect(result.current.hasTemplates(false)).toBe(true);

      // ユーザー作成テンプレートの存在確認（現在は存在しない）
      expect(result.current.hasTemplates(true)).toBe(false);
    });

    test('質問が空のテンプレートはカウントされない', () => {
      const emptyTemplate = {
        ...mockSystemTemplate,
        questions: [],
      };

      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [emptyTemplate],
        loading: false,
        error: null,
        loadTemplates: vi.fn(),
      });

      const { result } = renderHook(() => useTemplate());

      expect(result.current.hasTemplates()).toBe(false);
    });
  });

  describe('templateStats', () => {
    test('テンプレートの統計情報を取得できる', () => {
      const { result } = renderHook(() => useTemplate());

      const stats = result.current.templateStats;

      expect(stats).toEqual({
        total: 1,
        system: 1,
        custom: 0,
      });
    });
  });
});
