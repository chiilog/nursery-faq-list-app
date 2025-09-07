import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTemplateApplication } from './useTemplateApplication';
import { useNurseryStore } from '../../stores/nurseryStore';
import { applyTemplateToNursery } from '../../services/template/templateService';
import type { Nursery, Template } from '../../types/entities';

// モックの設定
vi.mock('../../stores/nurseryStore');
vi.mock('../../services/template/templateService');

describe('useTemplateApplication', () => {
  const mockTemplate: Template = {
    id: 'template-1',
    name: 'テストテンプレート',
    questions: ['質問1', '質問2', '質問3'],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const mockNurseryWithoutSession: Nursery = {
    ...mockNursery,
    visitSessions: [],
  };

  const mockUpdatedNursery: Nursery = {
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
          {
            id: 'q3',
            text: '質問3',
            isAnswered: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
  };

  const mockUpdateNursery = vi.fn();
  const mockCreateVisitSession = vi.fn();
  const mockApplyTemplateToNursery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのmock設定
    vi.mocked(useNurseryStore).mockReturnValue({
      currentNursery: mockNursery,
      updateNursery: mockUpdateNursery,
      createVisitSession: mockCreateVisitSession,
    } as any);

    // getStateのmock
    vi.mocked(useNurseryStore).getState = vi.fn().mockReturnValue({
      currentNursery: mockNursery,
    });

    mockApplyTemplateToNursery.mockReturnValue(mockUpdatedNursery);

    // templateServiceのapplyTemplateToNursery関数をモック
    vi.mocked(applyTemplateToNursery).mockImplementation(
      mockApplyTemplateToNursery
    );
  });

  describe('基本的なテンプレート適用', () => {
    test('セッションが存在する場合、正常にテンプレートを適用できる', async () => {
      const { result } = renderHook(() => useTemplateApplication());

      expect(result.current.isApplying).toBe(false);

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(true);
      });

      // テンプレートサービスが呼ばれたことを確認
      expect(mockApplyTemplateToNursery).toHaveBeenCalledWith(
        mockTemplate,
        mockNursery
      );

      // 保育園データの更新が呼ばれたことを確認（UpdateNurseryInput形式）
      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        visitSessions: mockUpdatedNursery.visitSessions,
      });

      // セッション作成は呼ばれない
      expect(mockCreateVisitSession).not.toHaveBeenCalled();
    });

    test('適用中はisApplyingがtrueになる', async () => {
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });

      mockUpdateNursery.mockReturnValue(updatePromise);

      const { result } = renderHook(() => useTemplateApplication());

      expect(result.current.isApplying).toBe(false);

      let applyPromise: Promise<boolean>;
      act(() => {
        applyPromise = result.current.applyTemplate('nursery-1', mockTemplate);
      });

      // マイクロタスクを実行してsetIsApplying(true)を反映
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isApplying).toBe(true);

      // 適用完了
      act(() => {
        resolveUpdate();
      });

      await act(async () => {
        await applyPromise!;
      });

      expect(result.current.isApplying).toBe(false);
    });
  });

  describe('セッション自動作成', () => {
    test('セッションが存在しない場合は自動で作成してからテンプレートを適用する', async () => {
      // セッションが存在しない保育園を設定
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: mockNurseryWithoutSession,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as any);

      // セッション作成後の状態をmock
      const nurseryAfterSessionCreation = {
        ...mockNurseryWithoutSession,
        visitSessions: [mockNursery.visitSessions[0]],
      };

      vi.mocked(useNurseryStore).getState = vi.fn().mockReturnValue({
        currentNursery: nurseryAfterSessionCreation,
      });

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(true);
      });

      // セッション作成が呼ばれたことを確認
      expect(mockCreateVisitSession).toHaveBeenCalledWith('nursery-1', {
        visitDate: expect.any(Date),
        status: 'planned',
        questions: [],
        insights: [],
      });

      // セッション作成後のデータでテンプレートが適用されたことを確認
      expect(mockApplyTemplateToNursery).toHaveBeenCalledWith(
        mockTemplate,
        nurseryAfterSessionCreation
      );
      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        visitSessions: mockUpdatedNursery.visitSessions,
      });
    });

    test('セッション作成後にgetStateで最新データを取得できない場合はfalseを返す', async () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: mockNurseryWithoutSession,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as any);

      // getStateでnullを返すことでセッション作成後のデータ取得失敗をシミュレート
      vi.mocked(useNurseryStore).getState = vi.fn().mockReturnValue({
        currentNursery: null,
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(false);
      });

      expect(mockCreateVisitSession).toHaveBeenCalled();
      expect(mockApplyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'セッション作成後の保育園データの取得に失敗しました（ID: nursery-1）',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('セッション作成でエラーが発生した場合はfalseを返す', async () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: mockNurseryWithoutSession,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as any);

      const sessionError = new Error('セッション作成エラー');
      mockCreateVisitSession.mockRejectedValue(sessionError);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(false);
      });

      expect(mockCreateVisitSession).toHaveBeenCalled();
      expect(mockApplyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '見学セッションの作成に失敗しました',
        sessionError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    test('保育園が見つからない場合はfalseを返す', async () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: null,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as any);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(false);
      });

      expect(mockApplyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '保育園（ID: nursery-1）が見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('保育園IDが異なる場合はfalseを返す', async () => {
      const differentNursery = { ...mockNursery, id: 'different-nursery' };

      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: differentNursery,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as any);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(false);
      });

      expect(mockApplyTemplateToNursery).not.toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '保育園（ID: nursery-1）が見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('テンプレートサービスでエラーが発生した場合はfalseを返す', async () => {
      const serviceError = new Error('テンプレートサービスエラー');
      mockApplyTemplateToNursery.mockImplementation(() => {
        throw serviceError;
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(false);
      });

      expect(mockApplyTemplateToNursery).toHaveBeenCalled();
      expect(mockUpdateNursery).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'テンプレート適用中にエラーが発生しました',
        serviceError
      );

      consoleErrorSpy.mockRestore();
    });

    test('保育園データ更新でエラーが発生した場合はfalseを返す', async () => {
      const updateError = new Error('更新エラー');
      mockUpdateNursery.mockRejectedValue(updateError);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(false);
      });

      expect(mockApplyTemplateToNursery).toHaveBeenCalled();
      expect(mockUpdateNursery).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'テンプレート適用中にエラーが発生しました',
        updateError
      );

      consoleErrorSpy.mockRestore();
    });

    test('エラー発生後もisApplyingがfalseに戻る', async () => {
      const serviceError = new Error('サービスエラー');
      mockApplyTemplateToNursery.mockImplementation(() => {
        throw serviceError;
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplateApplication());

      expect(result.current.isApplying).toBe(false);

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success).toBe(false);
      });

      // エラー発生後もisApplyingがfalseに戻ることを確認
      expect(result.current.isApplying).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('境界値・エッジケース', () => {
    test('空の質問リストを持つテンプレートでも正常に処理できる', async () => {
      // モックをリセットして正常な動作に戻す
      mockUpdateNursery.mockResolvedValue(undefined);
      const emptyTemplate: Template = {
        ...mockTemplate,
        questions: [],
      };

      const emptyResultNursery = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            questions: [], // 空の質問リスト
          },
        ],
      };

      mockApplyTemplateToNursery.mockReturnValue(emptyResultNursery);

      const { result } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success = await result.current.applyTemplate(
          'nursery-1',
          emptyTemplate
        );
        expect(success).toBe(true);
      });

      expect(mockApplyTemplateToNursery).toHaveBeenCalledWith(
        emptyTemplate,
        mockNursery
      );
      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        visitSessions: emptyResultNursery.visitSessions,
      });
    });

    test('複数回連続でテンプレートを適用できる', async () => {
      // モックをリセットして正常な動作に戻す
      mockUpdateNursery.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTemplateApplication());

      // 1回目の適用
      await act(async () => {
        const success1 = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success1).toBe(true);
      });

      // 2回目の適用
      await act(async () => {
        const success2 = await result.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success2).toBe(true);
      });

      expect(mockApplyTemplateToNursery).toHaveBeenCalledTimes(2);
      expect(mockUpdateNursery).toHaveBeenCalledTimes(2);
    });

    test('異なる保育園で連続適用できることを確認', async () => {
      // モックをリセットして正常な動作に戻す
      mockUpdateNursery.mockResolvedValue(undefined);

      // nursery-1での適用
      const { result: result1 } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success1 = await result1.current.applyTemplate(
          'nursery-1',
          mockTemplate
        );
        expect(success1).toBe(true);
      });

      // nursery-2用の新しい設定で新しいhookインスタンスを作成
      const nursery2 = { ...mockNursery, id: 'nursery-2' };
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: nursery2,
        updateNursery: mockUpdateNursery,
        createVisitSession: mockCreateVisitSession,
      } as any);

      const { result: result2 } = renderHook(() => useTemplateApplication());

      await act(async () => {
        const success2 = await result2.current.applyTemplate(
          'nursery-2',
          mockTemplate
        );
        expect(success2).toBe(true);
      });

      // 両方の保育園で適用されたことを確認
      expect(mockUpdateNursery).toHaveBeenCalledTimes(2);
      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        visitSessions: mockUpdatedNursery.visitSessions,
      });
      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-2', {
        visitSessions: mockUpdatedNursery.visitSessions,
      });
    });
  });
});
