/**
 * QuestionItem コンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { QuestionItem } from './QuestionItem';
import { renderWithProviders, testUtils } from '../../../test/test-utils';

describe('QuestionItem', () => {
  const mockOnQuestionClick = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnQuestionClick.mockClear();
    mockOnDelete.mockClear();
  });

  describe('基本表示', () => {
    test('質問テキストが表示される', () => {
      const question = testUtils.createMockQuestion({
        text: '保育時間は何時から何時までですか？',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByText('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
    });

    test('回答済みの場合、回答済みバッジが表示される', () => {
      const question = testUtils.createMockQuestion({
        isAnswered: true,
        answer: 'テスト回答',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('回答済み')).toBeInTheDocument();
    });

    test('未回答の場合、回答済みバッジが表示されない', () => {
      const question = testUtils.createMockQuestion({
        isAnswered: false,
        answer: '',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('回答済み')).not.toBeInTheDocument();
    });
  });

  describe('クリック動作', () => {
    test('カード領域をクリックすると onQuestionClick が呼ばれる', async () => {
      const user = userEvent.setup();
      const question = testUtils.createMockQuestion({
        id: 'test-question-1',
        text: 'テスト質問',
        answer: 'テスト回答',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /質問: テスト質問/ });
      await user.click(card);

      expect(mockOnQuestionClick).toHaveBeenCalledOnce();
    });

    test('正しい引数（questionId, answer, text）で onQuestionClick が呼ばれる', async () => {
      const user = userEvent.setup();
      const question = testUtils.createMockQuestion({
        id: 'test-question-1',
        text: 'テスト質問',
        answer: 'テスト回答',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /質問: テスト質問/ });
      await user.click(card);

      expect(mockOnQuestionClick).toHaveBeenCalledWith(
        'test-question-1',
        'テスト回答',
        'テスト質問'
      );
    });

    test('未回答の場合、空文字列の回答で onQuestionClick が呼ばれる', async () => {
      const user = userEvent.setup();
      const question = testUtils.createMockQuestion({
        id: 'test-question-2',
        text: '未回答の質問',
        answer: '',
        isAnswered: false,
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', { name: /質問: 未回答の質問/ });
      await user.click(card);

      expect(mockOnQuestionClick).toHaveBeenCalledWith(
        'test-question-2',
        '',
        '未回答の質問'
      );
    });
  });

  describe('キーボード操作', () => {
    test('Enterキーで onQuestionClick が呼ばれる', async () => {
      const user = userEvent.setup();
      const question = testUtils.createMockQuestion({
        id: 'keyboard-test-1',
        text: 'キーボードテスト質問',
        answer: 'キーボードテスト回答',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', {
        name: /質問: キーボードテスト質問/,
      });
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockOnQuestionClick).toHaveBeenCalledWith(
        'keyboard-test-1',
        'キーボードテスト回答',
        'キーボードテスト質問'
      );
    });

    test('Spaceキーで onQuestionClick が呼ばれる', async () => {
      const user = userEvent.setup();
      const question = testUtils.createMockQuestion({
        id: 'keyboard-test-2',
        text: 'スペースキーテスト質問',
        answer: 'スペースキーテスト回答',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', {
        name: /質問: スペースキーテスト質問/,
      });
      card.focus();
      await user.keyboard(' ');

      expect(mockOnQuestionClick).toHaveBeenCalledWith(
        'keyboard-test-2',
        'スペースキーテスト回答',
        'スペースキーテスト質問'
      );
    });

    test('その他のキーでは onQuestionClick が呼ばれない', async () => {
      const user = userEvent.setup();
      const question = testUtils.createMockQuestion({
        text: 'その他キーテスト質問',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', {
        name: /質問: その他キーテスト質問/,
      });
      card.focus();
      await user.keyboard('{Escape}');
      await user.keyboard('{Tab}');
      await user.keyboard('a');

      expect(mockOnQuestionClick).not.toHaveBeenCalled();
    });
  });

  describe('回答状態による表示', () => {
    test('回答済みの場合、回答内容が表示される', () => {
      const question = testUtils.createMockQuestion({
        isAnswered: true,
        answer: '完全給食で、アレルギー対応も個別に相談可能です。',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByText('完全給食で、アレルギー対応も個別に相談可能です。')
      ).toBeInTheDocument();
    });

    test('未回答の場合、「クリックして回答を追加」が表示される', () => {
      const question = testUtils.createMockQuestion({
        isAnswered: false,
        answer: '',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('クリックして回答を追加')).toBeInTheDocument();
    });

    test('未回答の場合、回答内容は表示されない', () => {
      const question = testUtils.createMockQuestion({
        isAnswered: false,
        answer: '', // 空の回答
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      // 回答エリアのテキストが存在しないことを確認
      expect(screen.queryByText(/完全給食/)).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('適切なARIAラベルが設定されている（回答済み）', () => {
      const question = testUtils.createMockQuestion({
        text: 'アクセシビリティテスト質問',
        isAnswered: true,
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByRole('button', {
          name: '質問: アクセシビリティテスト質問 (回答済み)',
        })
      ).toBeInTheDocument();
    });

    test('適切なARIAラベルが設定されている（未回答）', () => {
      const question = testUtils.createMockQuestion({
        text: 'アクセシビリティテスト質問',
        isAnswered: false,
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByRole('button', {
          name: '質問: アクセシビリティテスト質問 (未回答)',
        })
      ).toBeInTheDocument();
    });

    test('タブインデックスが設定されてキーボードフォーカス可能', () => {
      const question = testUtils.createMockQuestion({
        text: 'フォーカステスト質問',
      });

      renderWithProviders(
        <QuestionItem
          question={question}
          onQuestionClick={mockOnQuestionClick}
          onDelete={mockOnDelete}
        />
      );

      const card = screen.getByRole('button', {
        name: /質問: フォーカステスト質問/,
      });
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('削除機能', () => {
    describe('削除ボタンの表示', () => {
      test('onDeleteが渡されない場合、削除ボタンが表示されない', () => {
        const question = testUtils.createMockQuestion();

        renderWithProviders(
          <QuestionItem
            question={question}
            onQuestionClick={mockOnQuestionClick}
          />
        );

        expect(screen.queryByLabelText('質問を削除')).not.toBeInTheDocument();
      });

      test('onDeleteが渡された場合、削除ボタンが表示される', () => {
        const question = testUtils.createMockQuestion();

        renderWithProviders(
          <QuestionItem
            question={question}
            onQuestionClick={mockOnQuestionClick}
            onDelete={mockOnDelete}
          />
        );

        expect(screen.getByLabelText('質問を削除')).toBeInTheDocument();
      });
    });

    describe('削除ボタンのクリック処理', () => {
      test('削除ボタンをクリックすると確認ダイアログが表示される', async () => {
        const user = userEvent.setup();
        const question = testUtils.createMockQuestion({
          text: '削除対象の質問',
        });
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        renderWithProviders(
          <QuestionItem
            question={question}
            onQuestionClick={mockOnQuestionClick}
            onDelete={mockOnDelete}
          />
        );

        await user.click(screen.getByLabelText('質問を削除'));

        expect(confirmSpy).toHaveBeenCalledWith(
          expect.stringMatching(
            /この操作は取り消せません。この質問を削除しますか？/s
          )
        );

        confirmSpy.mockRestore();
      });

      test('確認ダイアログでOKを選択すると削除処理が実行される', async () => {
        const user = userEvent.setup();
        const question = testUtils.createMockQuestion({
          id: 'delete-target-id',
        });
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        renderWithProviders(
          <QuestionItem
            question={question}
            onQuestionClick={mockOnQuestionClick}
            onDelete={mockOnDelete}
          />
        );

        await user.click(screen.getByLabelText('質問を削除'));

        expect(mockOnDelete).toHaveBeenCalledOnce();
        expect(mockOnDelete).toHaveBeenCalledWith('delete-target-id');

        confirmSpy.mockRestore();
      });

      test('確認ダイアログでキャンセルを選択すると削除処理が実行されない', async () => {
        const user = userEvent.setup();
        const question = testUtils.createMockQuestion();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        renderWithProviders(
          <QuestionItem
            question={question}
            onQuestionClick={mockOnQuestionClick}
            onDelete={mockOnDelete}
          />
        );

        await user.click(screen.getByLabelText('質問を削除'));

        expect(mockOnDelete).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
      });

      test('削除ボタンのクリックイベントが質問カード全体のクリックイベントに伝播しない', async () => {
        const user = userEvent.setup();
        const question = testUtils.createMockQuestion();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        renderWithProviders(
          <QuestionItem
            question={question}
            onQuestionClick={mockOnQuestionClick}
            onDelete={mockOnDelete}
          />
        );

        await user.click(screen.getByLabelText('質問を削除'));

        expect(mockOnQuestionClick).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
      });
    });
  });
});
