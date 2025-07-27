import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { QuestionItem } from './QuestionItem';
import { renderWithProviders, testUtils } from '../test/test-utils';
import type { Question } from '../types';

// テスト用のモックデータ
const mockQuestion: Question = testUtils.createMockQuestion({
  id: '1',
  text: '保育時間は何時から何時までですか？',
  priority: 'high',
  orderIndex: 1,
});

const mockAnsweredQuestion: Question = testUtils.createMockQuestion({
  id: '2',
  text: '給食はありますか？',
  answer: '完全給食です',
  isAnswered: true,
  priority: 'medium',
  category: '食事',
  orderIndex: 2,
  answeredAt: new Date('2024-01-15T10:00:00'),
});

describe('QuestionItem', () => {
  describe('質問の表示', () => {
    test('質問文が表示される', () => {
      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(
        screen.getByText('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
    });

    test('優先度バッジが表示される', () => {
      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText('高')).toBeInTheDocument();
    });

    test('回答済みの質問には回答内容が表示される', () => {
      renderWithProviders(
        <QuestionItem
          question={mockAnsweredQuestion}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText('完全給食です')).toBeInTheDocument();
      expect(screen.getByText('回答済み')).toBeInTheDocument();
    });
  });

  describe('編集機能', () => {
    test('編集ボタンをクリックすると編集モードになる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const editButton = screen.getByRole('button', { name: /編集/ });
      await user.click(editButton);

      // 編集モードでは質問テキストが入力フィールドになる
      expect(
        screen.getByDisplayValue('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
    });

    test('編集モードで質問文を変更できる', async () => {
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn();

      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={mockOnUpdate}
          onDelete={vi.fn()}
        />
      );

      // 編集モードに入る
      const editButton = screen.getByRole('button', { name: /編集/ });
      await user.click(editButton);

      // 質問文を変更
      const textInput =
        screen.getByDisplayValue('保育時間は何時から何時までですか？');
      await user.clear(textInput);
      await user.type(textInput, '新しい質問文です');

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /保存/ });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        text: '新しい質問文です',
        priority: 'high',
      });
    });

    test('編集モードで優先度を変更できる', async () => {
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn();

      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={mockOnUpdate}
          onDelete={vi.fn()}
        />
      );

      // 編集モードに入る
      const editButton = screen.getByRole('button', { name: /編集/ });
      await user.click(editButton);

      // 優先度を変更
      const prioritySelect = screen.getByRole('combobox', { name: /優先度/ });
      await user.selectOptions(prioritySelect, 'low');

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /保存/ });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          priority: 'low',
        })
      );
    });

    test('キャンセルボタンで編集をキャンセルできる', async () => {
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn();

      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={mockOnUpdate}
          onDelete={vi.fn()}
        />
      );

      // 編集モードに入る
      const editButton = screen.getByRole('button', { name: /編集/ });
      await user.click(editButton);

      // 質問文を変更
      const textInput =
        screen.getByDisplayValue('保育時間は何時から何時までですか？');
      await user.clear(textInput);
      await user.type(textInput, '変更された質問文');

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
      await user.click(cancelButton);

      // onUpdateが呼ばれないことを確認
      expect(mockOnUpdate).not.toHaveBeenCalled();

      // 元の質問文が表示されることを確認
      expect(
        screen.getByText('保育時間は何時から何時までですか？')
      ).toBeInTheDocument();
    });
  });

  describe('削除機能', () => {
    test('削除ボタンをクリックしてconfirmでOKを選択するとonDeleteが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnDelete = vi.fn();

      // window.confirmをモック
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /削除/ });
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('この質問を削除しますか？')
      );
      expect(mockOnDelete).toHaveBeenCalledWith('1');

      confirmSpy.mockRestore();
    });

    test('削除ボタンをクリックしてconfirmでCancelを選択するとonDeleteが呼ばれない', async () => {
      const user = userEvent.setup();
      const mockOnDelete = vi.fn();

      // window.confirmをモック
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /削除/ });
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('この質問を削除しますか？')
      );
      expect(mockOnDelete).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('回答入力機能', () => {
    test('未回答の質問には回答入力ボタンが表示される', () => {
      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: /回答を入力/ })
      ).toBeInTheDocument();
    });

    test('回答入力ボタンをクリックすると回答入力フィールドが表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const answerButton = screen.getByRole('button', { name: /回答を入力/ });
      await user.click(answerButton);

      expect(
        screen.getByLabelText(/回答を入力してください/)
      ).toBeInTheDocument();
    });

    test('回答を入力して保存できる', async () => {
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn();

      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={mockOnUpdate}
          onDelete={vi.fn()}
        />
      );

      // 回答入力モードに入る
      const answerButton = screen.getByRole('button', { name: /回答を入力/ });
      await user.click(answerButton);

      // 回答を入力
      const answerInput = screen.getByLabelText(/回答を入力してください/);
      await user.type(answerInput, '7:30〜19:00');

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /回答を保存/ });
      await user.click(saveButton);

      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        answer: '7:30〜19:00',
        isAnswered: true,
        answeredAt: expect.any(Date),
      });
    });
  });

  describe('モバイル最適化', () => {
    test('ボタンのタッチターゲットが44px以上である', () => {
      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const editButton = screen.getByRole('button', { name: /編集/ });
      const deleteButton = screen.getByRole('button', { name: /削除/ });
      const answerButton = screen.getByRole('button', { name: /回答を入力/ });

      [editButton, deleteButton, answerButton].forEach((button) => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight) || 0;
        const height = parseInt(styles.height) || 0;
        const actualHeight = Math.max(minHeight, height);
        expect(actualHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('バリデーション', () => {
    test('空の質問文では保存できない', async () => {
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn();

      renderWithProviders(
        <QuestionItem
          question={mockQuestion}
          onUpdate={mockOnUpdate}
          onDelete={vi.fn()}
        />
      );

      // 編集モードに入る
      const editButton = screen.getByRole('button', { name: /編集/ });
      await user.click(editButton);

      // 質問文を空にする
      const textInput =
        screen.getByDisplayValue('保育時間は何時から何時までですか？');
      await user.clear(textInput);

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: /保存/ });
      await user.click(saveButton);

      // エラーメッセージが表示される
      expect(screen.getByText(/質問文を入力してください/)).toBeInTheDocument();

      // onUpdateが呼ばれない
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });
});
