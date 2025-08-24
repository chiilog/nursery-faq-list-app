import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router-dom';
import { renderWithProviders } from '../test/test-utils';
import { NavigationDrawer } from './NavigationDrawer';
import { ROUTES } from '../constants/routes';

const mockNavigate = vi.fn<NavigateFunction>();
const mockOnClose = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderNavigationDrawer = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    ...props,
  };

  return renderWithProviders(<NavigationDrawer {...defaultProps} />);
};

describe('NavigationDrawer', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockNavigate.mockClear();
    mockOnClose.mockClear();
  });

  it('isOpenがtrueの時にメニューが表示される', async () => {
    renderNavigationDrawer({ isOpen: true });

    await screen.findByRole('dialog');
    expect(screen.getByText('メニュー')).toBeInTheDocument();
    expect(screen.getByText('このアプリについて')).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
  });

  it('isOpenがfalseの時にメニューが表示されない', () => {
    renderNavigationDrawer({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('メニュー項目をクリックすると該当ページに遷移し、onCloseが呼ばれる', async () => {
    renderNavigationDrawer();

    await screen.findByRole('dialog');
    const aboutLink = screen.getByText('このアプリについて');
    await user.click(aboutLink);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ABOUT);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('プライバシーポリシーリンクをクリックすると正しいページに遷移し、onCloseが呼ばれる', async () => {
    renderNavigationDrawer();

    await screen.findByRole('dialog');
    const privacyPolicyLink = screen.getByText('プライバシーポリシー');
    await user.click(privacyPolicyLink);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PRIVACY_POLICY);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('Escapeキーでメニューを閉じることができる', async () => {
    renderNavigationDrawer();

    await screen.findByRole('dialog');
    expect(screen.getByText('このアプリについて')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('メニューアイテムをクリックで選択できる', async () => {
    renderNavigationDrawer();

    await screen.findByRole('dialog');

    const aboutMenuItem = screen.getByText('このアプリについて');
    await user.click(aboutMenuItem);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ABOUT);
    expect(mockOnClose).toHaveBeenCalled();
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

      renderNavigationDrawer();
      await screen.findByRole('dialog');
      const aboutLink = screen.getByText('このアプリについて');

      await user.click(aboutLink);

      // エラーが発生してもアプリがクラッシュしないことを確認
      expect(screen.getByText('このアプリについて')).toBeInTheDocument();
      expect(mockOnClose).toHaveBeenCalled();

      // モックを元に戻す
      vi.mocked(mockNavigate).mockImplementation(originalMockNavigate);
      consoleErrorSpy.mockRestore();
    });
  });
});
