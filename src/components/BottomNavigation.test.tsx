import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router-dom';
import { renderWithProviders } from '../test/test-utils';
import { BottomNavigation } from './BottomNavigation';
import {
  getBottomNavigationItemByLabel,
  TEST_NAVIGATION_CONSTANTS,
  setupErrorHandlingTest,
} from '../test-utils/navigation';

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

    // 共通設定から項目を取得してテスト
    const homeItem = getBottomNavigationItemByLabel('ホーム');
    const menuItem = getBottomNavigationItemByLabel('メニュー');

    expect(homeItem).toBeDefined();
    expect(menuItem).toBeDefined();
    expect(screen.getByText(homeItem!.label)).toBeInTheDocument();
    expect(screen.getByText(menuItem!.label)).toBeInTheDocument();
  });

  it('ホームボタンをクリックするとホームページに遷移する', async () => {
    renderBottomNavigation('/about');

    const homeItem = getBottomNavigationItemByLabel('ホーム');
    expect(homeItem).toBeDefined();

    const homeButton = screen.getByText(homeItem!.label).closest('button');
    if (!homeButton) {
      throw new Error('Home button not found');
    }
    await user.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith(homeItem!.path);
  });

  it('ホームページにいる時、ホームボタンがアクティブ状態になる', () => {
    renderBottomNavigation(TEST_NAVIGATION_CONSTANTS.HOME_PATH);

    const homeItem = getBottomNavigationItemByLabel('ホーム');
    expect(homeItem).toBeDefined();

    const homeButton = screen.getByText(homeItem!.label);
    const style = window.getComputedStyle(homeButton);
    expect(style.fontWeight).toMatch(/600|semibold/);
  });

  it('メニューボタンをクリックするとDrawer開閉状態が切り替わる', async () => {
    renderBottomNavigation();

    const menuItem = getBottomNavigationItemByLabel('メニュー');
    expect(menuItem).toBeDefined();

    const menuButton = screen.getByRole('tab', {
      name: new RegExp(menuItem!.label, 'i'),
    });
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
      const { restoreMocks } = setupErrorHandlingTest(mockNavigate);

      renderBottomNavigation();

      const homeItem = getBottomNavigationItemByLabel('ホーム');
      expect(homeItem).toBeDefined();

      const homeButton = screen.getByText(homeItem!.label).closest('button');
      if (!homeButton) {
        throw new Error('Home button not found');
      }

      await user.click(homeButton);

      // エラーが発生してもアプリがクラッシュしないことを確認
      expect(screen.getByText(homeItem!.label)).toBeInTheDocument();

      // モックを元に戻す
      restoreMocks();
    });
  });
});
