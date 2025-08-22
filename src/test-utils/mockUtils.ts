import { vi } from 'vitest';

export const mockGlobalAnalytics = () => {
  Object.defineProperty(window, 'gtag', {
    value: vi.fn(),
    writable: true,
  });

  Object.defineProperty(window, 'clarity', {
    value: vi.fn(),
    writable: true,
  });
};

export const cleanupGlobalAnalytics = () => {
  delete (window as unknown as { gtag?: unknown; clarity?: unknown }).gtag;
  delete (window as unknown as { gtag?: unknown; clarity?: unknown }).clarity;
};
