import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigation } from './useNavigation';
import { ROUTES } from '../constants/routes';

// React Router関連のモック
const mockNavigate = vi.fn<NavigateFunction>();
const mockLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation(),
  };
});

describe('useNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
  });

  describe('handleNavigation', () => {
    it('正常なナビゲーションが実行される', () => {
      const { result } = renderHook(() => useNavigation());

      act(() => {
        result.current.handleNavigation('/about');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/about', undefined);
    });

    it('ナビゲーションオプション付きで実行される', () => {
      const { result } = renderHook(() => useNavigation());

      act(() => {
        result.current.handleNavigation('/about', { replace: true });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/about', { replace: true });
    });

    it('ナビゲーションエラー時にホームページにフォールバックする', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation failed');
      });

      const { result } = renderHook(() => useNavigation());

      act(() => {
        result.current.handleNavigation('/invalid-path');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Navigation failed:',
        expect.any(Error)
      );
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME, { replace: true });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('isHomePage', () => {
    it('ホームページパス("/")の場合、trueを返す', () => {
      mockLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() => useNavigation());
      expect(result.current.isHomePage()).toBe(true);
    });

    it('空文字パスの場合、trueを返す', () => {
      mockLocation.mockReturnValue({
        pathname: '',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() => useNavigation());
      expect(result.current.isHomePage()).toBe(true);
    });

    it('他のパスの場合、falseを返す', () => {
      mockLocation.mockReturnValue({
        pathname: '/about',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() => useNavigation());
      expect(result.current.isHomePage()).toBe(false);
    });
  });

  describe('isCurrentPath', () => {
    it('現在のパスと一致する場合、trueを返す', () => {
      mockLocation.mockReturnValue({
        pathname: '/about',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() => useNavigation());
      expect(result.current.isCurrentPath('/about')).toBe(true);
    });

    it('現在のパスと異なる場合、falseを返す', () => {
      mockLocation.mockReturnValue({
        pathname: '/about',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() => useNavigation());
      expect(result.current.isCurrentPath('/privacy-policy')).toBe(false);
    });
  });

  describe('isValidNavigationPath', () => {
    it('有効な底部ナビゲーションパスの場合、trueを返す', () => {
      const { result } = renderHook(() => useNavigation());
      expect(result.current.isValidNavigationPath('/')).toBe(true);
    });

    it('有効なDrawerメニューパスの場合、trueを返す', () => {
      const { result } = renderHook(() => useNavigation());
      expect(result.current.isValidNavigationPath('/about')).toBe(true);
    });

    it('アンカーリンクの場合、trueを返す', () => {
      const { result } = renderHook(() => useNavigation());
      expect(result.current.isValidNavigationPath('#menu')).toBe(true);
    });

    it('無効なパスの場合、falseを返す', () => {
      const { result } = renderHook(() => useNavigation());
      expect(result.current.isValidNavigationPath('/invalid-path')).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('現在の場所情報を正しく返す', () => {
      const mockLocationData = {
        pathname: '/about',
        search: '?param=value',
        hash: '#section',
        state: null,
        key: 'default',
      };

      mockLocation.mockReturnValue(mockLocationData);

      const { result } = renderHook(() => useNavigation());
      const locationInfo = result.current.getCurrentLocation();

      expect(locationInfo).toEqual({
        pathname: '/about',
        search: '?param=value',
        hash: '#section',
        isHome: false,
      });
    });

    it('ホームページの場合、isHomeがtrueになる', () => {
      mockLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() => useNavigation());
      const locationInfo = result.current.getCurrentLocation();

      expect(locationInfo.isHome).toBe(true);
    });
  });
});
