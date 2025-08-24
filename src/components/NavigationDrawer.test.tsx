import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router-dom';
import { renderWithProviders } from '../test/test-utils';
import {
  NavigationDrawer,
  type NavigationDrawerProps,
} from './NavigationDrawer';
import {
  getDrawerMenuItemByLabel,
  setupErrorHandlingTest,
} from '../test-utils/navigation';

const mockNavigate = vi.fn<NavigateFunction>();
const mockOnClose = vi.fn<NavigationDrawerProps['onClose']>();

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

  const renderResult = renderWithProviders(
    <NavigationDrawer {...defaultProps} />
  );
  return {
    ...renderResult,
    user: userEvent.setup(),
  };
};

describe('NavigationDrawer', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it('isOpen=trueが渡されると、ダイアログとメニュー項目が表示される', async () => {
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

  it('isOpen=falseが渡されると、ダイアログが表示されない', () => {
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

  it('閉じるボタンでメニューを閉じることができる', async () => {
    const { user } = renderNavigationDrawer();

    // ドロワーが表示されていることを確認
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-state', 'open');

    const aboutItem = getDrawerMenuItemByLabel('このアプリについて');
    expect(aboutItem).toBeDefined();
    expect(screen.getByText(aboutItem!.label)).toBeInTheDocument();

    // 閉じるボタンを見つけてクリック
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    // onCloseコールバックが呼ばれることを確認
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  describe('エラーハンドリング', () => {
    it('ナビゲーション失敗時でもDrawerは閉じられ、UIは正常に動作し続ける', async () => {
      const { restoreMocks } = setupErrorHandlingTest(mockNavigate);

      renderNavigationDrawer();
      await screen.findByRole('dialog');

      const aboutItem = getDrawerMenuItemByLabel('このアプリについて');
      expect(aboutItem).toBeDefined();

      const aboutLink = screen.getByText(aboutItem!.label);

      await user.click(aboutLink);

      // onCloseが呼ばれることを確認（エラーが発生してもDrawerは閉じられる）
      expect(mockOnClose).toHaveBeenCalled();

      // UIが正常に動作し続けることを確認
      expect(screen.getByText(aboutItem!.label)).toBeInTheDocument();

      // モックを元に戻す
      restoreMocks();
    });
  });
});
