/**
 * 保育園カードコンポーネントのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */

import { screen } from '@testing-library/react';
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
    test('カードクリックでonClickコールバックが呼ばれる', () => {
      const mockOnClick = vi.fn();
      const nursery = testUtils.createMockNursery();

      renderWithProviders(
        <NurseryCard nursery={nursery} onClick={mockOnClick} />
      );

      const card = screen.getByRole('button', { name: /テスト保育園/ });
      card.click();

      expect(mockOnClick).toHaveBeenCalledWith(nursery);
    });

    test('Enterキーでもカードが操作できる', () => {
      const mockOnClick = vi.fn();
      const nursery = testUtils.createMockNursery();

      renderWithProviders(
        <NurseryCard nursery={nursery} onClick={mockOnClick} />
      );

      const card = screen.getByRole('button', { name: /テスト保育園/ });
      card.focus();
      card.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );

      expect(mockOnClick).toHaveBeenCalledWith(nursery);
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
