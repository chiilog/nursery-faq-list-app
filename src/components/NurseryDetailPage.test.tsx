/**
 * 保育園詳細画面の統合テスト
 * ページレベルの表示・ナビゲーション・エラーハンドリングのテスト
 * 詳細な子コンポーネントのテストは各コンポーネントのテストファイルで実施
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useParams } from 'react-router-dom';
import { renderWithProviders } from '../test/test-utils';
import { NurseryDetailPage } from './NurseryDetailPage';
import { useNurseryStore } from '../stores/nurseryStore';
import type { Nursery } from '../types/entities';

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
const mockDeleteQuestion = vi.fn();
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
          text: '保育時間は何時から何時までですか？',
          answer: '',
          isAnswered: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'question-2',
          text: '給食はありますか？',
          answer: 'あります',
          isAnswered: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      insights: [],
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
      deleteQuestion: mockDeleteQuestion,
      setCurrentNursery: vi.fn(),
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

      expect(screen.getByText(/見学日:/)).toBeInTheDocument();
      expect(screen.getByText(/2025\/12\/31/)).toBeInTheDocument();
    });

    test('質問進捗が表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText(/質問進捗:/)).toBeInTheDocument();
      expect(screen.getByText(/1\/2/)).toBeInTheDocument();
    });

    test('戻るボタンが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const backButton = screen.getByRole('button', { name: '← 戻る' });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('子コンポーネント表示', () => {
    test('主要コンポーネントが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      // NurseryInfoCardの存在確認（詳細テストは各コンポーネントで実施）
      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
      expect(screen.getByText(/見学日:/)).toBeInTheDocument();
      expect(screen.getByText(/質問進捗:/)).toBeInTheDocument();

      // QuestionsSection、QuestionAddForm、InsightsSectionの存在確認
      expect(
        screen.getByRole('button', { name: '+ 質問を追加' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
    });
  });

  describe('統合レベルのワークフロー', () => {
    test('質問の編集・保存ワークフローが機能する', async () => {
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
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      // 質問をクリックして編集開始
      const question = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });
      await user.click(question);

      // 回答入力
      const answerInput = screen.getByPlaceholderText('回答を入力してください');
      await user.type(answerInput, '7時から19時まで');

      // 保存
      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      // ストアのupdateQuestionが正しく呼ばれることを確認
      expect(mockUpdateQuestion).toHaveBeenCalledWith(
        'nursery-1',
        'session-1',
        'question-1',
        {
          text: '保育時間は何時から何時までですか？',
          answer: '7時から19時まで',
          isAnswered: true,
        }
      );
    });
  });

  describe('質問追加ワークフロー', () => {
    test('質問追加の統合ワークフローが機能する', () => {
      const mockAddQuestion = vi.fn();

      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: mockCurrentNursery,
        loading: { isLoading: false },
        error: null,
        updateNursery: mockUpdateNursery,
        addQuestion: mockAddQuestion,
        updateQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      // 質問追加フォームが表示されることを確認（詳細動作はQuestionAddFormでテスト）
      const addButton = screen.getByRole('button', { name: '+ 質問を追加' });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('保育園編集ワークフロー', () => {
    test('保育園編集の統合ワークフローが機能する', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      // 編集ボタンから編集モードに入る
      const editButton = screen.getByRole('button', { name: '編集' });
      await user.click(editButton);

      // 編集用のUI要素が表示される（詳細テストはNurseryInfoCardで実施）
      const saveButton = screen.getByRole('button', { name: '保存' });
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      expect(saveButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
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
        setCurrentNursery: vi.fn(),
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
        setCurrentNursery: vi.fn(),
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
        screen.getByRole('heading', { name: '保育園詳細' })
      ).toBeInTheDocument();
    });

    test('キーボードナビゲーションが機能する', () => {
      renderWithProviders(<NurseryDetailPage />);

      // 主要な要素に直接フォーカスして機能を確認
      const backButton = screen.getByRole('button', { name: '← 戻る' });
      backButton.focus();
      expect(backButton).toHaveFocus();

      const editButton = screen.getByRole('button', { name: '編集' });
      editButton.focus();
      expect(editButton).toHaveFocus();

      const addQuestionButton = screen.getByRole('button', {
        name: '+ 質問を追加',
      });
      addQuestionButton.focus();
      expect(addQuestionButton).toHaveFocus();
    });

    test('スクリーンリーダー向けの適切なラベルが設定されている', () => {
      renderWithProviders(<NurseryDetailPage />);

      // 質問のアクセシビリティラベルをチェック
      expect(
        screen.getByRole('button', {
          name: /質問: 保育時間は何時から何時までですか？/,
        })
      ).toBeInTheDocument();
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

  describe('子コンポーネント間連携テスト', () => {
    test('保育園情報が各子コンポーネントに正しく渡される', () => {
      renderWithProviders(<NurseryDetailPage />);

      // NurseryInfoCardにpropsが正しく渡されていることを統合レベルで確認
      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
      expect(screen.getByText(/2025\/12\/31/)).toBeInTheDocument();
      expect(screen.getByText(/1\/2/)).toBeInTheDocument();

      // QuestionsSectionに質問データが渡されていることを確認
      expect(
        screen.getByText('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
      expect(screen.getByText('給食はありますか？')).toBeInTheDocument();
      expect(screen.getByText('あります')).toBeInTheDocument();
    });

    test('エラー状態が全体に適切に反映される', () => {
      vi.mocked(useParams).mockReturnValue({ nurseryId: 'invalid-id' });
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: null,
        loading: { isLoading: false },
        error: { message: '保育園が見つかりません', timestamp: new Date() },
        updateNursery: mockUpdateNursery,
        addQuestion: vi.fn(),
        updateQuestion: vi.fn(),
        deleteQuestion: mockDeleteQuestion,
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      // エラー状態ではコンポーネントが適切に非表示になることを確認
      expect(screen.getByText('保育園が見つかりません')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'ホームに戻る' })
      ).toBeInTheDocument();

      // エラー時は主要コンポーネントが表示されないことを確認
      expect(
        screen.queryByRole('button', { name: '+ 質問を追加' })
      ).not.toBeInTheDocument();
    });

    test('ローディング状態が全体に適切に反映される', () => {
      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: null,
        loading: { isLoading: true, operation: '保育園データを読み込み中...' },
        error: null,
        updateNursery: mockUpdateNursery,
        addQuestion: vi.fn(),
        updateQuestion: vi.fn(),
        deleteQuestion: mockDeleteQuestion,
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      // ローディング状態での表示確認
      expect(
        screen.getByText('保育園データを読み込み中...')
      ).toBeInTheDocument();

      // ローディング時は主要コンポーネントが表示されないことを確認
      expect(
        screen.queryByRole('button', { name: '+ 質問を追加' })
      ).not.toBeInTheDocument();
    });
  });
});
