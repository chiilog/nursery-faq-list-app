import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { QuestionListCreator } from './QuestionListCreator';
import { renderWithProviders } from '../test/testUtils';

describe('QuestionListCreator', () => {
  const mockOnCreate = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    test('質問リスト作成フォームが表示される', () => {
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      expect(
        screen.getByRole('heading', { name: /新しい質問リストを作成/ })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
      expect(screen.getByLabelText(/保育園名/)).toBeInTheDocument();
      expect(screen.getByLabelText(/見学予定日/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /作成/ })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /キャンセル/ })
      ).toBeInTheDocument();
    });

    test('全ての入力フィールドが空の状態で表示される', () => {
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
      expect(screen.getByLabelText(/保育園名/)).toHaveValue('');
      expect(screen.getByLabelText(/見学予定日/)).toHaveValue('');
    });

    test('作成ボタンが無効状態で表示される（タイトルが未入力）', () => {
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /作成/ })).toBeDisabled();
    });
  });

  describe('入力操作', () => {
    test('タイトルを入力できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/タイトル/);
      await user.type(titleInput, 'テスト質問リスト');

      expect(titleInput).toHaveValue('テスト質問リスト');
    });

    test('保育園名を入力できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      const nurseryNameInput = screen.getByLabelText(/保育園名/);
      await user.type(nurseryNameInput, 'テスト保育園');

      expect(nurseryNameInput).toHaveValue('テスト保育園');
    });

    test('見学予定日を入力できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      const visitDateInput = screen.getByLabelText(/見学予定日/);
      await user.type(visitDateInput, '2024-01-15');

      expect(visitDateInput).toHaveValue('2024-01-15');
    });

    test('タイトルが入力されると作成ボタンが有効になる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/タイトル/);
      const createButton = screen.getByRole('button', { name: /作成/ });

      expect(createButton).toBeDisabled();

      await user.type(titleInput, 'テスト質問リスト');

      expect(createButton).toBeEnabled();
    });
  });

  describe('バリデーション', () => {
    test('タイトルが空の場合はエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/タイトル/);
      const createButton = screen.getByRole('button', { name: /作成/ });

      // タイトルにフォーカス後、空のまま離脱
      await user.click(titleInput);
      await user.tab();

      expect(screen.getByText(/タイトルは必須です/)).toBeInTheDocument();
      expect(createButton).toBeDisabled();
    });

    test('タイトルが最大文字数を超える場合はエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/タイトル/);
      const longTitle = 'あ'.repeat(101); // 100文字を超える

      await user.type(titleInput, longTitle);
      await user.tab();

      expect(
        screen.getByText(/タイトルは100文字以内で入力してください/)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /作成/ })).toBeDisabled();
    });
  });

  describe('質問リスト作成', () => {
    test('有効な情報を入力して作成ボタンをクリックするとonCreateが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      // 入力
      await user.type(screen.getByLabelText(/タイトル/), 'テスト質問リスト');
      await user.type(screen.getByLabelText(/保育園名/), 'テスト保育園');
      await user.type(screen.getByLabelText(/見学予定日/), '2024-01-15');

      // 作成ボタンクリック
      await user.click(screen.getByRole('button', { name: /作成/ }));

      expect(mockOnCreate).toHaveBeenCalledWith({
        title: 'テスト質問リスト',
        nurseryName: 'テスト保育園',
        visitDate: expect.any(Date),
      });

      // 日付の値を別途検証
      const callArgs = mockOnCreate.mock.calls[0]?.[0] as { visitDate?: Date };
      const dateString = callArgs?.visitDate?.toISOString().split('T')[0];
      expect(dateString).toBe('2024-01-15');
    });

    test('タイトルのみ入力して作成できる（オプション項目は空でも可）', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/タイトル/), 'テスト質問リスト');
      await user.click(screen.getByRole('button', { name: /作成/ }));

      expect(mockOnCreate).toHaveBeenCalledWith({
        title: 'テスト質問リスト',
        nurseryName: '',
        visitDate: undefined,
      });
    });
  });

  describe('キャンセル操作', () => {
    test('キャンセルボタンをクリックするとonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByRole('button', { name: /キャンセル/ }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('入力途中でキャンセルしてもonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/タイトル/), 'テスト');
      await user.click(screen.getByRole('button', { name: /キャンセル/ }));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    test('フォームが適切なaria-labelを持つ', () => {
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      expect(
        screen.getByRole('form', { name: /質問リスト作成フォーム/ })
      ).toBeInTheDocument();
    });

    test('必須フィールドがaria-requiredを持つ', () => {
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText(/タイトル/)).toHaveAttribute(
        'aria-required',
        'true'
      );
    });

    test('エラーメッセージがaria-describedbyで関連付けられる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionListCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />
      );

      const titleInput = screen.getByLabelText(/タイトル/);
      await user.click(titleInput);
      await user.tab();

      const errorMessage = screen.getByText(/タイトルは必須です/);
      expect(titleInput).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('id');
    });
  });
});
