import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTemplate } from './useTemplate';
import { useNurseryStore } from '../../stores/nurseryStore';
import type { NurseryState } from '../../stores/nurseryStore';
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

  const mockUpdateNursery = vi.fn<NurseryState['updateNursery']>();
  const mockCreateVisitSession = vi.fn<NurseryState['createVisitSession']>();
  const mockSetCurrentNursery = vi.fn<NurseryState['setCurrentNursery']>();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック実装
    vi.mocked(useNurseryStore).mockReturnValue({
      nurseries: [mockNursery],
      currentNursery: mockNursery,
      updateNursery: mockUpdateNursery,
      createVisitSession: mockCreateVisitSession,
      setCurrentNursery: mockSetCurrentNursery,
    } as ReturnType<typeof useNurseryStore>);

    // getStateメソッドのモック
    vi.mocked(useNurseryStore).getState = vi.fn().mockReturnValue({
      currentNursery: mockNursery,
    });

    vi.mocked(useSystemTemplates).mockReturnValue({
      templates: [mockSystemTemplate],
      loading: false,
      error: null,
      loadTemplates:
        vi.fn<ReturnType<typeof useSystemTemplates>['loadTemplates']>(),
    });

    vi.mocked(useCustomTemplates).mockReturnValue({
      customTemplates: [],
      saveTemplate:
        vi.fn<ReturnType<typeof useCustomTemplates>['saveTemplate']>(),
      loadCustomTemplates:
        vi.fn<ReturnType<typeof useCustomTemplates>['loadCustomTemplates']>(),
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

    test('セッションが存在しない場合は新規作成してからテンプレートを適用する', async () => {
      // セッションが存在しない保育園を作成
      const nurseryWithoutSession: Nursery = {
        ...mockNursery,
        visitSessions: [],
      };

      // createVisitSessionのモックをセットアップ
      mockCreateVisitSession.mockResolvedValue('new-session-id');

      // useNurseryStoreのモックを段階的に更新するよう設定
      const mockStoreState = {
        nurseries: [nurseryWithoutSession],
        currentNursery: nurseryWithoutSession,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
        setCurrentNursery: mockSetCurrentNursery,
      };

      vi.mocked(useNurseryStore).mockReturnValue(
        mockStoreState as ReturnType<typeof useNurseryStore>
      );

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        await result.current.applyTemplate('nursery-1');
      });

      // セッション作成が呼ばれることを確認
      expect(mockCreateVisitSession).toHaveBeenCalledWith('nursery-1', {
        visitDate: expect.any(Date),
        status: 'planned',
        questions: [],
        insights: [],
      });

      // テンプレート適用が呼ばれることを確認
      expect(templateService.applyTemplateToNursery).toHaveBeenCalledWith(
        mockSystemTemplate,
        expect.objectContaining({
          id: 'nursery-1',
          visitSessions: expect.arrayContaining([
            expect.objectContaining({
              id: 'session-1',
              status: 'planned',
            }),
          ]),
        })
      );

      // 保育園データの更新が呼ばれることを確認
      expect(mockUpdateNursery).toHaveBeenCalledWith(
        'nursery-1',
        expect.objectContaining({
          id: 'nursery-1',
          visitSessions: expect.arrayContaining([
            expect.objectContaining({
              id: 'session-1',
              status: 'planned',
              questions: expect.arrayContaining([
                expect.objectContaining({
                  text: expect.any(String),
                }),
              ]),
              insights: [],
            }),
          ]),
        })
      );
    });

    test('保育園が見つからない場合はfalseを返す', async () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [],
        currentNursery: null,
        updateNursery: mockUpdateNursery,
      } as ReturnType<typeof useNurseryStore>);

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
      // updateNurseryを非同期にして遅延を作る
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });

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

      // updateNurseryを非同期mockに設定
      const mockUpdateNurseryAsync = vi.fn().mockImplementation(() => {
        return updatePromise;
      });

      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [mockNursery],
        currentNursery: mockNursery,
        updateNursery: mockUpdateNurseryAsync,
      } as ReturnType<typeof useNurseryStore>);

      // templateService.applyTemplateToNurseryは同期的にmock
      vi.mocked(templateService.applyTemplateToNursery).mockReturnValue(
        updatedNursery
      );

      const { result } = renderHook(() => useTemplate());

      // 初期状態は適用中でない
      expect(result.current.isApplying).toBe(false);

      // テンプレート適用を開始
      let applyPromise: Promise<boolean>;
      act(() => {
        applyPromise = result.current.applyTemplate('nursery-1');
      });

      // マイクロタスクを実行してsetIsApplying(true)を反映
      await act(async () => {
        await Promise.resolve();
      });

      // 適用中であることを確認
      expect(result.current.isApplying).toBe(true);

      // updateNurseryを完了させる
      act(() => {
        resolveUpdate();
      });

      // 適用完了を待つ
      await act(async () => {
        const applied = await applyPromise!;
        expect(applied).toBe(true);
      });

      // 適用完了後はfalseに戻る
      expect(result.current.isApplying).toBe(false);
    });

    test('エラー発生時もisApplyingがfalseに戻る', async () => {
      // updateNurseryでエラーを発生させる
      let rejectUpdate: (error: Error) => void;
      const errorPromise = new Promise<void>((_, reject) => {
        rejectUpdate = reject;
      });

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

      // updateNurseryを非同期エラーmockに設定
      const mockUpdateNurseryError = vi.fn().mockImplementation(() => {
        return errorPromise;
      });

      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [mockNursery],
        currentNursery: mockNursery,
        updateNursery: mockUpdateNurseryError,
      } as ReturnType<typeof useNurseryStore>);

      vi.mocked(templateService.applyTemplateToNursery).mockReturnValue(
        updatedNursery
      );

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      expect(result.current.isApplying).toBe(false);

      // テンプレート適用を開始
      let applyPromise: Promise<boolean>;
      act(() => {
        applyPromise = result.current.applyTemplate('nursery-1');
      });

      // マイクロタスクを実行してsetIsApplying(true)を反映
      await act(async () => {
        await Promise.resolve();
      });

      // 適用中であることを確認
      expect(result.current.isApplying).toBe(true);

      // エラーを発生させる
      act(() => {
        rejectUpdate(new Error('updateNursery エラー'));
      });

      // エラー処理完了を待つ
      await act(async () => {
        const applied = await applyPromise!;
        expect(applied).toBe(false);
      });

      // エラー発生後もisApplyingがfalseに戻ることを確認
      expect(result.current.isApplying).toBe(false);

      consoleErrorSpy.mockRestore();
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

  describe('境界値・エッジケーステスト', () => {
    test('空のテンプレートを適用しても質問が追加されない', async () => {
      const emptyTemplate = { ...mockSystemTemplate, questions: [] };
      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [emptyTemplate],
        loading: false,
        error: null,
        loadTemplates: vi.fn(),
      });

      const updatedNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: [], // 空のテンプレートなので質問は追加されない
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

      // テンプレートサービスが空のテンプレートで呼ばれることを確認
      expect(templateService.applyTemplateToNursery).toHaveBeenCalledWith(
        emptyTemplate,
        mockNursery
      );

      // 質問が追加されていないことを確認
      const calls = mockUpdateNursery.mock.calls;
      const updatedNurseryArg = calls[calls.length - 1][1];
      expect(updatedNurseryArg.visitSessions).toBeDefined();
      expect(updatedNurseryArg.visitSessions![0].questions).toHaveLength(0);
    });

    test('存在しないテンプレートIDを指定した場合はfalseを返す', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate(
          'nursery-1',
          'non-existent-template'
        );
        expect(applied).toBe(false);
      });

      expect(templateService.applyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'テンプレート（ID: non-existent-template）が見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('システムテンプレートが存在しない場合（デフォルト適用時）はfalseを返す', async () => {
      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [],
        loading: false,
        error: null,
        loadTemplates: vi.fn(),
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(false);
      });

      expect(templateService.applyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'システム提供テンプレートが見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('currentNurseryがnullの場合はfalseを返す', async () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [],
        currentNursery: null,
        updateNursery: mockUpdateNursery,
      } as ReturnType<typeof useNurseryStore>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(false);
      });

      expect(templateService.applyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '保育園（ID: nursery-1）が見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('currentNurseryのIDが指定されたIDと異なる場合はfalseを返す', async () => {
      const differentNursery = { ...mockNursery, id: 'different-nursery' };

      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [differentNursery],
        currentNursery: differentNursery,
        updateNursery: mockUpdateNursery,
      } as ReturnType<typeof useNurseryStore>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(false);
      });

      expect(templateService.applyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '保育園（ID: nursery-1）が見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('createVisitSessionが失敗した場合はfalseを返す', async () => {
      // セッションが存在しない保育園を作成
      const nurseryWithoutSession: Nursery = {
        ...mockNursery,
        visitSessions: [],
      };

      // createVisitSessionのモックを失敗させる
      mockCreateVisitSession.mockRejectedValue(
        new Error('セッション作成エラー')
      );

      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [nurseryWithoutSession],
        currentNursery: nurseryWithoutSession,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as ReturnType<typeof useNurseryStore>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(false);
      });

      expect(mockCreateVisitSession).toHaveBeenCalledWith('nursery-1', {
        visitDate: expect.any(Date),
        status: 'planned',
        questions: [],
        insights: [],
      });
      expect(templateService.applyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '見学セッションの作成に失敗しました',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('データ整合性検証', () => {
    test('適用後の質問データが正しい構造を持つ', async () => {
      const expectedQuestions = [
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
      ];

      const updatedNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: expectedQuestions,
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

      // 更新後の保育園データを取得
      const calls = mockUpdateNursery.mock.calls;
      const updatedNurseryArg = calls[calls.length - 1][1];
      expect(updatedNurseryArg.visitSessions).toBeDefined();
      const questions = updatedNurseryArg.visitSessions![0].questions;

      // 各質問が必要なプロパティを持つことを確認
      questions.forEach((question: any) => {
        expect(question).toMatchObject({
          id: expect.any(String),
          text: expect.any(String),
          isAnswered: expect.any(Boolean),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });

        // 文字列が空でないことを確認
        expect(question.id).toBeTruthy();
        expect(question.text).toBeTruthy();
      });

      // 質問の数が期待値と一致することを確認
      expect(questions).toHaveLength(2);
    });

    test('セッション作成後の適用でセッションデータが正しい構造を持つ', async () => {
      // セッションが存在しない保育園を作成
      const nurseryWithoutSession: Nursery = {
        ...mockNursery,
        visitSessions: [],
      };

      // セッション作成後の保育園データをモック
      const nurseryWithNewSession: Nursery = {
        ...mockNursery,
        visitSessions: [
          {
            id: 'new-session-id',
            visitDate: new Date(),
            status: 'planned',
            questions: [],
            insights: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      mockCreateVisitSession.mockResolvedValue('new-session-id');

      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [nurseryWithoutSession],
        currentNursery: nurseryWithoutSession,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as ReturnType<typeof useNurseryStore>);

      // getStateで作成後のデータを返す
      vi.mocked(useNurseryStore).getState = vi.fn().mockReturnValue({
        currentNursery: nurseryWithNewSession,
      });

      const updatedNurseryWithQuestions = {
        ...nurseryWithNewSession,
        visitSessions: [
          {
            ...nurseryWithNewSession.visitSessions[0],
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
        updatedNurseryWithQuestions
      );

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(true);
      });

      // セッション作成が呼ばれたことを確認
      expect(mockCreateVisitSession).toHaveBeenCalledWith('nursery-1', {
        visitDate: expect.any(Date),
        status: 'planned',
        questions: [],
        insights: [],
      });

      // テンプレート適用が新しいセッションデータで呼ばれたことを確認
      expect(templateService.applyTemplateToNursery).toHaveBeenCalledWith(
        mockSystemTemplate,
        expect.objectContaining({
          visitSessions: [
            expect.objectContaining({
              id: 'new-session-id',
              status: 'planned',
              questions: [],
              insights: [],
            }),
          ],
        })
      );

      // 最終的な更新データが正しい構造を持つことを確認
      const calls = mockUpdateNursery.mock.calls;
      const finalUpdatedNursery = calls[calls.length - 1][1];
      expect(finalUpdatedNursery.visitSessions).toBeDefined();
      const session = finalUpdatedNursery.visitSessions![0];

      expect(session).toMatchObject({
        id: expect.any(String),
        visitDate: expect.any(Date),
        status: 'planned',
        questions: expect.any(Array),
        insights: expect.any(Array),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    test('テンプレート適用で元の保育園データが正しく保持される', async () => {
      const originalCreatedAt = new Date('2025-01-01');
      const originalUpdatedAt = new Date('2025-01-02');

      const nurseryWithMetadata = {
        ...mockNursery,
        name: '特殊な保育園名',
        createdAt: originalCreatedAt,
        updatedAt: originalUpdatedAt,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            visitDate: new Date('2025-02-20'),
            questions: [
              {
                id: 'existing-q1',
                text: '既存の質問',
                isAnswered: true,
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date('2025-01-16'),
              },
            ],
          },
        ],
      };

      vi.mocked(useNurseryStore).mockReturnValue({
        nurseries: [nurseryWithMetadata],
        currentNursery: nurseryWithMetadata,
        updateNursery: mockUpdateNursery,
      } as ReturnType<typeof useNurseryStore>);

      const updatedNursery = {
        ...nurseryWithMetadata,
        visitSessions: [
          {
            ...nurseryWithMetadata.visitSessions[0],
            questions: [
              // 既存の質問を保持
              ...nurseryWithMetadata.visitSessions[0].questions,
              // 新しい質問を追加
              {
                id: 'new-q1',
                text: '新しい質問1',
                isAnswered: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: 'new-q2',
                text: '新しい質問2',
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

      // 更新された保育園データを取得
      const calls = mockUpdateNursery.mock.calls;
      const finalNursery = calls[calls.length - 1][1];

      // 保育園の基本データが保持されていることを確認
      expect(finalNursery).toMatchObject({
        id: 'nursery-1',
        name: '特殊な保育園名',
        createdAt: originalCreatedAt,
        updatedAt: originalUpdatedAt,
      });

      // セッションデータが保持されていることを確認
      expect(finalNursery.visitSessions).toBeDefined();
      const session = finalNursery.visitSessions![0];
      expect(session.visitDate).toEqual(new Date('2025-02-20'));

      // 既存の質問と新しい質問の両方が含まれていることを確認
      expect(session.questions).toHaveLength(3);

      // 既存の質問が保持されていることを確認
      const existingQuestion = session.questions.find(
        (q: any) => q.id === 'existing-q1'
      );
      expect(existingQuestion).toMatchObject({
        id: 'existing-q1',
        text: '既存の質問',
        isAnswered: true,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-16'),
      });
    });

    test('複数回テンプレート適用時の日付フィールドが適切に更新される', async () => {
      // 1回目の適用
      const firstUpdateTime = new Date('2025-01-01T10:00:00Z');
      vi.setSystemTime(firstUpdateTime);

      const firstUpdatedNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: [
              {
                id: 'q1',
                text: '質問1',
                isAnswered: false,
                createdAt: firstUpdateTime,
                updatedAt: firstUpdateTime,
              },
            ],
          },
        ],
      };

      vi.mocked(templateService.applyTemplateToNursery).mockReturnValue(
        firstUpdatedNursery
      );

      const { result } = renderHook(() => useTemplate());

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(true);
      });

      // 2回目の適用（時間を進める）
      const secondUpdateTime = new Date('2025-01-01T11:00:00Z');
      vi.setSystemTime(secondUpdateTime);

      const secondUpdatedNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: [
              {
                id: 'q1',
                text: '質問1',
                isAnswered: false,
                createdAt: firstUpdateTime, // 作成日時は変更されない
                updatedAt: secondUpdateTime, // 更新日時は新しくなる
              },
              {
                id: 'q2',
                text: '質問2',
                isAnswered: false,
                createdAt: secondUpdateTime, // 新しい質問の作成日時
                updatedAt: secondUpdateTime,
              },
            ],
          },
        ],
      };

      vi.mocked(templateService.applyTemplateToNursery).mockReturnValue(
        secondUpdatedNursery
      );

      await act(async () => {
        const applied = await result.current.applyTemplate('nursery-1');
        expect(applied).toBe(true);
      });

      // 2回目の更新データを確認
      const calls = mockUpdateNursery.mock.calls;
      const finalNursery = calls[calls.length - 1][1];
      expect(finalNursery.visitSessions).toBeDefined();
      const questions = finalNursery.visitSessions![0].questions;

      // 1回目から存在する質問は作成日時が保持され、更新日時が更新される
      const firstQuestion = questions.find((q: any) => q.id === 'q1');
      expect(firstQuestion).toMatchObject({
        createdAt: firstUpdateTime,
        updatedAt: secondUpdateTime,
      });

      // 2回目で追加された質問は作成日時と更新日時が同じ
      const secondQuestion = questions.find((q: any) => q.id === 'q2');
      expect(secondQuestion).toMatchObject({
        createdAt: secondUpdateTime,
        updatedAt: secondUpdateTime,
      });

      // システム時刻をリセット
      vi.useRealTimers();
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
