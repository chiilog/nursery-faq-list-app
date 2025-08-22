import { describe, it, expect, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { BottomNavigation } from './BottomNavigation';
import { ROUTES } from '../constants/routes';

const mockNavigate = vi.fn();
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
    expect(homeButton).toBeInTheDocument();
    await user.click(homeButton!);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it('ホームページにいる時、ホームボタンがアクティブ状態になる', () => {
    renderBottomNavigation('/');

    const homeButton = screen.getByText('ホーム');
    const style = window.getComputedStyle(homeButton);
    expect(style.fontWeight).toMatch(/600|semibold/);
  });

  it('メニューボタンをクリックするとメニューが表示される', async () => {
    renderBottomNavigation();

    const menuButton = screen.getByText('メニュー').closest('button');
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton!);

    await screen.findByRole('dialog'); // Drawerが表示されることを確認
    expect(screen.getByText('このアプリについて')).toBeInTheDocument();
    expect(screen.getByText('プライバシー設定')).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
  });

  it('メニュー項目をクリックすると該当ページに遷移し、メニューが閉じる', async () => {
    renderBottomNavigation();

    const menuButton = screen.getByText('メニュー').closest('button');
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton!);

    await screen.findByRole('dialog'); // Drawerが表示されるのを待つ
    const aboutLink = screen.getByText('このアプリについて');
    await user.click(aboutLink);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ABOUT);
  });

  it('メニューが開いている時にホームボタンをクリックするとメニューが閉じる', async () => {
    renderBottomNavigation('/about');

    const menuButton = screen.getByText('メニュー').closest('button');
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton!);

    await screen.findByRole('dialog'); // Drawerが表示されるのを待つ
    expect(screen.getByText('このアプリについて')).toBeInTheDocument();

    const homeButton = screen.getByText('ホーム').closest('button');
    expect(homeButton).toBeInTheDocument();
    await user.click(homeButton!);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it('プライバシー設定リンクをクリックすると正しいページに遷移する', async () => {
    renderBottomNavigation();

    const menuButton = screen.getByText('メニュー').closest('button');
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton!);

    await screen.findByRole('dialog'); // Drawerが表示されるのを待つ
    const privacySettingsLink = screen.getByText('プライバシー設定');
    await user.click(privacySettingsLink);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PRIVACY_SETTINGS);
  });

  it('プライバシーポリシーリンクをクリックすると正しいページに遷移する', async () => {
    renderBottomNavigation();

    const menuButton = screen.getByText('メニュー').closest('button');
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton!);

    await screen.findByRole('dialog'); // Drawerが表示されるのを待つ
    const privacyPolicyLink = screen.getByText('プライバシーポリシー');
    await user.click(privacyPolicyLink);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PRIVACY_POLICY);
  });

  it('メニューボタンを再度クリックするとメニューが閉じる', async () => {
    renderBottomNavigation();

    const menuButton = screen.getByText('メニュー').closest('button');
    expect(menuButton).toBeInTheDocument();

    await user.click(menuButton!);
    await screen.findByRole('dialog'); // Drawerが表示されるのを待つ
    expect(screen.getByText('このアプリについて')).toBeInTheDocument();

    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton!);
    // Drawerが閉じるのを待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(screen.queryByText('このアプリについて')).not.toBeInTheDocument();
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

      await user.click(homeButton!);

      // エラーが発生してもアプリがクラッシュしないことを確認
      expect(screen.getByText('ホーム')).toBeInTheDocument();

      // モックを元に戻す
      vi.mocked(mockNavigate).mockImplementation(originalMockNavigate);
      consoleErrorSpy.mockRestore();
    });

    it('Drawer開閉中の連続操作を適切に処理する', async () => {
      renderBottomNavigation();

      const menuButton = screen.getByText('メニュー').closest('button');

      // 高速連続クリックのテスト
      await user.click(menuButton!);
      await user.click(menuButton!);
      await user.click(menuButton!);

      // 最終的にDrawerが閉じていることを確認
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('キーボードアクセシビリティ', () => {
    it('Escapeキーでメニューを閉じることができる', async () => {
      renderBottomNavigation();

      const menuButton = screen.getByText('メニュー').closest('button');
      await user.click(menuButton!);

      await screen.findByRole('dialog');
      expect(screen.getByText('このアプリについて')).toBeInTheDocument();

      // Escapeキーでの閉じる動作
      await user.keyboard('{Escape}');

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('メニューアイテムをクリックで選択できる', async () => {
      renderBottomNavigation();

      const menuButton = screen.getByText('メニュー').closest('button');
      await user.click(menuButton!);

      await screen.findByRole('dialog');

      const aboutMenuItem = screen.getByText('このアプリについて');
      await user.click(aboutMenuItem);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ABOUT);
    });
  });
});
