/**
 * テスト用のモックデータ定義
 */

import { vi } from 'vitest';
import type { QuestionList, Question } from '../types/data';

// モック質問データ
export const mockQuestion: Question = {
  id: 'q1',
  text: '保育時間を教えてください',
  answer: '7:00-19:00',
  category: '基本情報',
  isAnswered: true,
  priority: 'medium',
  order: 1,
};

// モック質問リストデータ
export const mockQuestionList: QuestionList = {
  id: 'list1',
  title: 'テスト保育園見学リスト',
  nurseryName: 'テスト保育園',
  questions: [
    mockQuestion,
    {
      id: 'q2',
      text: '給食はありますか？',
      answer: '',
      category: '食事',
      isAnswered: false,
      priority: 'medium',
      order: 2,
    },
  ],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  isTemplate: false,
};

// モックテンプレートデータ（QuestionListでisTemplate: trueのもの）
export const mockTemplate: QuestionList = {
  id: 'template-1',
  title: '基本テンプレート',
  questions: [
    {
      id: 'tq1',
      text: '保育時間を教えてください',
      category: '基本情報',
      isAnswered: false,
      priority: 'medium',
      order: 1,
    },
    {
      id: 'tq2',
      text: '費用はいくらですか？',
      category: '費用',
      isAnswered: false,
      priority: 'medium',
      order: 2,
    },
  ],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  isTemplate: true,
};

// モックエラーハンドラー
export const mockErrorHandler = {
  handleError: vi.fn(),
  handleAsyncOperation: vi.fn(),
  showError: vi.fn(),
  clearError: vi.fn(),
  error: null,
};
