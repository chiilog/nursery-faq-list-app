import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Analytics関連のモック（トップレベルでホイストされる）
vi.mock('../services/ga4Service', async () => {
  const actual = await vi.importActual<typeof import('../services/ga4Service')>(
    '../services/ga4Service'
  );
  return {
    ...actual,
    // useGA4Service だけ差し替え。他のエクスポート（resetGA4ServiceInstance など）は実体のまま。
    useGA4Service: vi.fn(() => ({
      isEnabled: false,
      hasConsent: false,
      setConsent: vi.fn(),
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
    })),
  };
});

vi.mock('../services/clarityService', () => ({
  createClarityProjectId: vi.fn((id: string | null | undefined) => {
    if (id === undefined || id === null) {
      throw new Error('Clarity project ID is required');
    }
    const normalized = id.trim();
    if (normalized === '') {
      throw new Error('Clarity project ID cannot be empty');
    }
    if (!/^[A-Za-z0-9]+$/.test(normalized)) {
      throw new Error('Clarity project ID contains invalid characters');
    }
    return normalized;
  }),
  useClarityService: vi.fn(() => ({
    isInitialized: false,
    hasConsent: false,
    setConsent: vi.fn(),
  })),
  clarityService: {
    trackEvent: vi.fn(),
    initialize: vi.fn(),
    setConsent: vi.fn(),
  },
}));

vi.mock('../hooks/useCookieConsent', () => ({
  useCookieConsent: vi.fn(() => ({
    consent: true,
    setConsent: vi.fn(),
  })),
}));

// ResizeObserverのモック
Object.defineProperty(globalThis, 'ResizeObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
});

// window.matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => {
    // ビューポート幅に基づいてマッチを判定
    const width = window.innerWidth || 1024; // デフォルトはデスクトップサイズ

    // Chakra UIのブレークポイント
    const breakpoints = {
      sm: 480,
      md: 768,
      lg: 992,
      xl: 1280,
    };

    // クエリをパース（簡易的な実装）
    let matches = false;
    if (query.includes('min-width: 768px')) {
      matches = width >= breakpoints.md;
    } else if (query.includes('min-width: 480px')) {
      matches = width >= breakpoints.sm;
    } else if (query.includes('min-width: 992px')) {
      matches = width >= breakpoints.lg;
    } else if (query.includes('min-width: 1280px')) {
      matches = width >= breakpoints.xl;
    }

    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList;
  }),
});
