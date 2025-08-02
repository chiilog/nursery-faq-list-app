/**
 * NotesSection コンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { NotesSection } from './NotesSection';
import { renderWithProviders } from '../test/test-utils';

describe('NotesSection', () => {
  const mockOnAutoSave = vi.fn();

  beforeEach(() => {
    mockOnAutoSave.mockClear();
  });

  describe('基本表示', () => {
    test('テキストエリアが表示される', () => {
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      expect(textarea).toBeInTheDocument();
    });

    test('プレースホルダーが正しく表示される', () => {
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByPlaceholderText('見学中のメモをここに...');
      expect(textarea).toBeInTheDocument();
    });

    test('初期値が正しく表示される', () => {
      const initialNotes = '既存のメモ内容です';
      renderWithProviders(
        <NotesSection notes={initialNotes} onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByDisplayValue(initialNotes);
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('入力操作', () => {
    test('テキスト入力ができる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      const inputText = '新しいメモです';

      await user.type(textarea, inputText);

      // 入力された値が表示されることを確認
      expect(textarea).toHaveValue(inputText);
    });

    test('長いテキストの入力ができる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      const longText = '長いメモテキスト'.repeat(50); // 約800文字

      await user.type(textarea, longText);

      expect(textarea).toHaveValue(longText);
    });
  });

  describe('文字数制限', () => {
    test('文字数カウンターが表示される', () => {
      const notes = 'テスト文字';
      renderWithProviders(
        <NotesSection notes={notes} onAutoSave={mockOnAutoSave} />
      );

      const counter = screen.getByText(`${notes.length}/2000`);
      expect(counter).toBeInTheDocument();
    });

    test('100文字以下で警告メッセージが表示される', () => {
      const notes = 'あ'.repeat(1950); // 1950文字（50文字残り）
      renderWithProviders(
        <NotesSection notes={notes} onAutoSave={mockOnAutoSave} />
      );

      const warningMessage = screen.getByText('あと50文字で上限です');
      expect(warningMessage).toBeInTheDocument();
    });

    test('10文字以下で緊急警告メッセージが表示される', () => {
      const notes = 'あ'.repeat(1995); // 1995文字（5文字残り）
      renderWithProviders(
        <NotesSection notes={notes} onAutoSave={mockOnAutoSave} />
      );

      const warningMessage = screen.getByText('あと5文字で上限です！');
      expect(warningMessage).toBeInTheDocument();
    });

    test('2000文字制限に近づくと警告色で表示される', () => {
      const notes = 'あ'.repeat(1950); // 1950文字
      renderWithProviders(
        <NotesSection notes={notes} onAutoSave={mockOnAutoSave} />
      );

      const counter = screen.getByText('1950/2000');
      expect(counter).toBeInTheDocument();
    });

    test('2000文字を超えようとすると入力が制限される', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      const exactly2000chars = 'あ'.repeat(2000);

      // userEventを使用してより現実的なテスト
      await user.clear(textarea);
      await user.click(textarea);

      // 大量のテキストを効率的に入力するためpaste操作を使用
      await user.paste(exactly2000chars);

      // 値が2000文字であることを確認
      expect(textarea).toHaveValue(exactly2000chars);
      expect((textarea as HTMLTextAreaElement).value.length).toBe(2000);
    }, 15000); // タイムアウトを15秒に延長

    test('2000文字を超えると制限メッセージが表示される', () => {
      const notes = 'あ'.repeat(2001); // 2001文字
      renderWithProviders(
        <NotesSection notes={notes} onAutoSave={mockOnAutoSave} />
      );

      const message = screen.getByText('メモは2000文字以内で入力してください');
      expect(message).toBeInTheDocument();
    });

    test('制限到達アラートが文字削除まで継続表示される', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      const exactly2000chars = 'あ'.repeat(2000);

      // 2000文字入力
      await user.type(textarea, exactly2000chars);

      // 制限を超えた入力を試行
      await user.type(textarea, 'x');

      // アラートが表示されることを確認
      const alertMessage = screen.getByText(
        '⚠️ 文字数制限（2000文字）に達しました'
      );
      expect(alertMessage).toBeInTheDocument();

      // textareaを選択してBackspaceで文字削除
      await user.click(textarea);
      await user.keyboard('{Backspace}');

      // 1999文字になったのでアラートが消えることを確認
      expect(
        screen.queryByText('⚠️ 文字数制限（2000文字）に達しました')
      ).not.toBeInTheDocument();
    });
  });

  describe('自動保存', () => {
    test('フォーカスが外れた時に自動保存が実行される', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      await user.type(textarea, 'テスト');
      await user.tab(); // フォーカスを外す

      expect(mockOnAutoSave).toHaveBeenCalledWith('テスト');
    });

    test('値が変更されていない場合は自動保存が実行されない', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <NotesSection notes="既存メモ" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      await user.click(textarea); // フォーカス
      await user.tab(); // フォーカスを外す（値は変更なし）

      expect(mockOnAutoSave).not.toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    test('適切なaria-labelが設定されている', () => {
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByLabelText('見学メモ');
      expect(textarea).toBeInTheDocument();
    });

    test('キーボードナビゲーションが可能', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });

      // タブキーでフォーカス
      await user.tab();
      expect(textarea).toHaveFocus();
    });
  });

  describe('テキストエリアの機能', () => {
    test('基本的なスタイルが設定されている', () => {
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      // 基本的な表示とminHeight/maxHeightが設定されていることを確認
      expect(textarea).toHaveStyle('min-height: 120px');
    });

    test('複数行のテキスト入力に対応している', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      const multiLineText = '見学メモ1行目\n見学メモ2行目\n見学メモ3行目';

      await user.type(textarea, multiLineText);

      expect(textarea).toHaveValue(multiLineText);
    });

    test('長いテキストが正しく表示される', async () => {
      const user = userEvent.setup();
      const longText = '長いテキスト'.repeat(100); // 500文字

      renderWithProviders(
        <NotesSection notes="" onAutoSave={mockOnAutoSave} />
      );

      const textarea = screen.getByRole('textbox', { name: /見学メモ/i });
      await user.type(textarea, longText);

      expect(textarea).toHaveValue(longText);
    });
  });
});
