import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  mockGlobalAnalytics,
  cleanupGlobalAnalytics,
} from '../test-utils/mockUtils';

// モックを先に解除して実際の実装をインポート
vi.unmock('./clarityService');

// テスト用の実装を直接インポート
import * as clarityService from './clarityService';

// グローバルmock
beforeEach(() => {
  mockGlobalAnalytics();
});

afterEach(() => {
  cleanupGlobalAnalytics();
});

// 環境変数のスタブ
beforeEach(() => {
  vi.stubEnv('VITE_CLARITY_PROJECT_ID', 'test12345');
  vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true');
  // @ts-expect-error - vi.stubEnvは環境変数を文字列として設定するため
  vi.stubEnv('DEV', 'true');
  vi.stubEnv('MODE', 'test');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createClarityProjectId', () => {
  test('有効なプロジェクトIDを作成できる', () => {
    const result = clarityService.createClarityProjectId('test12345');
    expect(result).toBe('test12345');
  });

  test('空文字列の場合エラーをthrowする', () => {
    expect(() => clarityService.createClarityProjectId('')).toThrow(
      'Clarity project ID cannot be empty'
    );
  });

  test('undefinedの場合エラーをthrowする', () => {
    expect(() =>
      clarityService.createClarityProjectId(undefined as any)
    ).toThrow('Clarity project ID is required');
  });

  test('特殊文字を含む場合エラーをthrowする', () => {
    expect(() => clarityService.createClarityProjectId('test@123')).toThrow(
      'Clarity project ID contains invalid characters'
    );
  });
});

describe('useClarityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.clarity;
    // DOMをクリア
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('初期状態では未初期化で同意なし', () => {
    const { result } = renderHook(() => clarityService.useClarityService());

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.hasConsent).toBe(false);
  });

  test('同意設定により状態が更新される', async () => {
    const { result } = renderHook(() => clarityService.useClarityService());

    act(() => {
      result.current.setConsent(true);
    });

    await waitFor(() => {
      expect(result.current.hasConsent).toBe(true);
    });
  });

  test('同意取り消しでClarityが停止される', async () => {
    const mockClarity = vi.fn();
    window.clarity = mockClarity;

    const { result } = renderHook(() => clarityService.useClarityService());

    act(() => {
      result.current.setConsent(true);
    });

    await waitFor(() => {
      expect(result.current.hasConsent).toBe(true);
    });

    act(() => {
      result.current.setConsent(false);
    });

    await waitFor(() => {
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isInitialized).toBe(false);
    });
  });

  test('Do Not Track有効時は初期化されない', async () => {
    const originalDoNotTrack = Object.getOwnPropertyDescriptor(
      navigator,
      'doNotTrack'
    );

    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => clarityService.useClarityService());

    act(() => {
      result.current.setConsent(true);
    });

    // Do Not Track有効なので初期化されない
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(false);
    });

    // 復元
    if (originalDoNotTrack) {
      Object.defineProperty(navigator, 'doNotTrack', originalDoNotTrack);
    } else {
      // @ts-expect-error - 元々存在しなかったプロパティを削除
      delete navigator.doNotTrack;
    }
  });

  test('分析無効設定時は初期化されない', async () => {
    vi.stubEnv('VITE_ANALYTICS_ENABLED', 'false');
    vi.resetModules();
    const clarityServiceDisabled = await import('./clarityService');
    const { result } = renderHook(() =>
      clarityServiceDisabled.useClarityService()
    );

    act(() => {
      result.current.setConsent(true);
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(false);
    });
  });
});
