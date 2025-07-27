/**
 * 保育園詳細画面のテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useParams } from 'react-router-dom';
import { renderWithProviders } from '../test/test-utils';
import { NurseryDetailPage } from './NurseryDetailPage';
import { useNurseryStore } from '../stores/nurseryStore';
import type { Nursery } from '../types/data';

// useParamsのモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// useNurseryStoreのモック
const mockUpdateNursery = vi.fn();
const mockCurrentNursery: Nursery = {
  id: 'nursery-1',
  name: 'テスト保育園',
  visitSessions: [
    {
      id: 'session-1',
      visitDate: new Date('2025-12-31'),
      status: 'planned',
      questions: [
        {
          id: 'question-1',
          text: '開園時間は何時ですか？',
          answer: '',
          isAnswered: false,
          priority: 'high',
          category: '基本情報',
          orderIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'question-2',
          text: '給食はありますか？',
          answer: 'あります',
          isAnswered: true,
          priority: 'medium',
          category: '生活',
          orderIndex: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('../stores/nurseryStore', () => ({
  useNurseryStore: vi.fn(),
}));

describe('NurseryDetailPage コンポーネント', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのパラメータを設定
    vi.mocked(useParams).mockReturnValue({ nurseryId: 'nursery-1' });

    // デフォルトのストア状態を設定
    vi.mocked(useNurseryStore).mockReturnValue({
      currentNursery: mockCurrentNursery,
      loading: { isLoading: false },
      error: null,
      updateNursery: mockUpdateNursery,
      addQuestion: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
      clearError: vi.fn(),
    });
  });

  describe('基本表示', () => {
    test('保育園詳細ページが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
    });

    test('見学日情報が表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('見学予定日')).toBeInTheDocument();
      expect(screen.getByText('2025年12月31日')).toBeInTheDocument();
    });

    test('質問進捗が表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('質問進捗')).toBeInTheDocument();
      expect(screen.getByText('1/2 回答済み')).toBeInTheDocument();
    });

    test('戻るボタンが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const backButton = screen.getByRole('button', { name: '← 戻る' });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('質問リスト表示', () => {
    test('質問一覧が表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('開園時間は何時ですか？')).toBeInTheDocument();
      expect(screen.getByText('給食はありますか？')).toBeInTheDocument();
    });

    test('未回答の質問が先に表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const questions = screen.getAllByTestId(/question-item/);
      expect(questions).toHaveLength(2);

      // 最初の質問（未回答）
      expect(questions[0]).toHaveTextContent('開園時間は何時ですか？');
      // 2番目の質問（回答済み）
      expect(questions[1]).toHaveTextContent('給食はありますか？');
    });

    test('回答済み質問の回答が表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('あります')).toBeInTheDocument();
    });

    test('優先度が視覚的に表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const highPriorityQuestion = screen.getByTestId(
        'question-item-question-1'
      );
      expect(highPriorityQuestion).toHaveAttribute('data-priority', 'high');
    });
  });

  describe('質問編集機能', () => {
    test('質問をクリックすると編集モードになる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const question = screen.getByText('開園時間は何時ですか？');
      await user.click(question);

      expect(
        screen.getByDisplayValue('開園時間は何時ですか？')
      ).toBeInTheDocument();
    });

    test('質問の回答を入力できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const question = screen.getByText('開園時間は何時ですか？');
      await user.click(question);

      const answerInput = screen.getByPlaceholderText('回答を入力してください');
      await user.type(answerInput, '7時から19時まで');

      expect(answerInput).toHaveValue('7時から19時まで');
    });

    test('回答を保存すると質問が更新される', async () => {
      const user = userEvent.setup();
      const mockUpdateQuestion = vi.fn();

      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: mockCurrentNursery,
        loading: { isLoading: false },
        error: null,
        updateNursery: mockUpdateNursery,
        addQuestion: vi.fn(),
        updateQuestion: mockUpdateQuestion,
        deleteQuestion: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      const question = screen.getByText('開園時間は何時ですか？');
      await user.click(question);

      const answerInput = screen.getByPlaceholderText('回答を入力してください');
      await user.type(answerInput, '7時から19時まで');

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(mockUpdateQuestion).toHaveBeenCalledWith(
        'nursery-1',
        'session-1',
        'question-1',
        {
          answer: '7時から19時まで',
          isAnswered: true,
        }
      );
    });
  });

  describe('新しい質問の追加', () => {
    test('質問追加ボタンが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const addButton = screen.getByRole('button', { name: '+ 質問を追加' });
      expect(addButton).toBeInTheDocument();
    });

    test('質問追加ボタンをクリックすると入力フォームが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const addButton = screen.getByRole('button', { name: '+ 質問を追加' });
      await user.click(addButton);

      expect(
        screen.getByPlaceholderText('新しい質問を入力してください')
      ).toBeInTheDocument();
    });

    test('新しい質問を入力して保存できる', async () => {
      const user = userEvent.setup();
      const mockAddQuestion = vi.fn();

      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: mockCurrentNursery,
        loading: { isLoading: false },
        error: null,
        updateNursery: mockUpdateNursery,
        addQuestion: mockAddQuestion,
        updateQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      const addButton = screen.getByRole('button', { name: '+ 質問を追加' });
      await user.click(addButton);

      const questionInput =
        screen.getByPlaceholderText('新しい質問を入力してください');
      await user.type(questionInput, '延長保育はありますか？');

      const saveButton = screen.getByRole('button', { name: '追加' });
      await user.click(saveButton);

      expect(mockAddQuestion).toHaveBeenCalledWith(
        'nursery-1',
        'session-1',
        expect.objectContaining({
          text: '延長保育はありますか？',
          answer: '',
          isAnswered: false,
          priority: 'medium',
          category: '基本情報',
        })
      );
    });
  });

  describe('見学日編集機能', () => {
    test('見学日をクリックすると日付選択が表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const visitDate = screen.getByText('2025年12月31日');
      await user.click(visitDate);

      expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
    });

    test('見学日を変更して保存できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const visitDate = screen.getByText('2025年12月31日');
      await user.click(visitDate);

      const dateInput = screen.getByDisplayValue('2025-12-31');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-11-30');

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(mockUpdateNursery).toHaveBeenCalledWith(
        'nursery-1',
        expect.objectContaining({
          visitSessions: expect.arrayContaining([
            expect.objectContaining({
              visitDate: new Date('2025-11-30'),
            }),
          ]),
        })
      );
    });
  });

  describe('エラーハンドリング', () => {
    test('存在しない保育園IDの場合はエラーメッセージが表示される', () => {
      vi.mocked(useParams).mockReturnValue({ nurseryId: 'invalid-id' });
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: null,
        loading: { isLoading: false },
        error: { message: '保育園が見つかりません', timestamp: new Date() },
        updateNursery: mockUpdateNursery,
        addQuestion: vi.fn(),
        updateQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('保育園が見つかりません')).toBeInTheDocument();
    });

    test('ローディング中はスピナーが表示される', () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: null,
        loading: { isLoading: true, operation: '保育園データを読み込み中...' },
        error: null,
        updateNursery: mockUpdateNursery,
        addQuestion: vi.fn(),
        updateQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      expect(
        screen.getByText('保育園データを読み込み中...')
      ).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('見出しが適切に設定されている', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(
        screen.getByRole('heading', { name: 'テスト保育園' })
      ).toBeInTheDocument();
    });

    test('キーボードナビゲーションが機能する', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      // Tabキーでフォーカス移動をテスト
      await user.tab();
      expect(screen.getByRole('button', { name: '← 戻る' })).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole('button', { name: '+ 質問を追加' })
      ).toHaveFocus();
    });

    test('スクリーンリーダー向けの適切なラベルが設定されている', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByLabelText('見学予定日')).toBeInTheDocument();
      expect(screen.getByLabelText('質問進捗')).toBeInTheDocument();
    });
  });

  describe('レスポンシブ対応', () => {
    test('モバイル画面でも適切にレイアウトされる', () => {
      // モバイル画面サイズをシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
      // モバイル向けの適切なレイアウトが適用されることを確認
    });
  });
});
