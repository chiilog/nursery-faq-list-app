/**
 * @description CookieConsentBanner コンポーネントのテスト
 */

import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { CookieConsentBanner } from './CookieConsentBanner';
import type { UseCookieConsentReturn } from '../hooks/useCookieConsent';

// useCookieConsentフックのモック
const setConsentMock = vi.fn();
vi.mock('../hooks/useCookieConsent', () => ({
  useCookieConsent: vi.fn(() => ({
    consent: null,
    setConsent: setConsentMock,
    loading: false,
  })),
}));

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('同意がない場合にバナーが表示される', () => {
    renderWithProviders(<CookieConsentBanner />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('クッキーの使用について')).toBeInTheDocument();
  });

  it('同意ボタンをクリックするとバナーが非表示になる', async () => {
    const user = userEvent.setup();
    const { useCookieConsent } = await import('../hooks/useCookieConsent');
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

  it('拒否ボタンをクリックするとバナーが非表示になる', async () => {
    const user = userEvent.setup();
    const { useCookieConsent } = await import('../hooks/useCookieConsent');
    const { rerender } = renderWithProviders(<CookieConsentBanner />);

    const rejectButton = screen.getByRole('button', { name: '拒否する' });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(setConsentMock).toHaveBeenCalledWith(false);
    });

    // consent が false になった状態をモックして再レンダーし、非表示を検証
    vi.mocked(useCookieConsent).mockReturnValue({
      consent: false,
      setConsent: setConsentMock,
      loading: false,
    } satisfies UseCookieConsentReturn);
    rerender(<CookieConsentBanner />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('同意済みの場合はバナーが表示されない', async () => {
    const { useCookieConsent } = await import('../hooks/useCookieConsent');

    vi.mocked(useCookieConsent).mockReturnValue({
      consent: true,
      setConsent: setConsentMock,
      loading: false,
    } satisfies UseCookieConsentReturn);

    renderWithProviders(<CookieConsentBanner />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('プライバシーポリシーへのリンクが存在する', () => {
    renderWithProviders(<CookieConsentBanner />);

    const privacyLink = screen.getByRole('link', {
      name: /プライバシーポリシー/i,
    });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
  });
});
