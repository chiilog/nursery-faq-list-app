/**
 * テスト用のモックデータ定義
 */

import { vi } from 'vitest';
import { createQuestionMock } from './test-utils';

// モック質問データ
export const mockQuestion = createQuestionMock({
  id: 'q1',
  text: '保育時間を教えてください',
  answer: '7:00-19:00',
  category: '基本情報',
  isAnswered: true,
});

// モックエラーハンドラー
export const mockErrorHandler = {
  handleError: vi.fn(),
  handleAsyncOperation: vi.fn(),
  showError: vi.fn(),
  clearError: vi.fn(),
  error: null,
};
