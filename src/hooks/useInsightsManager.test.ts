/**
 * useInsightsManager カスタムフックのテスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInsightsManager } from './useInsightsManager';

describe('useInsightsManager', () => {
  const mockOnInsightsChange = vi.fn();
  const mockInsights = ['既存タグ1', '既存タグ2'];

  beforeEach(() => {
    mockOnInsightsChange.mockClear();
  });

  describe('初期状態', () => {
    test('inputValueが空文字で初期化される', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      expect(result.current.inputValue).toBe('');
    });

    test('isAddDisabledがtrueで初期化される（空文字のため）', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      expect(result.current.isAddDisabled).toBe(true);
    });

    test('読み取り専用モードでisAddDisabledがtrueになる', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange, true)
      );

      expect(result.current.isAddDisabled).toBe(true);
    });
  });

  describe('入力値管理', () => {
    test('setInputValueで入力値が更新される', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('新しい入力値');
      });

      expect(result.current.inputValue).toBe('新しい入力値');
    });

    test('入力値がある場合isAddDisabledがfalseになる', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('新しい入力値');
      });

      expect(result.current.isAddDisabled).toBe(false);
    });

    test('空白文字のみの場合isAddDisabledがtrueのまま', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('   ');
      });

      expect(result.current.isAddDisabled).toBe(true);
    });
  });

  describe('タグ追加機能', () => {
    test('addInsightで新しいタグが追加される', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('新しいタグ');
      });

      act(() => {
        result.current.addInsight();
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith([
        ...mockInsights,
        '新しいタグ',
      ]);
    });

    test('addInsight後に入力値がクリアされる', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('新しいタグ');
      });

      act(() => {
        result.current.addInsight();
      });

      expect(result.current.inputValue).toBe('');
    });

    test('空文字の場合addInsightが何もしない', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.addInsight();
      });

      expect(mockOnInsightsChange).not.toHaveBeenCalled();
    });

    test('空白文字のみの場合addInsightが何もしない', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('   ');
        result.current.addInsight();
      });

      expect(mockOnInsightsChange).not.toHaveBeenCalled();
    });

    test('前後の空白がトリムされて追加される', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('  新しいタグ  ');
      });

      act(() => {
        result.current.addInsight();
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith([
        ...mockInsights,
        '新しいタグ',
      ]);
    });
  });

  describe('タグ削除機能', () => {
    test('removeInsightで指定したインデックスのタグが削除される', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.removeInsight(1);
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith(['既存タグ1']);
    });

    test('最初のタグを削除', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.removeInsight(0);
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith(['既存タグ2']);
    });

    test('存在しないインデックスでも安全に処理される', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.removeInsight(10);
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith(mockInsights);
    });

    test('単一のタグを削除すると空配列になる', () => {
      const singleInsight = ['単一タグ'];
      const { result } = renderHook(() =>
        useInsightsManager(singleInsight, mockOnInsightsChange)
      );

      act(() => {
        result.current.removeInsight(0);
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('キーボード操作', () => {
    test('Enterキーでタグが追加される', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.setInputValue('新しいタグ');
      });

      act(() => {
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: vi.fn(),
        } as any);
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith([
        ...mockInsights,
        '新しいタグ',
      ]);
    });

    test('EnterキーでpreventDefaultが呼ばれる', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      const mockPreventDefault = vi.fn();

      act(() => {
        result.current.setInputValue('新しいタグ');
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: mockPreventDefault,
        } as any);
      });

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    test('Enter以外のキーでは何もしない', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      const mockPreventDefault = vi.fn();

      act(() => {
        result.current.setInputValue('新しいタグ');
        result.current.handleKeyDown({
          key: 'Tab',
          preventDefault: mockPreventDefault,
        } as any);
      });

      expect(mockOnInsightsChange).not.toHaveBeenCalled();
      expect(mockPreventDefault).not.toHaveBeenCalled();
    });

    test('Enterキーで空文字の場合は追加されない', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange)
      );

      act(() => {
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: vi.fn(),
        } as any);
      });

      expect(mockOnInsightsChange).not.toHaveBeenCalled();
    });
  });

  describe('メモ化動作', () => {
    test('同じpropsで再計算されない', () => {
      const { result, rerender } = renderHook(
        ({ insights, onChange, readonly }) =>
          useInsightsManager(insights, onChange, readonly),
        {
          initialProps: {
            insights: mockInsights,
            onChange: mockOnInsightsChange,
            readonly: false,
          },
        }
      );

      const firstRemoveInsight = result.current.removeInsight;
      const firstHandleKeyDown = result.current.handleKeyDown;

      // 同じpropsで再レンダリング
      rerender({
        insights: mockInsights,
        onChange: mockOnInsightsChange,
        readonly: false,
      });

      // 関数の参照が同じことを確認（メモ化されている）
      expect(result.current.removeInsight).toBe(firstRemoveInsight);
      expect(result.current.handleKeyDown).toBe(firstHandleKeyDown);
    });

    test('insightsが変更されるとremoveInsightが再作成される', () => {
      const { result, rerender } = renderHook(
        ({ insights, onChange, readonly }) =>
          useInsightsManager(insights, onChange, readonly),
        {
          initialProps: {
            insights: mockInsights,
            onChange: mockOnInsightsChange,
            readonly: false,
          },
        }
      );

      const firstRemoveInsight = result.current.removeInsight;

      // insightsを変更して再レンダリング
      rerender({
        insights: ['新しいタグ'],
        onChange: mockOnInsightsChange,
        readonly: false,
      });

      // removeInsight関数が再作成される
      expect(result.current.removeInsight).not.toBe(firstRemoveInsight);
    });
  });

  describe('読み取り専用モード', () => {
    test('読み取り専用モードでisAddDisabledがtrue', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange, true)
      );

      act(() => {
        result.current.setInputValue('新しいタグ');
      });

      expect(result.current.isAddDisabled).toBe(true);
    });

    test('読み取り専用モードでもremoveInsightは動作する', () => {
      const { result } = renderHook(() =>
        useInsightsManager(mockInsights, mockOnInsightsChange, true)
      );

      act(() => {
        result.current.removeInsight(0);
      });

      expect(mockOnInsightsChange).toHaveBeenCalledWith(['既存タグ2']);
    });
  });
});
