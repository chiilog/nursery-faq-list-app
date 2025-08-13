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
    isAddingQuestion: false,
    newQuestionText: '',
    onToggleAddForm: vi.fn<(value: boolean) => void>(),
    onNewQuestionTextChange: vi.fn<(value: string) => void>(),
    onAddQuestion: vi.fn<() => void>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('フォーム非表示状態', () => {
    test('「+ 質問を追加」ボタンが表示される', () => {
      renderWithProviders(<QuestionAddForm {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: '+ 質問を追加' });
      expect(addButton).toBeInTheDocument();
    });

    test('ボタンをクリックするとonToggleAddFormが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnToggleAddForm = vi.fn();

      renderWithProviders(
        <QuestionAddForm
          {...defaultProps}
          onToggleAddForm={mockOnToggleAddForm}
        />
      );

      const addButton = screen.getByRole('button', { name: '+ 質問を追加' });
      await user.click(addButton);

      expect(mockOnToggleAddForm).toHaveBeenCalledWith(true);
    });
  });

  describe('フォーム表示状態', () => {
    const openFormProps = {
      ...defaultProps,
      isAddingQuestion: true,
    };

    test('質問入力フィールドが表示される', () => {
      renderWithProviders(<QuestionAddForm {...openFormProps} />);

      const input = screen.getByPlaceholderText('新しい質問を入力してください');
      expect(input).toBeInTheDocument();
    });

    test('追加ボタンとキャンセルボタンが表示される', () => {
      renderWithProviders(<QuestionAddForm {...openFormProps} />);

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
          {...openFormProps}
          onNewQuestionTextChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('新しい質問を入力してください');
      await user.type(input, 'テスト');

      // onChangeが呼ばれることを確認
      expect(mockOnChange).toHaveBeenCalled();
      // userEvent.typeは各文字ごとにイベントを発火するため、複数回呼ばれる
      expect(mockOnChange).toHaveBeenCalledTimes(3); // 'テスト'の3文字
    });

    test('追加ボタンをクリックするとonAddQuestionが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnAddQuestion = vi.fn();

      renderWithProviders(
        <QuestionAddForm
          {...openFormProps}
          newQuestionText="延長保育はありますか？"
          onAddQuestion={mockOnAddQuestion}
        />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      await user.click(addButton);

      expect(mockOnAddQuestion).toHaveBeenCalled();
    });

    test('キャンセルボタンをクリックするとonToggleAddFormが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnToggleAddForm = vi.fn();

      renderWithProviders(
        <QuestionAddForm
          {...openFormProps}
          onToggleAddForm={mockOnToggleAddForm}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(mockOnToggleAddForm).toHaveBeenCalledWith(false);
    });

    test('質問が空の場合、追加ボタンが無効化される', () => {
      renderWithProviders(
        <QuestionAddForm {...openFormProps} newQuestionText="" />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).toBeDisabled();
    });

    test('質問が空白のみの場合、追加ボタンが無効化される', () => {
      renderWithProviders(
        <QuestionAddForm {...openFormProps} newQuestionText="   " />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).toBeDisabled();
    });

    test('質問が入力されている場合、追加ボタンが有効になる', () => {
      renderWithProviders(
        <QuestionAddForm
          {...openFormProps}
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
        <QuestionAddForm
          {...defaultProps}
          isAddingQuestion={true}
          newQuestionText="既存の質問"
        />
      );

      const input = screen.getByPlaceholderText('新しい質問を入力してください');
      expect(input).toHaveValue('既存の質問');
    });
  });
});
