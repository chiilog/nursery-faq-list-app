/**
 * 質問編集状態を統合管理するカスタムフック
 */

import { useState, useCallback } from 'react';

interface QuestionEditState {
  questionId: string | null;
  answer: string;
  questionText: string;
}

const initialState: QuestionEditState = {
  questionId: null,
  answer: '',
  questionText: '',
};

export const useQuestionEditor = () => {
  const [editState, setEditState] = useState<QuestionEditState>(initialState);

  const startEdit = useCallback(
    (questionId: string, currentAnswer: string, questionText: string) => {
      setEditState({
        questionId,
        answer: currentAnswer,
        questionText,
      });
    },
    []
  );

  const updateAnswer = useCallback((answer: string) => {
    setEditState((prev) => ({ ...prev, answer }));
  }, []);

  const updateQuestionText = useCallback((questionText: string) => {
    setEditState((prev) => ({ ...prev, questionText }));
  }, []);

  const resetEdit = useCallback(() => {
    setEditState(initialState);
  }, []);

  return {
    editState,
    isEditing: editState.questionId !== null,
    startEdit,
    updateAnswer,
    updateQuestionText,
    resetEdit,
  };
};
