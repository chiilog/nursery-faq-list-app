import '@testing-library/jest-dom';

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
