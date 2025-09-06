import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTemplate } from './useTemplate';
import { useSystemTemplates } from './useSystemTemplates';
import { useCustomTemplates } from './useCustomTemplates';
import { useTemplateApplication } from './useTemplateApplication';
import type { Template } from '../../types/entities';

// モックの設定
vi.mock('./useSystemTemplates');
vi.mock('./useCustomTemplates');
vi.mock('./useTemplateApplication');

describe('useTemplate', () => {
  const mockSystemTemplate: Template = {
    id: 'system-1',
    name: 'システムテンプレート1',
    questions: ['質問1', '質問2'],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomTemplate: Template = {
    id: 'custom-1',
    name: 'カスタムテンプレート1',
    questions: ['カスタム質問1'],
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApplyTemplate =
    vi.fn<ReturnType<typeof useTemplateApplication>['applyTemplate']>();
  const mockSaveTemplate =
    vi.fn<ReturnType<typeof useCustomTemplates>['saveTemplate']>();
  const mockLoadTemplates =
    vi.fn<ReturnType<typeof useSystemTemplates>['loadTemplates']>();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    vi.mocked(useSystemTemplates).mockReturnValue({
      templates: [mockSystemTemplate],
      loading: false,
      error: null,
      loadTemplates: mockLoadTemplates,
    });

    vi.mocked(useCustomTemplates).mockReturnValue({
      customTemplates: [mockCustomTemplate],
      loading: false,
      error: null,
      saveTemplate: mockSaveTemplate,
      loadTemplates: vi.fn(),
    });

    vi.mocked(useTemplateApplication).mockReturnValue({
      isApplying: false,
      applyTemplate: mockApplyTemplate,
    });
  });

  describe('テンプレート統合', () => {
    test('システムテンプレートとカスタムテンプレートを統合して取得できる', () => {
      const { result } = renderHook(() => useTemplate());

      const allTemplates = result.current.getAllTemplates();

      expect(allTemplates).toHaveLength(2);
      expect(allTemplates[0]).toEqual(mockSystemTemplate);
      expect(allTemplates[1]).toEqual(mockCustomTemplate);
    });

    test('全てのテンプレートを取得できる（getTemplates）', () => {
      const { result } = renderHook(() => useTemplate());

      const templates = result.current.getTemplates();

      expect(templates).toHaveLength(2);
      expect(templates).toContain(mockSystemTemplate);
      expect(templates).toContain(mockCustomTemplate);
    });

    test('システムテンプレートのみを取得できる', () => {
      const { result } = renderHook(() => useTemplate());

      const systemTemplates = result.current.getTemplates(false);

      expect(systemTemplates).toHaveLength(1);
      expect(systemTemplates[0]).toEqual(mockSystemTemplate);
      expect(systemTemplates[0].isSystem).toBe(true);
    });

    test('カスタムテンプレートのみを取得できる', () => {
      const { result } = renderHook(() => useTemplate());

      const customTemplates = result.current.getTemplates(true);

      expect(customTemplates).toHaveLength(1);
      expect(customTemplates[0]).toEqual(mockCustomTemplate);
      expect(customTemplates[0].isSystem).toBe(false);
    });
  });

  describe('テンプレート存在確認', () => {
    test('質問があるテンプレートが存在する場合はtrueを返す', () => {
      const { result } = renderHook(() => useTemplate());

      expect(result.current.hasTemplates()).toBe(true);
      expect(result.current.hasTemplates(false)).toBe(true); // システム
      expect(result.current.hasTemplates(true)).toBe(true); // カスタム
    });

    test('質問が空のテンプレートはカウントされない', () => {
      const emptyTemplate: Template = {
        ...mockSystemTemplate,
        questions: [],
      };

      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [emptyTemplate],
        loading: false,
        error: null,
        loadTemplates: mockLoadTemplates,
      });

      vi.mocked(useCustomTemplates).mockReturnValue({
        customTemplates: [],
        loading: false,
        error: null,
        saveTemplate: mockSaveTemplate,
        loadTemplates: vi.fn(),
      });

      const { result } = renderHook(() => useTemplate());

      expect(result.current.hasTemplates()).toBe(false);
    });

    test('テンプレートが存在しない場合はfalseを返す', () => {
      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [],
        loading: false,
        error: null,
        loadTemplates: mockLoadTemplates,
      });

      vi.mocked(useCustomTemplates).mockReturnValue({
        customTemplates: [],
        loading: false,
        error: null,
        saveTemplate: mockSaveTemplate,
        loadTemplates: vi.fn(),
      });

      const { result } = renderHook(() => useTemplate());

      expect(result.current.hasTemplates()).toBe(false);
    });
  });

  describe('テンプレート統計', () => {
    test('テンプレートの統計情報を正しく計算する', () => {
      const { result } = renderHook(() => useTemplate());

      expect(result.current.templateStats).toEqual({
        total: 2,
        system: 1,
        custom: 1,
      });
    });

    test('テンプレートが存在しない場合の統計情報', () => {
      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [],
        loading: false,
        error: null,
        loadTemplates: mockLoadTemplates,
      });

      vi.mocked(useCustomTemplates).mockReturnValue({
        customTemplates: [],
        loading: false,
        error: null,
        saveTemplate: mockSaveTemplate,
        loadTemplates: vi.fn(),
      });

      const { result } = renderHook(() => useTemplate());

      expect(result.current.templateStats).toEqual({
        total: 0,
        system: 0,
        custom: 0,
      });
    });
  });

  describe('テンプレート適用', () => {
    test('デフォルトテンプレートを適用する（テンプレートID未指定）', async () => {
      mockApplyTemplate.mockResolvedValue(true);

      const { result } = renderHook(() => useTemplate());

      const success = await result.current.applyTemplate('nursery-1');

      expect(success).toBe(true);
      expect(mockApplyTemplate).toHaveBeenCalledWith(
        'nursery-1',
        mockSystemTemplate
      );
    });

    test('指定されたテンプレートIDで適用する', async () => {
      mockApplyTemplate.mockResolvedValue(true);

      const { result } = renderHook(() => useTemplate());

      const success = await result.current.applyTemplate(
        'nursery-1',
        'custom-1'
      );

      expect(success).toBe(true);
      expect(mockApplyTemplate).toHaveBeenCalledWith(
        'nursery-1',
        mockCustomTemplate
      );
    });

    test('存在しないテンプレートIDを指定した場合はfalseを返す', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      const success = await result.current.applyTemplate(
        'nursery-1',
        'non-existent'
      );

      expect(success).toBe(false);
      expect(mockApplyTemplate).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'テンプレート（ID: non-existent）が見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('システムテンプレートが存在しない場合はfalseを返す', async () => {
      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [],
        loading: false,
        error: null,
        loadTemplates: mockLoadTemplates,
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTemplate());

      const success = await result.current.applyTemplate('nursery-1');

      expect(success).toBe(false);
      expect(mockApplyTemplate).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'システム提供テンプレートが見つかりません',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('useTemplateApplicationが失敗した場合はfalseを返す', async () => {
      mockApplyTemplate.mockResolvedValue(false);

      const { result } = renderHook(() => useTemplate());

      const success = await result.current.applyTemplate('nursery-1');

      expect(success).toBe(false);
      expect(mockApplyTemplate).toHaveBeenCalledWith(
        'nursery-1',
        mockSystemTemplate
      );
    });
  });

  describe('状態管理', () => {
    test('isApplyingをuseTemplateApplicationから取得する', () => {
      vi.mocked(useTemplateApplication).mockReturnValue({
        isApplying: true,
        applyTemplate: mockApplyTemplate,
      });

      const { result } = renderHook(() => useTemplate());

      expect(result.current.isApplying).toBe(true);
    });

    test('loadingをuseSystemTemplatesから取得する', () => {
      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [mockSystemTemplate],
        loading: true,
        error: null,
        loadTemplates: mockLoadTemplates,
      });

      const { result } = renderHook(() => useTemplate());

      expect(result.current.loading).toBe(true);
    });
  });

  describe('関数の委譲', () => {
    test('saveTemplateをuseCustomTemplatesに委譲する', () => {
      const { result } = renderHook(() => useTemplate());

      expect(result.current.saveTemplate).toBe(mockSaveTemplate);
    });
  });

  describe('初期化', () => {
    test('初回ロード時にloadTemplatesを呼び出す', () => {
      renderHook(() => useTemplate());

      expect(mockLoadTemplates).toHaveBeenCalledTimes(1);
    });
  });
});
