import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomTemplates } from './useCustomTemplates';
import {
  getCustomTemplates,
  saveCustomTemplate,
} from '../../services/template/templateService';
import type { Template } from '../../types/entities';

// モックの設定
vi.mock('../../services/template/templateService', () => ({
  getCustomTemplates: vi.fn(),
  saveCustomTemplate: vi.fn(),
}));
vi.mock('../../utils/errorHandler');

describe('useCustomTemplates', () => {
  const mockGetCustomTemplates = vi.mocked(getCustomTemplates);
  const mockSaveCustomTemplate = vi.mocked(saveCustomTemplate);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    test('customTemplatesは空配列で初期化される', () => {
      const { result } = renderHook(() => useCustomTemplates());

      expect(result.current.customTemplates).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadTemplates', () => {
    test('カスタムテンプレートを正常に読み込める', () => {
      const mockCustomTemplates: Template[] = [
        {
          id: 'custom-1',
          name: 'カスタムテンプレート1',
          questions: ['質問1', '質問2'],
          isSystem: false,
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetCustomTemplates.mockReturnValue(mockCustomTemplates);

      const { result } = renderHook(() => useCustomTemplates());

      act(() => {
        result.current.loadTemplates();
      });

      expect(result.current.customTemplates).toEqual(mockCustomTemplates);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetCustomTemplates).toHaveBeenCalledTimes(1);
    });

    test('空の配列が返される（将来実装予定）', () => {
      mockGetCustomTemplates.mockReturnValue([]);

      const { result } = renderHook(() => useCustomTemplates());

      act(() => {
        result.current.loadTemplates();
      });

      expect(result.current.customTemplates).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('saveTemplate', () => {
    test('新しいテンプレートを保存できる', () => {
      const templateData = {
        name: 'テストテンプレート',
        questions: ['質問1', '質問2'],
      };

      mockGetCustomTemplates.mockReturnValue([]);

      const { result } = renderHook(() => useCustomTemplates());

      let savedTemplate: Template | undefined;
      act(() => {
        savedTemplate = result.current.saveTemplate(templateData);
      });

      expect(savedTemplate).toEqual(
        expect.objectContaining({
          name: templateData.name,
          questions: templateData.questions,
          isSystem: false,
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );

      expect(mockSaveCustomTemplate).toHaveBeenCalledWith({
        name: templateData.name,
        questions: templateData.questions,
        createdBy: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('関数の参照安定性', () => {
    test('loadTemplates関数の参照が安定している', () => {
      const { result, rerender } = renderHook(() => useCustomTemplates());

      const initialLoadTemplates = result.current.loadTemplates;

      rerender();

      expect(result.current.loadTemplates).toBe(initialLoadTemplates);
    });

    test('saveTemplate関数の参照が安定している', () => {
      const { result, rerender } = renderHook(() => useCustomTemplates());

      const initialSaveTemplate = result.current.saveTemplate;

      rerender();

      expect(result.current.saveTemplate).toBe(initialSaveTemplate);
    });
  });
});
