/**
 * @description CookieConsentBanner コンポーネントのテスト
 */

import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { CookieConsentBanner } from './CookieConsentBanner';
import type { UseCookieConsentReturn } from '../hooks/useCookieConsent';
import { useCookieConsent } from '../hooks/useCookieConsent';

// useCookieConsentフックのモック
const setConsentMock = vi.fn();

vi.mock('../hooks/useCookieConsent', () => {
  return {
    useCookieConsent: vi.fn(() => ({
      consent: null,
      setConsent: vi.fn(),
      loading: false,
    })),
  };
});

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // デフォルトではconsentがnull（同意が必要な状態）に設定
    vi.mocked(useCookieConsent).mockReturnValue({
      consent: null,
      setConsent: setConsentMock,
      loading: false,
    });
  });

  it('同意がない場合にバナーが表示される', () => {
    renderWithProviders(<CookieConsentBanner />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('クッキーの使用について')).toBeInTheDocument();
  });

  it('同意ボタンをクリックするとバナーが非表示になる', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(<CookieConsentBanner />);

    const acceptButton = screen.getByRole('button', { name: '同意する' });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(setConsentMock).toHaveBeenCalledWith(true);
    });

    // consent が true になった状態をモックして再レンダーし、非表示を検証
    vi.mocked(useCookieConsent).mockReturnValue({
      consent: true,
      setConsent: setConsentMock,
      loading: false,
    } satisfies UseCookieConsentReturn);
    rerender(<CookieConsentBanner />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('拒否ボタンをクリックするとsetConsentが呼ばれる', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CookieConsentBanner />);

    const rejectButton = screen.getByRole('button', { name: '拒否する' });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(setConsentMock).toHaveBeenCalledWith(false);
    });
  });

  it('同意済みの場合はバナーが表示されない', () => {
    // 同意済みの状態でテスト
    vi.mocked(useCookieConsent).mockReturnValue({
      consent: true,
      setConsent: setConsentMock,
      loading: false,
    });

    renderWithProviders(<CookieConsentBanner />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('プライバシーポリシーへのリンクが存在する', () => {
    renderWithProviders(<CookieConsentBanner />);

    const privacyLink = screen.getByRole('link', {
      name: 'プライバシーポリシー',
    });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
  });
});
