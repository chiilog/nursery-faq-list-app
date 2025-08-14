/**
 * useQuestionEditor カスタムフックのテスト
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useQuestionEditor } from './useQuestionEditor';

describe('useQuestionEditor', () => {
  test('初期状態は編集モードではない', () => {
    const { result } = renderHook(() => useQuestionEditor());

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editState.questionId).toBeNull();
    expect(result.current.editState.answer).toBe('');
    expect(result.current.editState.questionText).toBe('');
  });

  test('startEditで編集モードに移行する', () => {
    const { result } = renderHook(() => useQuestionEditor());

    act(() => {
      result.current.startEdit('test-id', '既存の回答', '既存の質問');
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.editState.questionId).toBe('test-id');
    expect(result.current.editState.answer).toBe('既存の回答');
    expect(result.current.editState.questionText).toBe('既存の質問');
  });

  test('updateAnswerで回答のみ更新される', () => {
    const { result } = renderHook(() => useQuestionEditor());

    act(() => {
      result.current.startEdit('test-id', '既存の回答', '既存の質問');
    });

    act(() => {
      result.current.updateAnswer('新しい回答');
    });

    expect(result.current.editState.questionId).toBe('test-id');
    expect(result.current.editState.answer).toBe('新しい回答');
    expect(result.current.editState.questionText).toBe('既存の質問');
  });

  test('updateQuestionTextで質問テキストのみ更新される', () => {
    const { result } = renderHook(() => useQuestionEditor());

    act(() => {
      result.current.startEdit('test-id', '既存の回答', '既存の質問');
    });

    act(() => {
      result.current.updateQuestionText('新しい質問');
    });

    expect(result.current.editState.questionId).toBe('test-id');
    expect(result.current.editState.answer).toBe('既存の回答');
    expect(result.current.editState.questionText).toBe('新しい質問');
  });

  test('resetEditで初期状態に戻る', () => {
    const { result } = renderHook(() => useQuestionEditor());

    act(() => {
      result.current.startEdit('test-id', '既存の回答', '既存の質問');
    });

    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.resetEdit();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editState.questionId).toBeNull();
    expect(result.current.editState.answer).toBe('');
    expect(result.current.editState.questionText).toBe('');
  });

  test('編集状態での複数回のupdateが正しく動作する', () => {
    const { result } = renderHook(() => useQuestionEditor());

    act(() => {
      result.current.startEdit('test-id', '', '');
    });

    act(() => {
      result.current.updateAnswer('回答1');
    });

    act(() => {
      result.current.updateQuestionText('質問1');
    });

    act(() => {
      result.current.updateAnswer('回答2');
    });

    expect(result.current.editState.answer).toBe('回答2');
    expect(result.current.editState.questionText).toBe('質問1');
    expect(result.current.editState.questionId).toBe('test-id');
  });
});
