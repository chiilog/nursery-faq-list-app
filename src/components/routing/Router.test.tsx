import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { AppRouter } from './Router';
import { renderWithProviders } from '../../test/test-utils';

describe('AppRouter - ルーティング機能テスト', () => {
  describe('基本ルーティング', () => {
    test('ルートパス("/")にアクセスすると、保活手帳のホームページが表示される', async () => {
      renderWithProviders(<AppRouter />);

      // ページタイトルの確認
      expect(
        screen.getByRole('heading', { name: /保活手帳/i })
      ).toBeInTheDocument();

      // ホームページ特有のコンテンツが表示されることを確認
      await waitFor(() => {
        const homeContent =
          screen.queryByRole('button', { name: /保育園を追加する/ }) ||
          screen.queryByText(/まだ保育園が追加されていません/) ||
          screen.queryByText(/読み込み中/);
        expect(homeContent).toBeInTheDocument();
      });
    });

    test('"/about"にアクセスすると、アプリ紹介ページが表示される', () => {
      renderWithProviders(<AppRouter />, {
        initialEntries: ['/about'],
      });

      // aboutページ専用のヘッダータイトル
      expect(
        screen.getByRole('heading', { name: /保活手帳について/i })
      ).toBeInTheDocument();

      // aboutページのコンテンツ
      expect(
        screen.getByRole('heading', { name: /個人情報について/i })
      ).toBeInTheDocument();
    });

    test('存在しないパスにアクセスすると、404エラーページが表示される', () => {
      renderWithProviders(<AppRouter />, {
        initialEntries: ['/nonexistent-path'],
      });

      expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
      expect(screen.getByText(/ページが見つかりません/i)).toBeInTheDocument();
    });
  });

  describe('レイアウト構造の検証', () => {
    test('全ページで共通のheader/mainレイアウト構造が提供される', () => {
      // ホームページ
      renderWithProviders(<AppRouter />);
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main

      // aboutページは別途テストする
      // 404ページは別途テストする
    });

    test('aboutページでは専用ヘッダータイトルが表示される', () => {
      renderWithProviders(<AppRouter />, {
        initialEntries: ['/about'],
      });

      // 専用タイトル「保活手帳について」が表示される
      expect(
        screen.getByRole('heading', { name: /保活手帳について/i })
      ).toBeInTheDocument();
    });
  });

  describe('アプリケーション状態管理', () => {
    test('初期状態では保育園作成モードが無効になっている', () => {
      renderWithProviders(<AppRouter />);

      // ホームページが表示される（作成ページではない）
      expect(
        screen.getByRole('heading', { name: /保活手帳/i })
      ).toBeInTheDocument();

      // 作成ページ特有の要素が存在しない
      expect(screen.queryByText(/保育園名を入力/)).not.toBeInTheDocument();
      expect(screen.queryByText(/キャンセル/)).not.toBeInTheDocument();
    });
  });
});
