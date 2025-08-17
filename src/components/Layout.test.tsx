import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Layout } from './Layout';
import { renderWithProviders } from '../test/test-utils';

describe('Layout', () => {
  describe('基本レイアウト', () => {
    test('ヘッダーにアプリタイトルが表示される', () => {
      renderWithProviders(<Layout />);

      const title = screen.getByRole('heading', {
        name: /保活手帳/i,
      });
      expect(title).toBeInTheDocument();
    });

    test('タイトルがセンター配置されている', () => {
      renderWithProviders(<Layout />);

      const title = screen.getByRole('heading', {
        name: /保活手帳/i,
      });
      expect(title).toHaveStyle({ textAlign: 'center' });
    });

    test('メインコンテンツエリアが存在する', () => {
      renderWithProviders(
        <Layout>
          <div data-testid="test-content">テストコンテンツ</div>
        </Layout>
      );

      const content = screen.getByTestId('test-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('メインコンテンツエリアに適切なランドマークが設定される', () => {
      renderWithProviders(<Layout />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    test('ヘッダーに適切な見出しレベルが設定される', () => {
      renderWithProviders(<Layout />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('保活手帳');
    });
  });
});
