/**
 * 質問追加フォーム状態を統合管理するカスタムフック
 */

import { useState, useCallback } from 'react';

interface QuestionFormState {
  isAdding: boolean;
  questionText: string;
  answerText: string;
}

const initialState: QuestionFormState = {
  isAdding: false,
  questionText: '',
  answerText: '',
};

export const useQuestionForm = () => {
  const [formState, setFormState] = useState<QuestionFormState>(initialState);

  const startAdding = useCallback(() => {
    setFormState((prev) => ({ ...prev, isAdding: true }));
  }, []);

  const updateQuestionText = useCallback((questionText: string) => {
    setFormState((prev) => ({ ...prev, questionText }));
  }, []);

  const updateAnswerText = useCallback((answerText: string) => {
    setFormState((prev) => ({ ...prev, answerText }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, []);

  const cancelAdding = useCallback(() => {
    setFormState(initialState);
  }, []);

  const isValid = formState.questionText.trim() !== '';

  return {
    formState,
    isValid,
    startAdding,
    updateQuestionText,
    updateAnswerText,
    resetForm,
    cancelAdding,
  };
};
