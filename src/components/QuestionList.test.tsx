import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { QuestionList } from './QuestionList';
import { renderWithProviders, testUtils } from '../test/test-utils';
import type { Question } from '../types';

// テスト用のモックデータ
const mockQuestions: Question[] = [
  testUtils.createMockQuestion({
    id: '1',
    text: '保育時間は何時から何時までですか？',
    answer: '',
    isAnswered: false,
    category: '基本情報',
  }),
  testUtils.createMockQuestion({
    id: '2',
    text: '給食はありますか？アレルギー対応は？',
    answer: '完全給食、アレルギー個別対応可能',
    isAnswered: true,
    category: '食事',
    answeredAt: new Date('2024-01-15T10:00:00'),
  }),
];

// デフォルトのprops
const defaultProps = {
  questions: mockQuestions,
  editingQuestionId: null,
  editingQuestionText: '',
  editingAnswer: '',
  onQuestionClick: vi.fn(),
  onEditingQuestionTextChange: vi.fn(),
  onEditingAnswerChange: vi.fn(),
  onSaveAnswer: vi.fn(),
  onCancelEdit: vi.fn(),
};

describe('QuestionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('質問の表示', () => {
    test('すべての質問が表示される', () => {
      renderWithProviders(<QuestionList {...defaultProps} />);

      mockQuestions.forEach((question) => {
        expect(screen.getByText(question.text)).toBeInTheDocument();
      });
    });

    test('回答済みの質問には回答が表示される', () => {
      renderWithProviders(<QuestionList {...defaultProps} />);

      expect(
        screen.getByText('完全給食、アレルギー個別対応可能')
      ).toBeInTheDocument();
    });

    test('質問がない場合は適切なメッセージが表示される', () => {
      renderWithProviders(<QuestionList {...defaultProps} questions={[]} />);

      expect(screen.getByText(/質問がありません/)).toBeInTheDocument();
    });
  });

  describe('質問クリック', () => {
    test('質問をクリックすると onQuestionClick が呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionList {...defaultProps} />);

      const firstQuestion = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });
      await user.click(firstQuestion);

      expect(defaultProps.onQuestionClick).toHaveBeenCalledWith(
        '1',
        '',
        '保育時間は何時から何時までですか？'
      );
    });
  });

  describe('編集モード', () => {
    test('編集中の質問には編集フォームが表示される', () => {
      const editingProps = {
        ...defaultProps,
        editingQuestionId: '1',
        editingQuestionText: '編集中の質問文',
        editingAnswer: '編集中の回答',
      };

      renderWithProviders(<QuestionList {...editingProps} />);

      expect(screen.getByDisplayValue('編集中の質問文')).toBeInTheDocument();
      expect(screen.getByDisplayValue('編集中の回答')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /キャンセル/ })
      ).toBeInTheDocument();
    });

    test('保存ボタンをクリックすると onSaveAnswer が呼ばれる', async () => {
      const user = userEvent.setup();
      const editingProps = {
        ...defaultProps,
        editingQuestionId: '1',
        editingQuestionText: '編集中の質問文',
        editingAnswer: '編集中の回答',
      };

      renderWithProviders(<QuestionList {...editingProps} />);

      const saveButton = screen.getByRole('button', { name: /保存/ });
      await user.click(saveButton);

      expect(defaultProps.onSaveAnswer).toHaveBeenCalled();
    });

    test('キャンセルボタンをクリックすると onCancelEdit が呼ばれる', async () => {
      const user = userEvent.setup();
      const editingProps = {
        ...defaultProps,
        editingQuestionId: '1',
        editingQuestionText: '編集中の質問文',
        editingAnswer: '編集中の回答',
      };

      renderWithProviders(<QuestionList {...editingProps} />);

      const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
      await user.click(cancelButton);

      expect(defaultProps.onCancelEdit).toHaveBeenCalled();
    });
  });
});
