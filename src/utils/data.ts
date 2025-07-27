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
export function createQuestion(
  input: CreateQuestionInput,
  orderIndex: number
): Question {
  const now = new Date();
  return {
    id: generateId(),
    text: input.text.trim(),
    answer: undefined,
    isAnswered: false,
    priority: input.priority || 'medium',
    category: input.category?.trim(),
    orderIndex,
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
 * 質問の順序を更新する
 */
export function reorderQuestions(
  questions: Question[],
  fromIndex: number,
  toIndex: number
): Question[] {
  const result = [...questions];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  // 順序番号を更新
  return result.map((question, index) => ({
    ...question,
    orderIndex: index,
  }));
}

/**
 * 回答済みの質問を下部に移動する
 */
export function sortQuestionsByAnswerStatus(questions: Question[]): Question[] {
  const unanswered = questions.filter((q) => !q.isAnswered);
  const answered = questions.filter((q) => q.isAnswered);

  const sortedQuestions = [...unanswered, ...answered];

  // 順序番号を更新
  return sortedQuestions.map((question, index) => ({
    ...question,
    orderIndex: index,
  }));
}

/**
 * 質問を優先度でソートする
 */
export function sortQuestionsByPriority(questions: Question[]): Question[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sorted = [...questions].sort((a, b) => {
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // 優先度が同じ場合は順序で比較
    return a.orderIndex - b.orderIndex;
  });

  // 順序番号を更新
  return sorted.map((question, index) => ({
    ...question,
    orderIndex: index,
  }));
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
 * 質問リストに質問を追加する
 */
export function addQuestionToList(
  questionList: QuestionList,
  questionInput: CreateQuestionInput
): QuestionList {
  const newQuestion = createQuestion(
    questionInput,
    questionList.questions.length
  );
  const updatedQuestions = [...questionList.questions, newQuestion];

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
  const updatedQuestions = questionList.questions
    .filter((q) => q.id !== questionId)
    .map((question, index) => ({
      ...question,
      orderIndex: index,
    }));

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
  const templateQuestions = template.questions.map((question, index) => ({
    ...question,
    id: generateId(),
    answer: undefined,
    isAnswered: false,
    orderIndex: index,
    answeredBy: undefined,
    answeredAt: undefined,
  }));

  return {
    ...baseList,
    questions: templateQuestions,
  };
}
