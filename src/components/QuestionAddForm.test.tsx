/**
 * 質問追加フォームコンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import { QuestionAddForm } from './QuestionAddForm';

describe('QuestionAddForm', () => {
  const defaultProps = {
    newQuestionText: '',
    newAnswerText: '',
    onNewQuestionTextChange: vi.fn<(value: string) => void>(),
    onNewAnswerTextChange: vi.fn<(value: string) => void>(),
    onAddQuestion: vi.fn<() => void>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('フォーム表示', () => {
    test('質問入力フィールドが表示される', () => {
      renderWithProviders(<QuestionAddForm {...defaultProps} />);

      const input = screen.getByLabelText('質問入力');
      expect(input).toBeInTheDocument();
    });

    test('回答入力フィールドが表示される', () => {
      renderWithProviders(<QuestionAddForm {...defaultProps} />);

      const textarea = screen.getByLabelText('回答入力（任意）');
      expect(textarea).toBeInTheDocument();
    });

    test('追加ボタンとキャンセルボタンが表示される', () => {
      renderWithProviders(<QuestionAddForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'キャンセル' })
      ).toBeInTheDocument();
    });

    test('質問を入力するとonNewQuestionTextChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          onNewQuestionTextChange={mockOnChange}
        />
      );

      const input = screen.getByLabelText('質問入力');
      await user.type(input, 'テスト');

      // onChangeが呼ばれることを確認（userEvent.typeは文字ごとにonChangeを呼び出す）
      expect(mockOnChange).toHaveBeenCalled();
      // 複数回呼び出されることを確認（具体的な回数は問わない）
      expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);
    });

    test('回答を入力するとonNewAnswerTextChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnAnswerChange = vi.fn();

      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          onNewAnswerTextChange={mockOnAnswerChange}
        />
      );

      const textarea = screen.getByLabelText('回答入力（任意）');
      await user.type(textarea, '回答テスト');

      expect(mockOnAnswerChange).toHaveBeenCalled();
      expect(mockOnAnswerChange.mock.calls.length).toBeGreaterThan(0);
    });

    test('追加ボタンをクリックするとonAddQuestionが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnAddQuestion = vi.fn();

      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          newQuestionText="延長保育はありますか？"
          onAddQuestion={mockOnAddQuestion}
        />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      await user.click(addButton);

      expect(mockOnAddQuestion).toHaveBeenCalled();
    });

    test('キャンセルボタンをクリックすると入力値がクリアされる', async () => {
      const user = userEvent.setup();
      const mockOnQuestionChange = vi.fn();
      const mockOnAnswerChange = vi.fn();

      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          newQuestionText="テスト質問"
          newAnswerText="テスト回答"
          onNewQuestionTextChange={mockOnQuestionChange}
          onNewAnswerTextChange={mockOnAnswerChange}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(mockOnQuestionChange).toHaveBeenCalledWith('');
      expect(mockOnAnswerChange).toHaveBeenCalledWith('');
    });

    test('質問が空の場合、追加ボタンが無効化される', () => {
      renderWithProviders(
        <QuestionAddForm {...defaultProps} newQuestionText="" />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).toBeDisabled();
    });

    test('質問が空白のみの場合、追加ボタンが無効化される', () => {
      renderWithProviders(
        <QuestionAddForm {...defaultProps} newQuestionText="   " />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).toBeDisabled();
    });

    test('質問が入力されている場合、追加ボタンが有効になる', () => {
      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          newQuestionText="延長保育はありますか？"
        />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).not.toBeDisabled();
    });
  });

  describe('値の表示', () => {
    test('既存の質問テキストが入力フィールドに表示される', () => {
      renderWithProviders(
        <QuestionAddForm {...defaultProps} newQuestionText="既存の質問" />
      );

      const input = screen.getByLabelText('質問入力');
      expect(input).toHaveValue('既存の質問');
    });

    test('既存の回答テキストが回答フィールドに表示される', () => {
      renderWithProviders(
        <QuestionAddForm {...defaultProps} newAnswerText="既存の回答" />
      );

      const textarea = screen.getByLabelText('回答入力（任意）');
      expect(textarea).toHaveValue('既存の回答');
    });

    test('質問が空で回答がある場合、追加ボタンが無効化される', () => {
      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          newQuestionText=""
          newAnswerText="回答だけがある"
        />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).toBeDisabled();
    });

    test('質問と回答の両方がある場合、追加ボタンが有効になる', () => {
      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          newQuestionText="質問"
          newAnswerText="回答"
        />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).not.toBeDisabled();
    });
  });
});
