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
});
