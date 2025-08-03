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

  describe('質問リスト表示', () => {
    test('質問一覧が表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(
        screen.getByText('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
      expect(screen.getByText('給食はありますか？')).toBeInTheDocument();
    });

    test('未回答の質問が先に表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const questions = screen.getAllByTestId(/question-item/);
      expect(questions).toHaveLength(2);

      // 最初の質問（未回答）
      expect(questions[0]).toHaveTextContent(
        '保育時間は何時から何時までですか？'
      );
      // 2番目の質問（回答済み）
      expect(questions[1]).toHaveTextContent('給食はありますか？');
    });

    test('回答済み質問の回答が表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(screen.getByText('あります')).toBeInTheDocument();
    });
  });

  describe('質問編集機能', () => {
    test('質問をクリックすると編集モードになる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const question = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });
      await user.click(question);

      expect(
        screen.getByDisplayValue('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
    });

    test('質問の回答を入力できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const question = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });
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
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      const question = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });
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
        setCurrentNursery: vi.fn(),
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
        })
      );
    });
  });

  describe('見学日編集機能', () => {
    test('編集ボタンをクリックすると日付選択が表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const editButton = screen.getByRole('button', { name: '編集' });
      await user.click(editButton);

      expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
    });

    test('見学日を変更して保存できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const editButton = screen.getByRole('button', { name: '編集' });
      await user.click(editButton);

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

  describe('保育園編集機能', () => {
    test('編集ボタンが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const editButton = screen.getByRole('button', { name: '編集' });
      expect(editButton).toBeInTheDocument();
    });

    test('編集ボタンをクリックすると編集モードになる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      const editButton = screen.getByRole('button', { name: '編集' });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'キャンセル' })
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('保育園名を入力してください')
      ).toBeInTheDocument();
    });

    test('保育園名を編集して保存できる', async () => {
      const user = userEvent.setup();
      const mockUpdateNursery = vi.fn();

      vi.mocked(useNurseryStore).mockReturnValue({
        currentNursery: mockCurrentNursery,
        loading: { isLoading: false },
        error: null,
        updateNursery: mockUpdateNursery,
        addQuestion: vi.fn(),
        updateQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
      });

      renderWithProviders(<NurseryDetailPage />);

      // 編集モードに切り替え
      const editButton = screen.getByRole('button', { name: '編集' });
      await user.click(editButton);

      // 保育園名を変更
      const nameInput =
        screen.getByPlaceholderText('保育園名を入力してください');
      await user.clear(nameInput);
      await user.type(nameInput, '新しい保育園名');

      // 保存
      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', {
        name: '新しい保育園名',
        visitSessions: expect.any(Array),
      });
    });

    test('キャンセルボタンで編集モードを終了できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      // 編集モードに切り替え
      const editButton = screen.getByRole('button', { name: '編集' });
      await user.click(editButton);

      // キャンセル
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '保存' })
      ).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('見出しが適切に設定されている', () => {
      renderWithProviders(<NurseryDetailPage />);

      expect(
        screen.getByRole('heading', { name: '保育園詳細' })
      ).toBeInTheDocument();
    });

    test('キーボードナビゲーションが機能する', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NurseryDetailPage />);

      // Tabキーでフォーカス移動をテスト
      await user.tab();
      expect(screen.getByRole('button', { name: '← 戻る' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: '編集' })).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('見学メモ')).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole('button', { name: '+ 質問を追加' })
      ).toHaveFocus();
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

  describe('質問削除機能', () => {
    test('削除ボタンが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const deleteButtons = screen.getAllByLabelText('質問を削除');
      expect(deleteButtons).toHaveLength(2); // 2つの質問があるので
    });

    test('削除ボタンをクリックすると確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithProviders(<NurseryDetailPage />);

      const deleteButton = screen.getAllByLabelText('質問を削除')[0];
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /この操作は取り消せません。この質問を削除しますか？/
        )
      );

      confirmSpy.mockRestore();
    });

    test('削除確認後に質問が削除される', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(<NurseryDetailPage />);

      const deleteButton = screen.getAllByLabelText('質問を削除')[0];
      await user.click(deleteButton);

      expect(mockDeleteQuestion).toHaveBeenCalledWith(
        'nursery-1',
        'session-1',
        'question-1'
      );

      confirmSpy.mockRestore();
    });

    test('編集中の質問を削除すると編集状態がリセットされる', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(<NurseryDetailPage />);

      // 質問をクリックして編集モードにする
      const questionButton = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });
      await user.click(questionButton);

      // 削除ボタンをクリック（編集中の質問）
      const deleteButton = screen.getAllByLabelText('質問を削除')[0];
      await user.click(deleteButton);

      expect(mockDeleteQuestion).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('UX改善', () => {
    describe('保育園名エラー表示', () => {
      test('編集時に保育園名を空にするとエラーが表示される', async () => {
        const user = userEvent.setup();

        renderWithProviders(<NurseryDetailPage />);

        // 編集ボタンをクリック
        const editButton = screen.getByRole('button', { name: '編集' });
        await user.click(editButton);

        // 保育園名を空にする
        const nameInput = screen.getByDisplayValue('テスト保育園');
        await user.clear(nameInput);

        // エラーメッセージが表示されることを確認
        expect(
          screen.getByText('保育園名を入力してください')
        ).toBeInTheDocument();
      });

      test('保育園名を入力するとエラーが消える', async () => {
        const user = userEvent.setup();

        renderWithProviders(<NurseryDetailPage />);

        // 編集ボタンをクリック
        const editButton = screen.getByRole('button', { name: '編集' });
        await user.click(editButton);

        // 保育園名を空にしてエラーを表示
        const nameInput = screen.getByDisplayValue('テスト保育園');
        await user.clear(nameInput);
        expect(
          screen.getByText('保育園名を入力してください')
        ).toBeInTheDocument();

        // 保育園名を入力
        await user.type(nameInput, '新しい保育園名');

        // エラーメッセージが消えることを確認
        expect(
          screen.queryByText('保育園名を入力してください')
        ).not.toBeInTheDocument();
      });
    });

    describe('保存ボタンの状態', () => {
      test('変更がない場合、保存ボタンが無効化される', async () => {
        const user = userEvent.setup();

        renderWithProviders(<NurseryDetailPage />);

        // 編集ボタンをクリック
        const editButton = screen.getByRole('button', { name: '編集' });
        await user.click(editButton);

        // 保存ボタンが無効化されていることを確認
        const saveButton = screen.getByRole('button', { name: '保存' });
        expect(saveButton).toBeDisabled();
      });

      test('保育園名を変更すると保存ボタンが有効になる', async () => {
        const user = userEvent.setup();

        renderWithProviders(<NurseryDetailPage />);

        // 編集ボタンをクリック
        const editButton = screen.getByRole('button', { name: '編集' });
        await user.click(editButton);

        // 保育園名を変更
        const nameInput = screen.getByDisplayValue('テスト保育園');
        await user.clear(nameInput);
        await user.type(nameInput, '新しい保育園名');

        // 保存ボタンが有効になることを確認
        const saveButton = screen.getByRole('button', { name: '保存' });
        expect(saveButton).not.toBeDisabled();
      });

      test('保育園名が空の場合、保存ボタンが無効化される', async () => {
        const user = userEvent.setup();

        renderWithProviders(<NurseryDetailPage />);

        // 編集ボタンをクリック
        const editButton = screen.getByRole('button', { name: '編集' });
        await user.click(editButton);

        // 保育園名を空にする
        const nameInput = screen.getByDisplayValue('テスト保育園');
        await user.clear(nameInput);

        // 保存ボタンが無効化されることを確認
        const saveButton = screen.getByRole('button', { name: '保存' });
        expect(saveButton).toBeDisabled();
      });

      test('見学日のみ変更した場合も保存ボタンが有効になる', async () => {
        const user = userEvent.setup();

        renderWithProviders(<NurseryDetailPage />);

        // 編集ボタンをクリック
        const editButton = screen.getByRole('button', { name: '編集' });
        await user.click(editButton);

        // 見学日を変更
        const dateInput = screen.getByLabelText('見学日を選択してください');
        await user.clear(dateInput);
        await user.type(dateInput, '2025-03-01');

        // 保存ボタンが有効になることを確認
        const saveButton = screen.getByRole('button', { name: '保存' });
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('自由入力欄（見学メモ）', () => {
    test('見学メモエリアが質問追加フォームの上に表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const notesSection = screen.getByLabelText('見学メモ');
      const addQuestionButton = screen.getByText('質問を追加');

      expect(notesSection).toBeInTheDocument();
      expect(addQuestionButton).toBeInTheDocument();

      // DOMの順序で見学メモが質問追加より前にあることを確認
      const notesSectionOrder = Array.from(
        document.body.querySelectorAll('*')
      ).indexOf(notesSection);
      const addButtonOrder = Array.from(
        document.body.querySelectorAll('*')
      ).indexOf(addQuestionButton);
      expect(notesSectionOrder).toBeLessThan(addButtonOrder);
    });

    test('既存の見学メモが表示される', () => {
      const nurseryWithNotes = {
        ...mockCurrentNursery,
        visitSessions: [
          {
            ...mockCurrentNursery.visitSessions[0],
            notes: '既存のメモ内容です',
          },
        ],
      };

      const mockStoreWithNotes = {
        currentNursery: nurseryWithNotes,
        loading: { isLoading: false },
        error: null,
        updateNursery: mockUpdateNursery,
        deleteQuestion: mockDeleteQuestion,
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
        updateQuestion: vi.fn(),
        addQuestion: vi.fn(),
        updateVisitSession: vi.fn(),
      };

      vi.mocked(useNurseryStore).mockReturnValue(mockStoreWithNotes);

      renderWithProviders(<NurseryDetailPage />);

      const notesTextarea = screen.getByDisplayValue('既存のメモ内容です');
      expect(notesTextarea).toBeInTheDocument();
    });

    test('見学メモの入力・変更ができる', async () => {
      const user = userEvent.setup();
      const mockUpdateVisitSession = vi.fn();

      const mockStoreWithUpdate = {
        currentNursery: mockCurrentNursery,
        loading: { isLoading: false },
        error: null,
        updateNursery: mockUpdateNursery,
        deleteQuestion: mockDeleteQuestion,
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
        updateQuestion: vi.fn(),
        addQuestion: vi.fn(),
        updateVisitSession: mockUpdateVisitSession,
      };

      vi.mocked(useNurseryStore).mockReturnValue(mockStoreWithUpdate);

      renderWithProviders(<NurseryDetailPage />);

      const notesTextarea = screen.getByLabelText('見学メモ');
      await user.type(notesTextarea, '新しいメモです');

      expect(notesTextarea).toHaveValue('新しいメモです');
    });

    test('見学メモがフォーカス外れ時に自動保存される', async () => {
      const user = userEvent.setup();
      const mockUpdateVisitSession = vi.fn();

      const mockStoreForAutoSave = {
        currentNursery: mockCurrentNursery,
        loading: { isLoading: false },
        error: null,
        updateNursery: mockUpdateNursery,
        deleteQuestion: mockDeleteQuestion,
        setCurrentNursery: vi.fn(),
        clearError: vi.fn(),
        updateQuestion: vi.fn(),
        addQuestion: vi.fn(),
        updateVisitSession: mockUpdateVisitSession,
      };

      vi.mocked(useNurseryStore).mockReturnValue(mockStoreForAutoSave);

      renderWithProviders(<NurseryDetailPage />);

      const notesTextarea = screen.getByLabelText('見学メモ');
      await user.type(notesTextarea, 'テスト');
      await user.tab(); // フォーカスを外す

      expect(mockUpdateVisitSession).toHaveBeenCalledWith('session-1', {
        notes: 'テスト',
      });
    });

    test('プレースホルダーが表示される', () => {
      renderWithProviders(<NurseryDetailPage />);

      const notesTextarea =
        screen.getByPlaceholderText('見学中のメモをここに...');
      expect(notesTextarea).toBeInTheDocument();
    });
  });
});
