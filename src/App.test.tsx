import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from './test/test-utils';
import { AppRouter } from './components/routing/Router';
import { CookieConsentBanner } from './components/features/cookie-consent/CookieConsentBanner';

// react-router-dom をモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// useCookieConsent を再定義（カスタムの設定が必要なため）
vi.mock('./hooks/useCookieConsent', () => ({
  useCookieConsent: () => ({
    consent: true, // デフォルトで同意済み（バナー非表示）
    setConsent: vi.fn(),
    loading: false,
  }),
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

    // useCookieConsentのモックで同意済み(true)に設定しているため、バナーは表示されない
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
