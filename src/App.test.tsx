import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from './test/test-utils';
import { createMockScrollTo } from './test/test-helpers';
import { AppRouter } from './components/Router';
import { CookieConsentBanner } from './components/CookieConsentBanner';

// window.scrollTo をモック
createMockScrollTo();

// react-router-dom をモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// PrivacyManager をモック
vi.mock('./services/privacyManager', () => ({
  PrivacyManager: vi.fn().mockImplementation(() => ({
    isConsentValid: vi.fn().mockReturnValue(true), // デフォルトで同意済み（バナー非表示）
    setAllConsent: vi.fn(),
    addChangeListener: vi.fn(() => () => {}),
  })),
}));

describe('App', () => {
  test('アプリのタイトルが表示される', () => {
    renderWithProviders(<AppRouter />);
    expect(screen.getByText('保活手帳')).toBeInTheDocument();
  });

  test('ヘッダーが表示される', () => {
    renderWithProviders(<AppRouter />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('保育園を追加するボタンが表示される', async () => {
    renderWithProviders(<AppRouter />);

    // ローディング完了を待つ
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /保育園を追加する/i })
      ).toBeInTheDocument();
    });
  });

  test('CookieConsentBannerが統合されている（同意済みの場合は非表示）', () => {
    renderWithProviders(
      <>
        <AppRouter />
        <CookieConsentBanner />
      </>
    );

    // PrivacyManagerのモックで同意済み(true)に設定しているため、バナーは表示されない
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
