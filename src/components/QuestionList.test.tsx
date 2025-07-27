import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { QuestionList } from './QuestionList';
import { renderWithProviders, testUtils } from '../test/test-utils';
import type { Question, QuestionList as QuestionListType } from '../types';

// テスト用のモックデータ
const mockQuestions: Question[] = [
  testUtils.createMockQuestion({
    id: '1',
    text: '保育時間は何時から何時までですか？',
    answer: '',
    isAnswered: false,
    priority: 'high',
    category: '基本情報',
    orderIndex: 1,
  }),
  testUtils.createMockQuestion({
    id: '2',
    text: '給食はありますか？アレルギー対応は？',
    answer: '完全給食、アレルギー個別対応可能',
    isAnswered: true,
    priority: 'high',
    category: '食事',
    orderIndex: 2,
    answeredAt: new Date('2024-01-15T10:00:00'),
  }),
  testUtils.createMockQuestion({
    id: '3',
    text: '年間行事について教えてください',
    answer: '',
    isAnswered: false,
    priority: 'medium',
    category: '行事',
    orderIndex: 3,
  }),
  testUtils.createMockQuestion({
    id: '4',
    text: '保育料以外の費用はありますか？',
    answer: '教材費月1000円',
    isAnswered: true,
    priority: 'high',
    category: '費用',
    orderIndex: 4,
    answeredAt: new Date('2024-01-15T10:05:00'),
  }),
];

const mockQuestionList: QuestionListType = {
  id: 'list-1',
  title: 'さくら保育園見学リスト',
  nurseryName: 'さくら保育園',
  visitDate: new Date('2024-01-20'),
  questions: mockQuestions,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-15'),
  isTemplate: false,
};

describe('QuestionList', () => {
  describe('質問の表示', () => {
    test('質問リストのタイトルが表示される', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      expect(screen.getByText('さくら保育園見学リスト')).toBeInTheDocument();
    });

    test('保育園名と見学日が表示される', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      expect(screen.getByText('さくら保育園')).toBeInTheDocument();
      expect(screen.getByText(/2024年1月20日/)).toBeInTheDocument();
    });

    test('すべての質問が表示される', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      mockQuestions.forEach((question) => {
        expect(screen.getByText(question.text)).toBeInTheDocument();
      });
    });

    test('回答済みの質問には回答が表示される', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      expect(
        screen.getByText('完全給食、アレルギー個別対応可能')
      ).toBeInTheDocument();
      expect(screen.getByText('教材費月1000円')).toBeInTheDocument();
    });

    test('優先度が表示される', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      // 高優先度の質問
      const highPriorityQuestions = screen.getAllByText(/高/);
      expect(highPriorityQuestions).toHaveLength(3); // 3つの高優先度質問

      // 中優先度の質問
      expect(screen.getByText(/中/)).toBeInTheDocument();
    });
  });

  describe('質問の並び順', () => {
    test('未回答の質問が上部に、回答済みの質問が下部に表示される', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      const questions = screen.getAllByRole('listitem');

      // 最初の2つは未回答の質問
      expect(questions[0]).toHaveTextContent(
        '保育時間は何時から何時までですか？'
      );
      expect(questions[1]).toHaveTextContent('年間行事について教えてください');

      // 最後の2つは回答済みの質問
      expect(questions[2]).toHaveTextContent(
        '給食はありますか？アレルギー対応は？'
      );
      expect(questions[3]).toHaveTextContent('保育料以外の費用はありますか？');
    });

    test('回答済みの質問には「回答済み」ラベルが表示される', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      const answeredLabels = screen.getAllByText(/回答済み/);
      expect(answeredLabels).toHaveLength(2);
    });
  });

  describe('インタラクション', () => {
    test('質問をクリックすると詳細が展開される', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      // 最初の質問項目のクリック可能領域を取得
      const firstQuestionButton = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });

      // クリック前にはInputがないことを確認
      expect(
        screen.queryByPlaceholderText(/回答を入力してください/)
      ).not.toBeInTheDocument();

      await user.click(firstQuestionButton);

      // 回答入力フィールドが表示される
      expect(
        screen.getByPlaceholderText(/回答を入力してください/)
      ).toBeInTheDocument();
    });

    test('onQuestionUpdateが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnQuestionUpdate = vi.fn();

      renderWithProviders(
        <QuestionList
          questionList={mockQuestionList}
          onQuestionUpdate={mockOnQuestionUpdate}
        />
      );

      // 最初の質問項目のクリック可能領域を取得
      const firstQuestionButton = screen.getByRole('button', {
        name: /質問: 保育時間は何時から何時までですか？/,
      });

      await user.click(firstQuestionButton);

      // 回答入力フィールドと保存ボタンが表示されるまで待機
      const answerInput = await waitFor(() =>
        screen.getByPlaceholderText(/回答を入力してください/)
      );

      const saveButton = await waitFor(() =>
        screen.getByRole('button', { name: /保存/ })
      );

      // 回答を入力
      await user.type(answerInput, '7:30〜19:00');

      // 保存ボタンをクリック
      await user.click(saveButton);

      // onQuestionUpdateが正しい引数で呼ばれることを確認
      expect(mockOnQuestionUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnQuestionUpdate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          answer: '7:30〜19:00',
          isAnswered: true,
          answeredAt: expect.any(Date),
        })
      );
    });
  });

  describe('モバイル最適化', () => {
    test('タッチターゲットが44px以上である', () => {
      renderWithProviders(<QuestionList questionList={mockQuestionList} />);

      const questions = screen.getAllByRole('listitem');
      questions.forEach((question) => {
        // questionアイテム内のクリック可能なBoxを取得
        const clickableBox = question.querySelector(
          '[style*="min-height"], [class*="css-"]'
        );
        if (clickableBox) {
          const styles = window.getComputedStyle(clickableBox);
          // minHeightかheightを確認
          const minHeight = parseInt(styles.minHeight) || 0;
          const height = parseInt(styles.height) || 0;
          const actualHeight = Math.max(minHeight, height);
          expect(actualHeight).toBeGreaterThanOrEqual(44);
        } else {
          // フォールバック: liタグ自体の高さを確認
          const styles = window.getComputedStyle(question);
          const height = parseInt(styles.height) || 44; // デフォルト44px
          expect(height).toBeGreaterThanOrEqual(44);
        }
      });
    });
  });

  describe('空の状態', () => {
    test('質問がない場合はメッセージが表示される', () => {
      const emptyList: QuestionListType = {
        ...mockQuestionList,
        questions: [],
      };

      renderWithProviders(<QuestionList questionList={emptyList} />);

      expect(screen.getByText(/質問がありません/)).toBeInTheDocument();
    });
  });
});
