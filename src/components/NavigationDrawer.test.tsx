import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router-dom';
import { renderWithProviders } from '../test/test-utils';
import { NavigationDrawer } from './NavigationDrawer';
import {
  getDrawerMenuItemByLabel,
  setupErrorHandlingTest,
} from '../test-utils/navigation';

const mockNavigate = vi.fn<NavigateFunction>();
const mockOnClose = vi.fn<() => void>();

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
    vi.clearAllMocks();
  });

  it('isOpenがtrueの時にメニューが表示される', async () => {
    renderNavigationDrawer({ isOpen: true });

    await screen.findByRole('dialog');
    expect(screen.getByText('メニュー')).toBeInTheDocument();

    // 共通設定から項目を取得してテスト
    const aboutItem = getDrawerMenuItemByLabel('このアプリについて');
    const privacyItem = getDrawerMenuItemByLabel('プライバシーポリシー');

    expect(aboutItem).toBeDefined();
    expect(privacyItem).toBeDefined();
    expect(screen.getByText(aboutItem!.label)).toBeInTheDocument();
    expect(screen.getByText(privacyItem!.label)).toBeInTheDocument();
  });

  it('isOpenがfalseの時にメニューが表示されない', () => {
    renderNavigationDrawer({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('メニュー項目をクリックすると該当ページに遷移し、onCloseが呼ばれる', async () => {
    renderNavigationDrawer();

    await screen.findByRole('dialog');

    const aboutItem = getDrawerMenuItemByLabel('このアプリについて');
    expect(aboutItem).toBeDefined();

    const aboutLink = screen.getByText(aboutItem!.label);
    await user.click(aboutLink);

    expect(mockNavigate).toHaveBeenCalledWith(aboutItem!.path);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('プライバシーポリシーリンクをクリックすると正しいページに遷移し、onCloseが呼ばれる', async () => {
    renderNavigationDrawer();

    await screen.findByRole('dialog');

    const privacyItem = getDrawerMenuItemByLabel('プライバシーポリシー');
    expect(privacyItem).toBeDefined();

    const privacyPolicyLink = screen.getByText(privacyItem!.label);
    await user.click(privacyPolicyLink);

    expect(mockNavigate).toHaveBeenCalledWith(privacyItem!.path);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it.skip('Escapeキーでメニューを閉じることができる', async () => {
    renderNavigationDrawer();

    const dialog = await screen.findByRole('dialog');

    const aboutItem = getDrawerMenuItemByLabel('このアプリについて');
    expect(aboutItem).toBeDefined();
    expect(screen.getByText(aboutItem!.label)).toBeInTheDocument();

    // ChakraUIのDrawerコンポーネントで直接Escapeキーイベントをdispatch
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        charCode: 27,
        bubbles: true,
        cancelable: true,
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('メニューアイテムをクリックで選択できる', async () => {
    renderNavigationDrawer();

    await screen.findByRole('dialog');

    const aboutItem = getDrawerMenuItemByLabel('このアプリについて');
    expect(aboutItem).toBeDefined();

    const aboutMenuItem = screen.getByText(aboutItem!.label);
    await user.click(aboutMenuItem);

    expect(mockNavigate).toHaveBeenCalledWith(aboutItem!.path);
    expect(mockOnClose).toHaveBeenCalled();
  });

  describe('エラーハンドリング', () => {
    it('ナビゲーション失敗時にエラーを適切に処理する', async () => {
      const { restoreMocks } = setupErrorHandlingTest(mockNavigate);

      renderNavigationDrawer();
      await screen.findByRole('dialog');

      const aboutItem = getDrawerMenuItemByLabel('このアプリについて');
      expect(aboutItem).toBeDefined();

      const aboutLink = screen.getByText(aboutItem!.label);

      await user.click(aboutLink);

      // エラーが発生してもアプリがクラッシュしないことを確認
      expect(screen.getByText(aboutItem!.label)).toBeInTheDocument();
      expect(mockOnClose).toHaveBeenCalled();

      // モックを元に戻す
      restoreMocks();
    });
  });
});
