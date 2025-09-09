/**
 * useQuestionForm カスタムフックのテスト
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useQuestionForm } from './useQuestionForm';

describe('useQuestionForm', () => {
  test('初期状態は質問と回答が空で無効', () => {
    const { result } = renderHook(() => useQuestionForm());

    expect(result.current.formState.questionText).toBe('');
    expect(result.current.formState.answerText).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  test('updateQuestionTextで質問テキストが更新される', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('新しい質問');
    });

    expect(result.current.formState.questionText).toBe('新しい質問');
    expect(result.current.formState.answerText).toBe('');
    expect(result.current.isValid).toBe(true);
  });

  test('updateAnswerTextで回答テキストが更新される', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateAnswerText('新しい回答');
    });

    expect(result.current.formState.questionText).toBe('');
    expect(result.current.formState.answerText).toBe('新しい回答');
    expect(result.current.isValid).toBe(false); // 質問が空なので無効
  });

  test('質問テキストと回答テキストの両方が設定される', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('質問');
      result.current.updateAnswerText('回答');
    });

    expect(result.current.formState.questionText).toBe('質問');
    expect(result.current.formState.answerText).toBe('回答');
    expect(result.current.isValid).toBe(true);
  });

  test('質問テキストが空白のみの場合は無効', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('   ');
    });

    expect(result.current.formState.questionText).toBe('   ');
    expect(result.current.isValid).toBe(false);
  });

  test('resetFormで全ての値がリセットされる', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('質問');
      result.current.updateAnswerText('回答');
    });

    expect(result.current.formState.questionText).toBe('質問');
    expect(result.current.formState.answerText).toBe('回答');
    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formState.questionText).toBe('');
    expect(result.current.formState.answerText).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  test('質問テキストのみでフォームが有効になる', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('質問のみ');
    });

    expect(result.current.formState.questionText).toBe('質問のみ');
    expect(result.current.formState.answerText).toBe('');
    expect(result.current.isValid).toBe(true);
  });
});
