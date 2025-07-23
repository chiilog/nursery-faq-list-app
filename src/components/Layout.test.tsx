import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Layout } from './Layout';
import { MemoryRouter } from 'react-router-dom';

describe('Layout', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
  };

  describe('ナビゲーション要素', () => {
    test('ヘッダーにアプリタイトルが表示される', () => {
      renderWithRouter(<Layout />);

      const title = screen.getByRole('heading', {
        name: /保育園見学質問リスト/i,
      });
      expect(title).toBeInTheDocument();
    });

    test('ホームへのリンクが存在する', () => {
      renderWithRouter(<Layout />);

      const homeLink = screen.getByRole('link', { name: /ホーム/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    test('新規作成ボタンが存在する', () => {
      renderWithRouter(<Layout />);

      const createButton = screen.getByRole('button', { name: /新規作成/i });
      expect(createButton).toBeInTheDocument();
    });

    test('メインコンテンツエリアが存在する', () => {
      renderWithRouter(
        <Layout>
          <div data-testid="test-content">テストコンテンツ</div>
        </Layout>
      );

      const content = screen.getByTestId('test-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('レスポンシブ対応', () => {
    test('モバイルビューでメニューボタンが表示される', () => {
      // ビューポートをモバイルサイズに設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      renderWithRouter(<Layout />);

      const menuButton = screen.getByRole('button', { name: /メニュー/i });
      expect(menuButton).toBeInTheDocument();
    });

    test('デスクトップビューでナビゲーションリンクが直接表示される', () => {
      // ビューポートをデスクトップサイズに設定
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event('resize'));

      renderWithRouter(<Layout />);

      // デスクトップではメニューボタンは非表示
      const menuButton = screen.queryByRole('button', { name: /メニュー/i });
      expect(menuButton).not.toBeInTheDocument();

      // ナビゲーションリンクは直接表示
      const homeLink = screen.getByRole('link', { name: /ホーム/i });
      expect(homeLink).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('ナビゲーション要素に適切なARIAラベルが設定される', () => {
      renderWithRouter(<Layout />);

      const nav = screen.getByRole('navigation', {
        name: /メインナビゲーション/i,
      });
      expect(nav).toBeInTheDocument();
    });

    test('メインコンテンツエリアに適切なランドマークが設定される', () => {
      renderWithRouter(<Layout />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });
});
