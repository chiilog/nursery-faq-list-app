/**
 * @description ScrollToTopコンポーネントのテスト
 * ページ遷移時のスクロール位置リセット機能をテストします
 */

import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScrollToTop } from './ScrollToTop';
import { createMockScrollTo } from '../../test/test-helpers';

// window.scrollToをモック化
const mockScrollTo = createMockScrollTo();

// useLocationをモック化してpathnameの変更をシミュレート
const mockUseLocation = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

describe('ScrollToTop', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
    mockUseLocation.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('初回レンダリング時にスクロールを一番上にリセットする', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });

    render(<ScrollToTop />);

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('pathname が変更されたときにスクロールを一番上にリセットする', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });

    const { rerender } = render(<ScrollToTop />);

    // 初回レンダリング
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // pathname変更
    mockUseLocation.mockReturnValue({ pathname: '/about' });
    rerender(<ScrollToTop />);

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
  });

  it('何もレンダリングしない（nullを返す）', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });

    const { container } = render(<ScrollToTop />);

    expect(container.firstChild).toBeNull();
  });

  it('複数回のパス変更でそれぞれスクロールリセットが実行される', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });

    const { rerender } = render(<ScrollToTop />);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // /about への変更
    mockUseLocation.mockReturnValue({ pathname: '/about' });
    rerender(<ScrollToTop />);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);

    // /privacy-policy への変更
    mockUseLocation.mockReturnValue({ pathname: '/privacy-policy' });
    rerender(<ScrollToTop />);
    expect(mockScrollTo).toHaveBeenCalledTimes(3);

    // すべての呼び出しで同じ引数が渡されている
    expect(mockScrollTo).toHaveBeenNthCalledWith(1, 0, 0);
    expect(mockScrollTo).toHaveBeenNthCalledWith(2, 0, 0);
    expect(mockScrollTo).toHaveBeenNthCalledWith(3, 0, 0);
  });

  it('同じpathnameの場合はスクロールリセットが追加で実行されない', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });

    const { rerender } = render(<ScrollToTop />);

    // 初回レンダリング
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // 同じパス名で再レンダリング
    mockUseLocation.mockReturnValue({ pathname: '/' });
    rerender(<ScrollToTop />);

    // 呼び出し回数は変わらない（useEffectの依存配列により実行されない）
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('クエリパラメータやハッシュが変更されてもスクロールリセットが実行される', () => {
    mockUseLocation.mockReturnValue({ pathname: '/page' });

    const { rerender } = render(<ScrollToTop />);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    // クエリパラメータ付きの同じパス
    mockUseLocation.mockReturnValue({ pathname: '/page?param=value' });
    rerender(<ScrollToTop />);
    expect(mockScrollTo).toHaveBeenCalledTimes(2);

    // ハッシュ付きのパス
    mockUseLocation.mockReturnValue({ pathname: '/page#section' });
    rerender(<ScrollToTop />);
    expect(mockScrollTo).toHaveBeenCalledTimes(3);
  });
});
