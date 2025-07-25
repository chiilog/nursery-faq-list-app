/**
 * 保育園カードコンポーネントのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders, testUtils } from '../test/test-utils';
import { NurseryCard } from './NurseryCard';
// Nursery型は testUtils.createMockNursery で使用

describe('NurseryCard コンポーネント', () => {
  describe('基本表示', () => {
    test('保育園名が表示される', () => {
      const nursery = testUtils.createMockNursery();
      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
    });

    test('見学日が未設定の場合「未定」と表示される', () => {
      const nursery = testUtils.createMockNursery();
      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('見学日: 未定')).toBeInTheDocument();
    });

    test('質問進捗が「0/0」と表示される（見学セッションなし）', () => {
      const nursery = testUtils.createMockNursery();
      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('質問進捗: 0/0')).toBeInTheDocument();
    });
  });

  describe('見学セッションありの場合', () => {
    test('最新の見学予定日が表示される', () => {
      const visitDate = new Date('2025-02-15');
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            visitDate,
            status: 'planned',
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('見学日: 2025/2/15')).toBeInTheDocument();
    });

    test('質問進捗が正しく計算される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            questions: [
              testUtils.createMockQuestion({
                id: 'q1',
                text: '質問1',
                answer: '回答1',
                isAnswered: true,
                order: 1,
              }),
              testUtils.createMockQuestion({
                id: 'q2',
                text: '質問2',
                isAnswered: false,
                order: 2,
              }),
            ],
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('質問進捗: 1/2')).toBeInTheDocument();
    });
  });

  describe('インタラクション', () => {
    test('カードクリックでonClickコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const nursery = testUtils.createMockNursery();

      renderWithProviders(
        <NurseryCard nursery={nursery} onClick={mockOnClick} />
      );

      const card = screen.getByRole('button', { name: /テスト保育園/ });
      await user.click(card);

      expect(mockOnClick).toHaveBeenCalledWith(nursery);
    });

    test('Enterキーでカードが操作できる', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const nursery = testUtils.createMockNursery();

      renderWithProviders(
        <NurseryCard nursery={nursery} onClick={mockOnClick} />
      );

      const card = screen.getByRole('button', { name: /テスト保育園/ });
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledWith(nursery);
    });

    test('Spaceキーでカードが操作できる', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const nursery = testUtils.createMockNursery();

      renderWithProviders(
        <NurseryCard nursery={nursery} onClick={mockOnClick} />
      );

      const card = screen.getByRole('button', { name: /テスト保育園/ });
      card.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledWith(nursery);
    });

    test('その他のキーでは操作されない', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const nursery = testUtils.createMockNursery();

      renderWithProviders(
        <NurseryCard nursery={nursery} onClick={mockOnClick} />
      );

      const card = screen.getByRole('button', { name: /テスト保育園/ });
      card.focus();
      await user.keyboard('{Escape}');

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('エラーケースの処理', () => {
    test('onClickコールバックがundefinedでもエラーが発生しない', async () => {
      const user = userEvent.setup();
      const nursery = testUtils.createMockNursery();

      // TypeScriptエラーを回避するためのキャスト
      const onClickUndefined = undefined as unknown as (
        nursery: typeof nursery
      ) => void;

      expect(() => {
        renderWithProviders(
          <NurseryCard nursery={nursery} onClick={onClickUndefined} />
        );
      }).not.toThrow();

      const card = screen.getByRole('button', { name: /テスト保育園/ });

      // クリックしてもエラーが発生せず、UIが正常に表示されることを確認
      await user.click(card);
      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
    });

    test('onClickコールバックで例外が発生してもUIに影響しない', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const mockOnClick = vi.fn().mockImplementation(() => {
        throw new Error('テスト用エラー');
      });
      const nursery = testUtils.createMockNursery();

      renderWithProviders(
        <NurseryCard nursery={nursery} onClick={mockOnClick} />
      );

      const card = screen.getByRole('button', { name: /テスト保育園/ });

      // クリックしてもUIが正常に表示されることを確認
      await user.click(card);
      expect(screen.getByText('テスト保育園')).toBeInTheDocument();

      // コンソールエラーが記録されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'NurseryCard onClick error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('アクセシビリティ', () => {
    test('適切なrole属性とaria-label属性が設定される', () => {
      const nursery = testUtils.createMockNursery();
      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      const card = screen.getByRole('button', {
        name: 'テスト保育園の詳細を開く',
      });
      expect(card).toBeInTheDocument();
    });

    test('tabIndexが0に設定されてキーボードアクセス可能', () => {
      const nursery = testUtils.createMockNursery();
      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
});
