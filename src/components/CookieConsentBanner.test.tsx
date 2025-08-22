/**
 * @description CookieConsentBanner コンポーネントのテスト
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import { CookieConsentBanner } from './CookieConsentBanner';

// useAnalyticsフックのモック
vi.mock('../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({
    ga4: {
      isEnabled: false,
      hasConsent: false,
      setConsent: vi.fn(),
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
    },
    clarity: {
      isInitialized: false,
      hasConsent: false,
      setConsent: vi.fn(),
    },
    setAnalyticsConsent: vi.fn(),
    hasAnalyticsConsent: false,
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
    const { useAnalytics } = await import('../hooks/useAnalytics');
    const mockSetAnalyticsConsent = vi.fn();

    vi.mocked(useAnalytics).mockReturnValue({
      ga4: {
        isEnabled: false,
        hasConsent: false,
        setConsent: vi.fn(),
        trackEvent: vi.fn(),
        trackPageView: vi.fn(),
      },
      clarity: {
        isInitialized: false,
        hasConsent: false,
        setConsent: vi.fn(),
      },
      setAnalyticsConsent: mockSetAnalyticsConsent,
      hasAnalyticsConsent: false,
    });

    renderWithProviders(<CookieConsentBanner />);

    const acceptButton = screen.getByRole('button', { name: '同意する' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockSetAnalyticsConsent).toHaveBeenCalledWith(true);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('拒否ボタンをクリックするとバナーが非表示になる', async () => {
    const { useAnalytics } = await import('../hooks/useAnalytics');
    const mockSetAnalyticsConsent = vi.fn();

    vi.mocked(useAnalytics).mockReturnValue({
      ga4: {
        isEnabled: false,
        hasConsent: false,
        setConsent: vi.fn(),
        trackEvent: vi.fn(),
        trackPageView: vi.fn(),
      },
      clarity: {
        isInitialized: false,
        hasConsent: false,
        setConsent: vi.fn(),
      },
      setAnalyticsConsent: mockSetAnalyticsConsent,
      hasAnalyticsConsent: false,
    });

    renderWithProviders(<CookieConsentBanner />);

    const rejectButton = screen.getByRole('button', { name: '拒否する' });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(mockSetAnalyticsConsent).toHaveBeenCalledWith(false);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('同意済みの場合はバナーが表示されない', async () => {
    const { useAnalytics } = await import('../hooks/useAnalytics');

    vi.mocked(useAnalytics).mockReturnValue({
      ga4: {
        isEnabled: true,
        hasConsent: true,
        setConsent: vi.fn(),
        trackEvent: vi.fn(),
        trackPageView: vi.fn(),
      },
      clarity: {
        isInitialized: true,
        hasConsent: true,
        setConsent: vi.fn(),
      },
      setAnalyticsConsent: vi.fn(),
      hasAnalyticsConsent: true,
    });

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

  it('設定変更へのリンクが存在する', () => {
    renderWithProviders(<CookieConsentBanner />);

    const settingsLink = screen.getByRole('link', { name: /設定を変更/i });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute('href', '/privacy-settings');
  });
});
