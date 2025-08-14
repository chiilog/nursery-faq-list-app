/**
 * useQuestionForm カスタムフックのテスト
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useQuestionForm } from './useQuestionForm';

describe('useQuestionForm', () => {
  test('初期状態は追加モードではない', () => {
    const { result } = renderHook(() => useQuestionForm());

    expect(result.current.formState.isAdding).toBe(false);
    expect(result.current.formState.questionText).toBe('');
    expect(result.current.formState.answerText).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  test('startAddingで追加モードに移行する', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.startAdding();
    });

    expect(result.current.formState.isAdding).toBe(true);
    expect(result.current.formState.questionText).toBe('');
    expect(result.current.formState.answerText).toBe('');
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
    expect(result.current.isValid).toBe(false); // 質問が空なのでinvalid
  });

  test('質問テキストが空文字の場合はinvalid', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('');
      result.current.updateAnswerText('回答がある');
    });

    expect(result.current.isValid).toBe(false);
  });

  test('質問テキストが空白のみの場合はinvalid', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('   ');
      result.current.updateAnswerText('回答がある');
    });

    expect(result.current.isValid).toBe(false);
  });

  test('質問テキストがある場合はvalid（回答は任意）', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('質問がある');
    });

    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.updateAnswerText('回答も追加');
    });

    expect(result.current.isValid).toBe(true);
  });

  test('resetFormで初期状態に戻る', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.startAdding();
      result.current.updateQuestionText('質問');
      result.current.updateAnswerText('回答');
    });

    expect(result.current.formState.isAdding).toBe(true);
    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formState.isAdding).toBe(false);
    expect(result.current.formState.questionText).toBe('');
    expect(result.current.formState.answerText).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  test('cancelAddingで初期状態に戻る', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.startAdding();
      result.current.updateQuestionText('質問');
      result.current.updateAnswerText('回答');
    });

    act(() => {
      result.current.cancelAdding();
    });

    expect(result.current.formState.isAdding).toBe(false);
    expect(result.current.formState.questionText).toBe('');
    expect(result.current.formState.answerText).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  test('複数回の更新が正しく動作する', () => {
    const { result } = renderHook(() => useQuestionForm());

    act(() => {
      result.current.updateQuestionText('質問1');
    });

    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.updateQuestionText('質問2');
      result.current.updateAnswerText('回答1');
    });

    expect(result.current.formState.questionText).toBe('質問2');
    expect(result.current.formState.answerText).toBe('回答1');
    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.updateAnswerText('回答2');
    });

    expect(result.current.formState.questionText).toBe('質問2');
    expect(result.current.formState.answerText).toBe('回答2');
    expect(result.current.isValid).toBe(true);
  });
});
