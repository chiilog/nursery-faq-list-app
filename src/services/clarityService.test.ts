import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClarityService, createClarityProjectId } from './clarityService';
import {
  mockGlobalAnalytics,
  cleanupGlobalAnalytics,
} from '../test-utils/mockUtils';

// グローバルmock
beforeEach(() => {
  mockGlobalAnalytics();
});

afterEach(() => {
  cleanupGlobalAnalytics();
});

// 環境変数のモック
vi.mock('import.meta.env', () => ({
  VITE_CLARITY_PROJECT_ID: 'test12345',
  VITE_ANALYTICS_ENABLED: 'true',
  DEV: true,
  MODE: 'test',
}));

describe('createClarityProjectId', () => {
  test('有効なプロジェクトIDを作成できる', () => {
    const result = createClarityProjectId('test12345');
    expect(result).toBe('test12345');
  });

  test('空文字列の場合エラーをthrowする', () => {
    expect(() => createClarityProjectId('')).toThrow(
      'Invalid clarity project ID'
    );
  });

  test('undefinedの場合エラーをthrowする', () => {
    expect(() => createClarityProjectId(undefined)).toThrow(
      'Invalid clarity project ID'
    );
  });

  test('特殊文字を含む場合エラーをthrowする', () => {
    expect(() => createClarityProjectId('test@123')).toThrow(
      'Invalid clarity project ID'
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
    const { result } = renderHook(() => useClarityService());

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.hasConsent).toBe(false);
  });

  test('同意設定により状態が更新される', () => {
    const { result } = renderHook(() => useClarityService());

    act(() => {
      result.current.setConsent(true);
    });

    expect(result.current.hasConsent).toBe(true);
  });

  test('同意取り消しでClarityが停止される', () => {
    const mockClarity = vi.fn();
    window.clarity = mockClarity;

    const { result } = renderHook(() => useClarityService());

    act(() => {
      result.current.setConsent(true);
    });

    act(() => {
      result.current.setConsent(false);
    });

    expect(result.current.hasConsent).toBe(false);
    expect(result.current.isInitialized).toBe(false);
  });

  test('Do Not Track有効時は初期化されない', () => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      writable: true,
    });

    const { result } = renderHook(() => useClarityService());

    act(() => {
      result.current.setConsent(true);
    });

    // Do Not Track有効なので初期化されない
    expect(result.current.isInitialized).toBe(false);
  });

  test('分析無効設定時は初期化されない', () => {
    vi.doMock('import.meta.env', () => ({
      VITE_CLARITY_PROJECT_ID: 'test12345',
      VITE_ANALYTICS_ENABLED: 'false',
      DEV: true,
      MODE: 'test',
    }));

    const { result } = renderHook(() => useClarityService());

    act(() => {
      result.current.setConsent(true);
    });

    expect(result.current.isInitialized).toBe(false);
  });
});
