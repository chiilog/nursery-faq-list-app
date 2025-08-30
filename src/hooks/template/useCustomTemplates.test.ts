import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomTemplates } from './useCustomTemplates';
import { TemplateService } from '../../services/template/templateService';
import type { Template } from '../../types/entities';

// 境界のみモック化
vi.mock('../../services/template/templateService');

describe('useCustomTemplates', () => {
  // テスト用のファクトリー関数
  const createTestTemplate = (overrides = {}): Template => ({
    id: 'custom-template-1',
    name: 'カスタムテンプレート1',
    questions: ['カスタム質問1', 'カスタム質問2'],
    isSystem: false,
    createdAt: '2025-08-30T10:00:00.000Z',
    updatedAt: '2025-08-30T10:00:00.000Z',
    ...overrides,
  });

  const createTestTemplateData = (overrides = {}) => ({
    name: 'テストテンプレート',
    questions: ['テスト質問1', 'テスト質問2'],
    ...overrides,
  });

  // 型安全なモック関数の作成
  const mockSaveCustomTemplate =
    vi.fn<typeof TemplateService.saveCustomTemplate>();
  const mockGetCustomTemplates =
    vi.fn<typeof TemplateService.getCustomTemplates>();

  beforeEach(() => {
    vi.clearAllMocks();

    // TemplateServiceのモック設定
    vi.mocked(TemplateService).saveCustomTemplate = mockSaveCustomTemplate;
    vi.mocked(TemplateService).getCustomTemplates = mockGetCustomTemplates;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    test('テンプレート一覧が空の状態で開始される', () => {
      // When: フックをレンダー
      const { result } = renderHook(() => useCustomTemplates());

      // Then: 空のテンプレート一覧が提供される
      expect(result.current.customTemplates).toEqual([]);
    });
  });

  describe('テンプレート保存', () => {
    test('新しいテンプレートを保存すると一覧に追加される', async () => {
      // Given: 保存が成功する環境
      mockSaveCustomTemplate.mockResolvedValue(undefined);
      const templateData = createTestTemplateData();

      const { result } = renderHook(() => useCustomTemplates());

      // When: テンプレートを保存
      let savedTemplate: Template | undefined;
      await act(async () => {
        savedTemplate = await result.current.saveTemplate(templateData);
      });

      // Then: 保存されたテンプレートが返される
      expect(savedTemplate).toEqual(
        expect.objectContaining({
          name: templateData.name,
          questions: templateData.questions,
          isSystem: false,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );

      // テンプレート一覧に追加される
      expect(result.current.customTemplates).toHaveLength(1);
      expect(result.current.customTemplates[0]).toEqual(savedTemplate);
    });

    test('保存エラー時はエラーが再スローされる', async () => {
      // Given: 保存がエラーになる環境
      const saveError = new Error('ネットワークエラー');
      mockSaveCustomTemplate.mockRejectedValue(saveError);
      const templateData = createTestTemplateData();

      const { result } = renderHook(() => useCustomTemplates());

      // When: 保存を試行
      await act(async () => {
        await expect(result.current.saveTemplate(templateData)).rejects.toThrow(
          saveError
        );
      });

      // Then: テンプレート一覧は変更されない
      expect(result.current.customTemplates).toEqual([]);
    });

    test('空の質問でもテンプレートを保存できる', async () => {
      // Given: 空の質問配列を持つテンプレート
      mockSaveCustomTemplate.mockResolvedValue(undefined);
      const templateData = createTestTemplateData({ questions: [] });

      const { result } = renderHook(() => useCustomTemplates());

      // When: 空の質問でテンプレートを保存
      let savedTemplate: Template | undefined;
      await act(async () => {
        savedTemplate = await result.current.saveTemplate(templateData);
      });

      // Then: 空の質問配列でもテンプレートが作成される
      expect(savedTemplate?.questions).toEqual([]);
      expect(result.current.customTemplates).toHaveLength(1);
    });
  });

  describe('テンプレート読み込み', () => {
    test('保存済みテンプレートを読み込んで一覧に表示する', async () => {
      // Given: 保存済みテンプレートが存在する
      const savedTemplates = [
        createTestTemplate(),
        createTestTemplate({
          id: 'custom-template-2',
          name: 'カスタムテンプレート2',
          questions: ['別の質問1', '別の質問2', '別の質問3'],
        }),
      ];
      mockGetCustomTemplates.mockResolvedValue(savedTemplates);

      const { result } = renderHook(() => useCustomTemplates());

      // When: テンプレートを読み込み
      await act(async () => {
        await result.current.loadCustomTemplates();
      });

      // Then: 保存済みテンプレートが一覧に表示される
      expect(result.current.customTemplates).toEqual(savedTemplates);
      expect(result.current.customTemplates).toHaveLength(2);
    });

    test('読み込みエラー時は一覧が空のまま', async () => {
      // Given: 読み込みがエラーになる環境
      const loadError = new Error('データベース接続エラー');
      mockGetCustomTemplates.mockRejectedValue(loadError);

      const { result } = renderHook(() => useCustomTemplates());

      // When: 読み込みを試行
      await act(async () => {
        await result.current.loadCustomTemplates();
      });

      // Then: テンプレート一覧は空のまま
      expect(result.current.customTemplates).toEqual([]);
    });

    test('テンプレートが存在しない場合は空の一覧を表示', async () => {
      // Given: 保存済みテンプレートが存在しない
      mockGetCustomTemplates.mockResolvedValue([]);

      const { result } = renderHook(() => useCustomTemplates());

      // When: テンプレートを読み込み
      await act(async () => {
        await result.current.loadCustomTemplates();
      });

      // Then: 空の一覧が表示される
      expect(result.current.customTemplates).toEqual([]);
    });
  });

  describe('React統合', () => {
    test('再レンダー時も機能が安定して動作する', () => {
      // Given: フックを使用するコンポーネント
      const { result, rerender } = renderHook(() => useCustomTemplates());

      const initialSaveTemplate = result.current.saveTemplate;
      const initialLoadCustomTemplates = result.current.loadCustomTemplates;

      // When: コンポーネントが再レンダーされる
      rerender();

      // Then: 提供される機能は変わらず使用可能
      expect(result.current.saveTemplate).toBe(initialSaveTemplate);
      expect(result.current.loadCustomTemplates).toBe(
        initialLoadCustomTemplates
      );
    });

    test('複数の操作を連続で実行できる', async () => {
      // Given: 正常動作する環境
      mockSaveCustomTemplate.mockResolvedValue(undefined);
      mockGetCustomTemplates.mockResolvedValue([]);

      const { result } = renderHook(() => useCustomTemplates());
      const templateData = createTestTemplateData();

      // When: 保存→読み込みを連続実行
      await act(async () => {
        await result.current.saveTemplate(templateData);
        await result.current.loadCustomTemplates();
      });

      // Then: どちらの操作も正常に動作する
      expect(mockSaveCustomTemplate).toHaveBeenCalledTimes(1);
      expect(mockGetCustomTemplates).toHaveBeenCalledTimes(1);
    });
  });
});
