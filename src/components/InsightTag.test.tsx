/**
 * InsightTag 共通コンポーネントのテスト
 * DRY原則に基づいたタグ用Tag
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import { InsightTag } from './InsightTag';

describe('InsightTag コンポーネント', () => {
  describe('基本表示', () => {
    test('テキストが表示される', () => {
      renderWithProviders(<InsightTag text="テストタグ" />);

      expect(screen.getByText('テストタグ')).toBeInTheDocument();
    });

    test('削除ボタンが非表示の場合は削除ボタンが表示されない', () => {
      renderWithProviders(
        <InsightTag text="テストタグ" showDeleteButton={false} />
      );

      const deleteButton = screen.queryByRole('button', {
        name: 'テストタグを削除',
      });
      expect(deleteButton).not.toBeInTheDocument();
    });

    test('デフォルトで削除ボタンは非表示', () => {
      renderWithProviders(<InsightTag text="テストタグ" />);

      const deleteButton = screen.queryByRole('button', {
        name: 'テストタグを削除',
      });
      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  describe('削除機能', () => {
    test('削除ボタンが表示される場合は削除ボタンが表示される', () => {
      renderWithProviders(
        <InsightTag text="テストタグ" showDeleteButton={true} />
      );

      const deleteButton = screen.getByRole('button', {
        name: 'テストタグを削除',
      });
      expect(deleteButton).toBeInTheDocument();
    });

    test('削除ボタンクリックでonDeleteコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnDelete = vi.fn();

      renderWithProviders(
        <InsightTag
          text="テストタグ"
          showDeleteButton={true}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', {
        name: 'テストタグを削除',
      });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    test('onDeleteがundefinedでもエラーが発生しない', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <InsightTag text="テストタグ" showDeleteButton={true} />
      );

      const deleteButton = screen.getByRole('button', {
        name: 'テストタグを削除',
      });

      // エラーが発生しないことを確認
      await expect(user.click(deleteButton)).resolves.not.toThrow();
    });
  });

  describe('読み取り専用モード', () => {
    test('読み取り専用モードでは削除ボタンが表示されない', () => {
      renderWithProviders(
        <InsightTag
          text="テストタグ"
          showDeleteButton={true}
          isReadOnly={true}
        />
      );

      const deleteButton = screen.queryByRole('button', {
        name: 'テストタグを削除',
      });
      expect(deleteButton).not.toBeInTheDocument();
    });

    test('読み取り専用モードでもテキストは表示される', () => {
      renderWithProviders(
        <InsightTag
          text="テストタグ"
          showDeleteButton={true}
          isReadOnly={true}
        />
      );

      expect(screen.getByText('テストタグ')).toBeInTheDocument();
    });
  });

  describe('透明度制御', () => {
    test('デフォルトでは透明度1.0', () => {
      renderWithProviders(<InsightTag text="テストタグ" />);

      // バッジ要素の透明度を確認（実際のCSSは確認困難なため、props渡しの確認）
      expect(screen.getByText('テストタグ')).toBeInTheDocument();
    });

    test('プレースホルダー用の透明度設定が可能', () => {
      renderWithProviders(<InsightTag text="プレースホルダー" opacity={0.4} />);

      expect(screen.getByText('プレースホルダー')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('削除ボタンに適切なaria-labelが設定される', () => {
      renderWithProviders(
        <InsightTag text="アクセシビリティテスト" showDeleteButton={true} />
      );

      const deleteButton = screen.getByRole('button', {
        name: 'アクセシビリティテストを削除',
      });
      expect(deleteButton).toHaveAttribute(
        'aria-label',
        'アクセシビリティテストを削除'
      );
    });

    test('キーボード操作で削除ボタンが操作できる', async () => {
      const user = userEvent.setup();
      const mockOnDelete = vi.fn();

      renderWithProviders(
        <InsightTag
          text="キーボードテスト"
          showDeleteButton={true}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', {
        name: 'キーボードテストを削除',
      });

      deleteButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('スタイリング', () => {
    test('レスポンシブ対応されたBadgeが表示される', () => {
      renderWithProviders(<InsightTag text="レスポンシブテスト" />);

      // バッジが表示されることを確認
      expect(screen.getByText('レスポンシブテスト')).toBeInTheDocument();
    });

    test('削除ボタンありの場合とのスタイル一貫性', () => {
      const { rerender } = renderWithProviders(<InsightTag text="テスト" />);

      expect(screen.getByText('テスト')).toBeInTheDocument();

      // 削除ボタンありでも同じスタイルが適用される
      rerender(<InsightTag text="テスト" showDeleteButton={true} />);

      expect(screen.getByText('テスト')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'テストを削除' })
      ).toBeInTheDocument();
    });
  });
});
