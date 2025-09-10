/**
 * useNurseryEdit フックのテスト
 * 保育園編集機能のインターフェースと動作を検証
 */

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useNurseryEdit } from './useNurseryEdit';
import type { Nursery } from '../types/entities';

// モック関数の作成
const mockUpdateNursery = vi.fn();

// showToastのモック
vi.mock('../utils/toaster', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// テスト用のモック保育園データ
const mockNursery: Nursery = {
  id: 'nursery-1',
  name: 'テスト保育園',
  visitSessions: [
    {
      id: 'session-1',
      visitDate: new Date('2025-12-31'),
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

describe('useNurseryEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      expect(result.current.isEditingNursery).toBe(false);
      expect(result.current.editingNurseryName).toBe('');
      expect(result.current.newVisitDate).toBe(null);
      expect(result.current.hasNameError).toBe(false);
      expect(result.current.hasChanges).toBe(false);
      expect(result.current.isSaveDisabled).toBe(true);
    });

    it('currentNurseryがnullの場合も正常に動作する', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(null, mockUpdateNursery)
      );

      expect(result.current.isEditingNursery).toBe(false);
      expect(result.current.hasChanges).toBe(false);
      expect(result.current.isSaveDisabled).toBe(true);
    });
  });

  describe('編集開始処理', () => {
    it('handleEditNurseryで編集状態に入る', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      expect(result.current.isEditingNursery).toBe(true);
      expect(result.current.editingNurseryName).toBe('テスト保育園');
      expect(result.current.newVisitDate).toEqual(new Date('2025-12-31'));
      expect(result.current.hasNameError).toBe(false);
    });

    it('見学日がnullの場合は空文字で初期化される', () => {
      const nurseryWithoutDate = {
        ...mockNursery,
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            visitDate: null,
          },
        ],
      };

      const { result } = renderHook(() =>
        useNurseryEdit(nurseryWithoutDate, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      expect(result.current.newVisitDate).toBe(null);
    });

    it('見学セッションが存在しない場合は空文字で初期化される', () => {
      const nurseryWithoutSession = {
        ...mockNursery,
        visitSessions: [],
      };

      const { result } = renderHook(() =>
        useNurseryEdit(nurseryWithoutSession, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      expect(result.current.newVisitDate).toBe(null);
    });
  });

  describe('保育園名変更処理', () => {
    it('handleNurseryNameChangeで名前が更新される', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('新しい保育園名');
      });

      expect(result.current.editingNurseryName).toBe('新しい保育園名');
      expect(result.current.hasNameError).toBe(false);
    });

    it('空文字を入力するとエラー状態になる', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('');
      });

      expect(result.current.hasNameError).toBe(true);
    });

    it('スペースのみの場合もエラー状態になる', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('   ');
      });

      expect(result.current.hasNameError).toBe(true);
    });
  });

  describe('変更検知', () => {
    it('保育園名が変更された場合hasChangesがtrueになる', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('変更された保育園名');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('見学日が変更された場合hasChangesがtrueになる', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.setNewVisitDate(new Date('2026-01-01'));
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('元の値に戻した場合hasChangesがfalseになる', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('変更された保育園名');
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.handleNurseryNameChange('テスト保育園');
      });

      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('保存ボタン状態', () => {
    it('名前が空の場合isSaveDisabledがtrue', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('');
      });

      expect(result.current.isSaveDisabled).toBe(true);
    });

    it('変更がない場合isSaveDisabledがtrue', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      expect(result.current.isSaveDisabled).toBe(true);
    });

    it('有効な変更がある場合isSaveDisabledがfalse', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('変更された保育園名');
      });

      expect(result.current.isSaveDisabled).toBe(false);
    });
  });

  describe('保存処理', () => {
    it('有効なデータで保存処理が実行される', async () => {
      mockUpdateNursery.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('新しい保育園名');
      });

      await act(async () => {
        await result.current.handleSaveNursery();
      });

      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        name: '新しい保育園名',
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            updatedAt: expect.any(Date),
          },
        ],
      });

      expect(result.current.isEditingNursery).toBe(false);
    });

    it('見学日が変更された場合、セッションも更新される', async () => {
      mockUpdateNursery.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.setNewVisitDate(new Date('2026-01-01'));
      });

      await act(async () => {
        await result.current.handleSaveNursery();
      });

      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        name: 'テスト保育園',
        visitSessions: [
          {
            ...mockNursery.visitSessions[0],
            visitDate: new Date('2026-01-01'),
            updatedAt: expect.any(Date),
          },
        ],
      });
    });

    it('見学セッションが存在しない場合、新しいセッションが作成される', async () => {
      const nurseryWithoutSession = {
        ...mockNursery,
        visitSessions: [],
      };

      mockUpdateNursery.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useNurseryEdit(nurseryWithoutSession, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.setNewVisitDate(new Date('2026-01-01'));
      });

      await act(async () => {
        await result.current.handleSaveNursery();
      });

      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        name: 'テスト保育園',
        visitSessions: [
          expect.objectContaining({
            visitDate: new Date('2026-01-01'),
            status: 'planned',
            questions: [],
          }),
        ],
      });
    });

    it('保育園名が空の場合エラーが表示される', async () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('');
      });

      await act(async () => {
        await result.current.handleSaveNursery();
      });

      expect(mockUpdateNursery).not.toHaveBeenCalled();
    });

    it('保育園名が100文字を超える場合エラーが表示される', async () => {
      const longName = 'a'.repeat(101);
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange(longName);
      });

      await act(async () => {
        await result.current.handleSaveNursery();
      });

      expect(mockUpdateNursery).not.toHaveBeenCalled();
    });

    it('無効な日付の場合エラーが表示される', async () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.setNewVisitDate(new Date('invalid-date'));
      });

      await act(async () => {
        await result.current.handleSaveNursery();
      });

      expect(mockUpdateNursery).not.toHaveBeenCalled();
    });
  });

  it('質問がある保育園の名前のみを編集しても質問リストが保持される', async () => {
    // 質問を含む保育園データ
    const nurseryWithQuestions = {
      ...mockNursery,
      visitSessions: [
        {
          ...mockNursery.visitSessions[0],
          questions: [
            {
              id: 'question-1',
              text: '園庭はありますか？',
              answer: 'はい、あります',
              isAnswered: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'question-2',
              text: '給食について教えてください',
              answer: '',
              isAnswered: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    };

    mockUpdateNursery.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useNurseryEdit(nurseryWithQuestions, mockUpdateNursery)
    );

    // 編集開始
    act(() => {
      result.current.handleEditNursery();
    });

    // 保育園名のみを変更（見学日は変更しない）
    act(() => {
      result.current.handleNurseryNameChange('変更された保育園名');
    });

    // 保存
    await act(async () => {
      await result.current.handleSaveNursery();
    });

    // 質問リストが保持されていることを確認
    expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
      name: '変更された保育園名',
      visitSessions: [
        {
          ...nurseryWithQuestions.visitSessions[0],
          updatedAt: expect.any(Date),
        },
      ],
    });

    // 質問が保持されていることを確認
    const calledWith = mockUpdateNursery.mock.calls[0][1];
    expect(calledWith.visitSessions[0].questions).toHaveLength(2);
    expect(calledWith.visitSessions[0].questions[0].text).toBe(
      '園庭はありますか？'
    );
    expect(calledWith.visitSessions[0].questions[1].text).toBe(
      '給食について教えてください'
    );
  });

  it('見学日がnullの保育園の名前のみを編集してもセッションが保持される', async () => {
    // 見学日なしの保育園データ（但し、質問は存在）
    const nurseryWithoutDate = {
      ...mockNursery,
      visitSessions: [
        {
          ...mockNursery.visitSessions[0],
          visitDate: null,
          questions: [
            {
              id: 'question-1',
              text: '園の方針について教えてください',
              answer: '子供の自主性を重視しています',
              isAnswered: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    };

    mockUpdateNursery.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useNurseryEdit(nurseryWithoutDate, mockUpdateNursery)
    );

    // 編集開始
    act(() => {
      result.current.handleEditNursery();
    });

    // 保育園名のみを変更
    act(() => {
      result.current.handleNurseryNameChange('更新された保育園名');
    });

    // 保存
    await act(async () => {
      await result.current.handleSaveNursery();
    });

    // セッションと質問が保持されていることを確認
    expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
      name: '更新された保育園名',
      visitSessions: [
        {
          ...nurseryWithoutDate.visitSessions[0],
          updatedAt: expect.any(Date),
        },
      ],
    });

    const calledWith = mockUpdateNursery.mock.calls[0][1];
    expect(calledWith.visitSessions).toHaveLength(1);
    expect(calledWith.visitSessions[0].questions).toHaveLength(1);
    expect(calledWith.visitSessions[0].questions[0].text).toBe(
      '園の方針について教えてください'
    );
  });

  it('見学日を明示的に削除した場合、visitDateがnullに更新される', async () => {
    // 見学日ありの保育園データ
    const nurseryWithDate = {
      ...mockNursery,
      visitSessions: [
        {
          ...mockNursery.visitSessions[0],
          visitDate: new Date('2025-12-31'),
          questions: [
            {
              id: 'question-1',
              text: '園の雰囲気はどうですか？',
              answer: 'とても良い雰囲気です',
              isAnswered: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    };

    mockUpdateNursery.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useNurseryEdit(nurseryWithDate, mockUpdateNursery)
    );

    // 編集開始
    act(() => {
      result.current.handleEditNursery();
    });

    // 見学日を削除（nullに設定）
    act(() => {
      result.current.setNewVisitDate(null);
    });

    // 保存
    await act(async () => {
      await result.current.handleSaveNursery();
    });

    // セッションは保持され、visitDateがnullに更新されることを確認
    expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
      name: 'テスト保育園',
      visitSessions: [
        {
          ...nurseryWithDate.visitSessions[0],
          visitDate: null,
          updatedAt: expect.any(Date),
        },
      ],
    });

    // 質問が保持されていることを確認
    const calledWith = mockUpdateNursery.mock.calls[0][1];
    expect(calledWith.visitSessions).toHaveLength(1);
    expect(calledWith.visitSessions[0].questions).toHaveLength(1);
    expect(calledWith.visitSessions[0].questions[0].text).toBe(
      '園の雰囲気はどうですか？'
    );
    expect(calledWith.visitSessions[0].visitDate).toBe(null);
  });

  it('見学日を削除してから保育園名も変更した場合、両方の変更が反映される', async () => {
    // 見学日ありの保育園データ
    const nurseryWithDate = {
      ...mockNursery,
      visitSessions: [
        {
          ...mockNursery.visitSessions[0],
          visitDate: new Date('2025-12-31'),
          questions: [
            {
              id: 'question-1',
              text: '保育料について教えてください',
              answer: '',
              isAnswered: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    };

    mockUpdateNursery.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useNurseryEdit(nurseryWithDate, mockUpdateNursery)
    );

    // 編集開始
    act(() => {
      result.current.handleEditNursery();
    });

    // 見学日を削除し、保育園名も変更
    act(() => {
      result.current.setNewVisitDate(null);
      result.current.handleNurseryNameChange('変更された保育園名');
    });

    // 保存
    await act(async () => {
      await result.current.handleSaveNursery();
    });

    // 保育園名の変更とvisitDateのnull更新が反映されることを確認
    expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
      name: '変更された保育園名',
      visitSessions: [
        {
          ...nurseryWithDate.visitSessions[0],
          visitDate: null,
          updatedAt: expect.any(Date),
        },
      ],
    });

    // 質問が保持されていることを確認
    const calledWith = mockUpdateNursery.mock.calls[0][1];
    expect(calledWith.visitSessions[0].questions).toHaveLength(1);
    expect(calledWith.visitSessions[0].visitDate).toBe(null);
  });

  describe('キャンセル処理', () => {
    it('handleCancelEditNurseryで編集状態がリセットされる', () => {
      const { result } = renderHook(() =>
        useNurseryEdit(mockNursery, mockUpdateNursery)
      );

      act(() => {
        result.current.handleEditNursery();
      });

      act(() => {
        result.current.handleNurseryNameChange('変更された名前');
      });

      act(() => {
        result.current.setNewVisitDate(new Date('2026-01-01'));
      });

      act(() => {
        result.current.handleCancelEditNursery();
      });

      expect(result.current.isEditingNursery).toBe(false);
      expect(result.current.editingNurseryName).toBe('');
      expect(result.current.newVisitDate).toBe(null);
      expect(result.current.hasNameError).toBe(false);
    });
  });
});
