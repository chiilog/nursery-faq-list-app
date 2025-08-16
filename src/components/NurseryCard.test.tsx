/**
 * 保育園カードコンポーネントのテスト
 * 表示内容、クリックイベント、見学状況の確認
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders, testUtils } from '../test/test-utils';
import { NurseryCard } from './NurseryCard';
import type { Nursery } from '../types/entities';

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

  describe('日付表示（時間制御版）', () => {
    beforeEach(() => {
      // 2025年1月15日 12:00:00に固定（決定論的テスト）
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('過去の見学日には済マークが付く', () => {
      const pastDate = new Date('2025-01-10'); // 5日前
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            visitDate: pastDate,
            status: 'completed',
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('見学日: 2025/1/10 (済)')).toBeInTheDocument();
    });

    test('未来の見学日には済マークが付かない', () => {
      const futureDate = new Date('2025-01-20'); // 5日後
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            visitDate: futureDate,
            status: 'planned',
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('見学日: 2025/1/20')).toBeInTheDocument();
    });

    test('複数セッションがある場合、未来の予定日を優先表示する', () => {
      const pastDate = new Date('2025-01-10'); // 5日前
      const futureDate = new Date('2025-01-20'); // 5日後
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            visitDate: pastDate,
            status: 'completed',
          }),
          testUtils.createMockVisitSession({
            visitDate: futureDate,
            status: 'planned',
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      // 未来の日付が優先され、済マークは付かない
      expect(screen.getByText('見学日: 2025/1/20')).toBeInTheDocument();
    });

    test('今日の日付は済マークが付かない', () => {
      const today = new Date('2025-01-15'); // テスト固定日と同じ
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            visitDate: today,
            status: 'planned',
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('見学日: 2025/1/15')).toBeInTheDocument();
    });
  });

  describe('質問進捗表示', () => {
    test('複数セッションの質問進捗が正しく合計される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            questions: [testUtils.createMockQuestion({ isAnswered: true })],
          }),
          testUtils.createMockVisitSession({
            questions: [
              testUtils.createMockQuestion({ isAnswered: false }),
              testUtils.createMockQuestion({ isAnswered: true }),
            ],
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      // 2/3 = 67%
      expect(screen.getByText('質問進捗: 2/3 (67%)')).toBeInTheDocument();
    });

    test('未回答質問がある場合、進捗がパーセンテージ付きで表示される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            questions: [
              testUtils.createMockQuestion({ isAnswered: true }),
              testUtils.createMockQuestion({ isAnswered: false }),
            ],
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('質問進捗: 1/2 (50%)')).toBeInTheDocument();
    });

    test('全質問完了の場合、完了マークが表示される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            questions: [
              testUtils.createMockQuestion({ isAnswered: true }),
              testUtils.createMockQuestion({ isAnswered: true }),
            ],
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('質問進捗: 2/2 ✓完了')).toBeInTheDocument();
    });

    test('質問が0個の場合、0/0と表示される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            questions: [],
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('質問進捗: 0/0')).toBeInTheDocument();
    });

    test('全質問が未回答の場合、0%で表示される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          testUtils.createMockVisitSession({
            questions: [
              testUtils.createMockQuestion({ isAnswered: false }),
              testUtils.createMockQuestion({ isAnswered: false }),
            ],
          }),
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('質問進捗: 0/2 (0%)')).toBeInTheDocument();
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
        nursery: Nursery
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

  describe('気づきタグ表示', () => {
    test('見学セッションにinsightsがある場合、タグが表示される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          {
            id: 'session1',
            visitDate: new Date('2025-01-20'),
            status: 'planned' as const,
            questions: [],
            insights: ['広い園庭', '先生が親切', '設備が充実'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('広い園庭')).toBeInTheDocument();
      expect(screen.getByText('先生が親切')).toBeInTheDocument();
      expect(screen.getByText('設備が充実')).toBeInTheDocument();
    });

    test('複数セッションのinsightsが重複排除されて最大3つまで表示される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          {
            id: 'session1',
            visitDate: new Date('2025-01-20'),
            status: 'planned' as const,
            questions: [],
            insights: ['広い園庭', '先生が親切'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'session2',
            visitDate: new Date('2025-01-25'),
            status: 'planned' as const,
            questions: [],
            insights: [
              '先生が親切',
              '設備が充実',
              '給食美味しそう',
              '運動場広い',
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('広い園庭')).toBeInTheDocument();
      expect(screen.getByText('先生が親切')).toBeInTheDocument();
      expect(screen.getByText('設備が充実')).toBeInTheDocument();

      // 4つ目以降は表示されない
      expect(screen.queryByText('給食美味しそう')).not.toBeInTheDocument();
      expect(screen.queryByText('運動場広い')).not.toBeInTheDocument();
    });

    test('insightsがない場合はタグが表示されない', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          {
            id: 'session1',
            visitDate: new Date('2025-01-20'),
            status: 'planned' as const,
            questions: [],
            insights: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      // タグは表示されない
      expect(screen.queryByText('広い園庭')).not.toBeInTheDocument();
    });

    test('空文字や空白のみのinsightsは除外される', () => {
      const nursery = testUtils.createMockNursery({
        visitSessions: [
          {
            id: 'session1',
            visitDate: new Date('2025-01-20'),
            status: 'planned' as const,
            questions: [],
            insights: ['', '   ', '広い園庭', '\t\n'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      renderWithProviders(<NurseryCard nursery={nursery} onClick={vi.fn()} />);

      expect(screen.getByText('広い園庭')).toBeInTheDocument();
      // 空白や空文字のタグは表示されない（1つのみ表示される）
      expect(screen.queryByText('   ')).not.toBeInTheDocument();
      expect(screen.queryByText('\t\n')).not.toBeInTheDocument();
    });
  });
});
