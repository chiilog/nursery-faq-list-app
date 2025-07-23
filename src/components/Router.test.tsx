import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { AppRouter } from './Router';
import { renderWithProviders } from '../test/testUtils';

describe('AppRouter', () => {
  describe('ルーティング', () => {
    test('ルートパスで質問リスト一覧が表示される', () => {
      renderWithProviders(<AppRouter />);

      const heading = screen.getByRole('heading', { name: /質問リスト一覧/i });
      expect(heading).toBeInTheDocument();
    });

    test('存在しないパスで404ページが表示される', () => {
      // 初期URLを設定
      window.history.pushState({}, '', '/nonexistent');

      renderWithProviders(<AppRouter />);

      const notFoundText = screen.getByText(/ページが見つかりません/i);
      expect(notFoundText).toBeInTheDocument();
    });
  });

  describe('レイアウト統合', () => {
    test('すべてのページでLayoutコンポーネントが使用される', () => {
      renderWithProviders(<AppRouter />);

      // Layoutコンポーネントの要素を確認
      const header = screen.getByRole('heading', {
        name: /保育園見学質問リスト/i,
      });
      const nav = screen.getByRole('navigation', {
        name: /メインナビゲーション/i,
      });
      const main = screen.getByRole('main');

      expect(header).toBeInTheDocument();
      expect(nav).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });
  });
});
