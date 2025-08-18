import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithChakra } from './test/test-utils';
import App from './App';

// window.scrollTo をモック
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
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
    renderWithChakra(<App />);
    expect(screen.getByText('保活手帳')).toBeInTheDocument();
  });

  test('ヘッダーが表示される', () => {
    renderWithChakra(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('保育園を追加するボタンが表示される', async () => {
    renderWithChakra(<App />);

    // ローディング完了を待つ
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /保育園を追加する/i })
      ).toBeInTheDocument();
    });
  });

  test('CookieConsentBannerが統合されている（同意済みの場合は非表示）', () => {
    renderWithChakra(<App />);

    // PrivacyManagerのモックで同意済み(true)に設定しているため、バナーは表示されない
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
