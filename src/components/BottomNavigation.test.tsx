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

  it('初期表示時に、ホームボタンとメニューボタンが表示される', () => {
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

    const homeButton = screen.getByRole('tab', { name: /ホーム/ });
    await user.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith(homeItem!.path);
  });

  it('ホームパス（/）にアクセスした時、ホームボタンがアクティブ状態になる', () => {
    renderBottomNavigation(TEST_NAVIGATION_CONSTANTS.HOME_PATH);

    const homeItem = getBottomNavigationItemByLabel('ホーム');
    expect(homeItem).toBeDefined();

    const homeButton = screen.getByRole('tab', { name: /ホーム/ });
    expect(homeButton).toHaveAttribute('aria-current', 'page');
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

    // Drawerが実際に開いたかを確認（data-state属性で判定）
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(menuButton).toHaveAttribute('aria-current', 'page');

    // 再度クリックして閉じることを確認
    await user.click(menuButton);
    expect(dialog).toHaveAttribute('data-state', 'closed');
  });

  describe('エラーハンドリング', () => {
    it('ナビゲーション失敗時でもUIは正常に動作し続ける', async () => {
      const { restoreMocks } = setupErrorHandlingTest(mockNavigate);

      renderBottomNavigation();

      const homeItem = getBottomNavigationItemByLabel('ホーム');
      expect(homeItem).toBeDefined();

      const homeButton = screen.getByRole('tab', { name: /ホーム/ });

      await user.click(homeButton);

      // UIが正常に動作し続けることを確認（エラーが発生してもクラッシュしない）
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toBeEnabled();
      expect(screen.getByText(homeItem!.label)).toBeInTheDocument();

      // モックを元に戻す
      restoreMocks();
    });
  });
});
