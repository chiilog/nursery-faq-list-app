/**
 * データユーティリティ関数
 * データ操作のヘルパー関数
 */

import type {
  Question,
  QuestionList,
  CreateQuestionInput,
  CreateQuestionListInput,
} from '../types/data';

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
    category: input.category?.trim(),
    answeredBy: undefined,
    answeredAt: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 新しい質問リストオブジェクトを作成する
 */
export function createQuestionList(
  input: CreateQuestionListInput
): QuestionList {
  const now = new Date();

  return {
    id: generateId(),
    title: input.title.trim(),
    nurseryName: input.nurseryName?.trim(),
    visitDate: input.visitDate,
    questions: [],
    sharedWith: [],
    createdAt: now,
    updatedAt: now,
    isTemplate: input.isTemplate || false,
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
 * 質問リストの更新日時を現在時刻に設定する
 */
export function updateQuestionListTimestamp(
  questionList: QuestionList
): QuestionList {
  return {
    ...questionList,
    updatedAt: new Date(),
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

/**
 * 質問リストに質問を追加する
 */
export function addQuestionToList(
  questionList: QuestionList,
  questionInput: CreateQuestionInput
): QuestionList {
  const newQuestion = createQuestion(questionInput);

  // 共通関数を使用して質問配列を更新
  const updatedQuestions = addQuestionToQuestionsArray(
    questionList.questions,
    newQuestion
  );

  return updateQuestionListTimestamp({
    ...questionList,
    questions: updatedQuestions,
  });
}

/**
 * 質問リストから質問を削除する
 */
export function removeQuestionFromList(
  questionList: QuestionList,
  questionId: string
): QuestionList {
  const updatedQuestions = questionList.questions.filter(
    (q) => q.id !== questionId
  );

  return updateQuestionListTimestamp({
    ...questionList,
    questions: updatedQuestions,
  });
}

/**
 * 質問リスト内の質問を更新する
 */
export function updateQuestionInList(
  questionList: QuestionList,
  questionId: string,
  updatedQuestion: Question
): QuestionList {
  const updatedQuestions = questionList.questions.map((question) =>
    question.id === questionId ? updatedQuestion : question
  );

  return updateQuestionListTimestamp({
    ...questionList,
    questions: updatedQuestions,
  });
}

/**
 * 質問リストの統計情報を取得する
 */
export function getQuestionListStats(questionList: QuestionList) {
  const total = questionList.questions.length;
  const answered = questionList.questions.filter((q) => q.isAnswered).length;
  const unanswered = total - answered;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  return {
    total,
    answered,
    unanswered,
    progress,
  };
}

/**
 * 質問リストをテンプレートから作成する
 */
export function createQuestionListFromTemplate(
  template: QuestionList,
  customizations: CreateQuestionListInput
): QuestionList {
  const baseList = createQuestionList(customizations);

  // テンプレートの質問をコピー（回答は除く）
  const templateQuestions = template.questions.map((question) => ({
    ...question,
    id: generateId(),
    answer: undefined,
    isAnswered: false,
    answeredBy: undefined,
    answeredAt: undefined,
  }));

  return {
    ...baseList,
    questions: templateQuestions,
  };
}
