import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateNurseryFlow } from './useCreateNurseryFlow';

describe('useCreateNurseryFlow', () => {
  it('初期状態ではisCreatingがfalse', () => {
    const { result } = renderHook(() => useCreateNurseryFlow());

    expect(result.current.isCreating).toBe(false);
  });

  it('startCreatingを呼ぶとisCreatingがtrueになる', () => {
    const { result } = renderHook(() => useCreateNurseryFlow());

    act(() => {
      result.current.startCreating();
    });

    expect(result.current.isCreating).toBe(true);
  });

  it('stopCreatingを呼ぶとisCreatingがfalseになる', () => {
    const { result } = renderHook(() => useCreateNurseryFlow());

    // まずtrueにしてから
    act(() => {
      result.current.startCreating();
    });
    expect(result.current.isCreating).toBe(true);

    // falseにする
    act(() => {
      result.current.stopCreating();
    });
    expect(result.current.isCreating).toBe(false);
  });

  it('複数回呼び出しても正常に動作する', () => {
    const { result } = renderHook(() => useCreateNurseryFlow());

    // 複数回startCreating
    act(() => {
      result.current.startCreating();
      result.current.startCreating();
    });
    expect(result.current.isCreating).toBe(true);

    // 複数回stopCreating
    act(() => {
      result.current.stopCreating();
      result.current.stopCreating();
    });
    expect(result.current.isCreating).toBe(false);
  });

  it('必要な関数がすべて返される', () => {
    const { result } = renderHook(() => useCreateNurseryFlow());

    expect(typeof result.current.isCreating).toBe('boolean');
    expect(typeof result.current.startCreating).toBe('function');
    expect(typeof result.current.stopCreating).toBe('function');
  });
});
