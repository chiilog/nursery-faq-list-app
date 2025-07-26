/**
 * 保育園追加コンポーネントのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import { NurseryCreator } from './NurseryCreator';

// useNurseryStoreのモック
const mockCreateNursery = vi.fn();
const mockClearError = vi.fn();
vi.mock('../stores/nurseryStore', () => ({
  useNurseryStore: () => ({
    createNursery: mockCreateNursery,
    clearError: mockClearError,
    loading: { isLoading: false },
    error: null,
  }),
}));

describe('NurseryCreator コンポーネント', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本表示', () => {
    test('保育園追加フォームが表示される', () => {
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      expect(screen.getByText('新しい保育園を追加')).toBeInTheDocument();
      expect(screen.getByLabelText('保育園名')).toBeInTheDocument();
      expect(screen.getByLabelText('住所')).toBeInTheDocument();
      expect(screen.getByLabelText('電話番号')).toBeInTheDocument();
      expect(screen.getByLabelText('ウェブサイト')).toBeInTheDocument();
    });

    test('必須項目がマークされている', () => {
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const nameField = screen.getByLabelText('保育園名');
      expect(nameField).toBeRequired();
    });

    test('保存とキャンセルボタンが表示される', () => {
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'キャンセル' })
      ).toBeInTheDocument();
    });
  });

  describe('入力機能', () => {
    test('保育園名の入力ができる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const nameInput = screen.getByLabelText('保育園名');
      await user.type(nameInput, 'テスト保育園');

      expect(nameInput).toHaveValue('テスト保育園');
    });

    test('住所の入力ができる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const addressInput = screen.getByLabelText('住所');
      await user.type(addressInput, '東京都渋谷区1-1-1');

      expect(addressInput).toHaveValue('東京都渋谷区1-1-1');
    });

    test('電話番号の入力ができる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const phoneInput = screen.getByLabelText('電話番号');
      await user.type(phoneInput, '03-1234-5678');

      expect(phoneInput).toHaveValue('03-1234-5678');
    });

    test('ウェブサイトの入力ができる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const websiteInput = screen.getByLabelText('ウェブサイト');
      await user.type(websiteInput, 'https://example.com');

      expect(websiteInput).toHaveValue('https://example.com');
    });
  });

  describe('バリデーション', () => {
    test('保育園名が空の場合はエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(screen.getByText('保育園名は必須です')).toBeInTheDocument();
    });

    test('保育園名が1文字未満の場合はエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const nameInput = screen.getByLabelText('保育園名');
      await user.type(nameInput, ' '); // 空白文字

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(
        screen.getByText('保育園名は1文字以上で入力してください')
      ).toBeInTheDocument();
    });

    test('保育園名が100文字を超える場合はエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const nameInput = screen.getByLabelText('保育園名');
      const longName = 'あ'.repeat(101);
      await user.type(nameInput, longName);

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(
        screen.getByText('保育園名は100文字以内で入力してください')
      ).toBeInTheDocument();
    });

    test('ウェブサイトが有効なURL形式でない場合はエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const nameInput = screen.getByLabelText('保育園名');
      const websiteInput = screen.getByLabelText('ウェブサイト');

      await user.type(nameInput, 'テスト保育園');
      await user.type(websiteInput, 'invalid-url');

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(
        screen.getByText('有効なURLを入力してください')
      ).toBeInTheDocument();
    });
  });

  describe('保存機能', () => {
    test('有効なデータで保存ボタンを押すとcreateNurseryが呼ばれる', async () => {
      const user = userEvent.setup();
      mockCreateNursery.mockResolvedValue('nursery-id-123');
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      // 必須項目を入力
      const nameInput = screen.getByLabelText('保育園名');
      await user.type(nameInput, 'テスト保育園');

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockCreateNursery).toHaveBeenCalledWith({
          name: 'テスト保育園',
          address: '',
          phoneNumber: '',
          website: '',
          notes: '',
        });
      });
    });

    test('すべての項目を入力して保存すると正しいデータが送信される', async () => {
      const user = userEvent.setup();
      mockCreateNursery.mockResolvedValue('nursery-id-123');
      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      // 全項目を入力
      await user.type(screen.getByLabelText('保育園名'), 'テスト保育園');
      await user.type(screen.getByLabelText('住所'), '東京都渋谷区1-1-1');
      await user.type(screen.getByLabelText('電話番号'), '03-1234-5678');
      await user.type(
        screen.getByLabelText('ウェブサイト'),
        'https://example.com'
      );

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockCreateNursery).toHaveBeenCalledWith({
          name: 'テスト保育園',
          address: '東京都渋谷区1-1-1',
          phoneNumber: '03-1234-5678',
          website: 'https://example.com',
          notes: '',
        });
      });
    });
  });

  describe('キャンセル機能', () => {
    test('キャンセルボタンを押すとonCancelコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      renderWithProviders(<NurseryCreator onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('入力途中でキャンセルしてもエラーが発生しない', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      renderWithProviders(<NurseryCreator onCancel={mockOnCancel} />);

      // 途中まで入力
      const nameInput = screen.getByLabelText('保育園名');
      await user.type(nameInput, '途中入力');

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('ローディング状態', () => {
    test('保存中はボタンが無効化される', () => {
      // ローディング状態をモック
      vi.mocked(vi.importActual('../stores/nurseryStore')).useNurseryStore =
        () => ({
          createNursery: mockCreateNursery,
          clearError: mockClearError,
          loading: { isLoading: true, operation: '保育園を作成中...' },
          error: null,
        });

      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).toBeDisabled();
    });

    test('保存中はローディングインジケーターが表示される', () => {
      // ローディング状態をモック
      vi.mocked(vi.importActual('../stores/nurseryStore')).useNurseryStore =
        () => ({
          createNursery: mockCreateNursery,
          clearError: mockClearError,
          loading: { isLoading: true, operation: '保育園を作成中...' },
          error: null,
        });

      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      expect(screen.getByText('保育園を作成中...')).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    test('ストアからのエラーが表示される', () => {
      // エラー状態をモック
      vi.mocked(vi.importActual('../stores/nurseryStore')).useNurseryStore =
        () => ({
          createNursery: mockCreateNursery,
          clearError: mockClearError,
          loading: { isLoading: false },
          error: {
            message: '保育園の作成に失敗しました',
            timestamp: new Date(),
          },
        });

      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      expect(
        screen.getByText('保育園の作成に失敗しました')
      ).toBeInTheDocument();
    });

    test('エラー表示の閉じるボタンが機能する', async () => {
      const user = userEvent.setup();

      // エラー状態をモック
      vi.mocked(vi.importActual('../stores/nurseryStore')).useNurseryStore =
        () => ({
          createNursery: mockCreateNursery,
          clearError: mockClearError,
          loading: { isLoading: false },
          error: {
            message: '保育園の作成に失敗しました',
            timestamp: new Date(),
          },
        });

      renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

      const closeButton = screen.getByRole('button', {
        name: 'エラーを閉じる',
      });
      await user.click(closeButton);

      expect(mockClearError).toHaveBeenCalled();
    });
  });
});
