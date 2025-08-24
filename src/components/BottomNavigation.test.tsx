import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router-dom';
import { renderWithProviders } from '../test/test-utils';
import { BottomNavigation } from './BottomNavigation';
import { ROUTES } from '../constants/routes';

const mockNavigate = vi.fn<NavigateFunction>();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderBottomNavigation = (initialPath = '/') => {
  return renderWithProviders(<BottomNavigation />, {
    initialEntries: [initialPath],
  });
};

describe('BottomNavigation', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockNavigate.mockClear();
  });

  it('ホームボタンとメニューボタンが表示される', () => {
    renderBottomNavigation();

    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('メニュー')).toBeInTheDocument();
  });

  it('ホームボタンをクリックするとホームページに遷移する', async () => {
    renderBottomNavigation('/about');

    const homeButton = screen.getByText('ホーム').closest('button');
    if (!homeButton) {
      throw new Error('Home button not found');
    }
    await user.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it('ホームページにいる時、ホームボタンがアクティブ状態になる', () => {
    renderBottomNavigation('/');

    const homeButton = screen.getByText('ホーム');
    const style = window.getComputedStyle(homeButton);
    expect(style.fontWeight).toMatch(/600|semibold/);
  });

  it('メニューボタンをクリックするとDrawer開閉状態が切り替わる', async () => {
    renderBottomNavigation();

    const menuButton = screen.getByRole('button', { name: /メニュー/i });
    expect(menuButton).toBeInTheDocument();

    // メニューボタンをクリックしてドロワーを開く
    await user.click(menuButton);

    // ドロワーが開いている状態でメニューボタンがアクティブになることを確認
    const navMenuText = menuButton.querySelector('p');
    if (!navMenuText) {
      throw new Error('Menu text not found');
    }
    const style = window.getComputedStyle(navMenuText);
    expect(style.fontWeight).toMatch(/600|semibold/);
  });

  describe('エラーハンドリング', () => {
    it('ナビゲーション失敗時にエラーを適切に処理する', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const mockNavigateError = vi
        .fn()
        .mockRejectedValue(new Error('Navigation failed'));

      // 一時的にモックを変更
      const originalMockNavigate = mockNavigate;
      vi.mocked(mockNavigate).mockImplementation(mockNavigateError);

      renderBottomNavigation();
      const homeButton = screen.getByText('ホーム').closest('button');
      if (!homeButton) {
        throw new Error('Home button not found');
      }

      await user.click(homeButton);

      // エラーが発生してもアプリがクラッシュしないことを確認
      expect(screen.getByText('ホーム')).toBeInTheDocument();

      // モックを元に戻す
      vi.mocked(mockNavigate).mockImplementation(originalMockNavigate);
      consoleErrorSpy.mockRestore();
    });
  });
});
