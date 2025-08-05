/**
 * データユーティリティ関数
 * データ操作のヘルパー関数
 */

import type { Question, CreateQuestionInput } from '../types/data';

/**
 * UUIDv4を生成する
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 新しい質問オブジェクトを作成する
 */
export function createQuestion(input: CreateQuestionInput): Question {
  const now = new Date();
  return {
    id: generateId(),
    text: input.text.trim(),
    answer: undefined,
    isAnswered: false,
    answeredBy: undefined,
    answeredAt: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 質問に回答を設定する
 */
export function answerQuestion(
  question: Question,
  answer: string,
  answeredBy?: string
): Question {
  const now = new Date();

  return {
    ...question,
    answer: answer.trim(),
    isAnswered: answer.trim().length > 0,
    answeredBy,
    answeredAt: answer.trim().length > 0 ? now : undefined,
  };
}

/**
 * 質問配列に新しい質問を先頭に追加する
 */
export function addQuestionToQuestionsArray(
  existingQuestions: Question[],
  newQuestion: Question
): Question[] {
  // 配列の先頭に追加
  return [newQuestion, ...existingQuestions];
}
