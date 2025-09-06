import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TemplateDataStore } from './templateRepository';
import { getDefaultTemplate } from './systemTemplates';
import type { Template } from '../../types/entities';

// モックの設定
vi.mock('./systemTemplates');

describe('TemplateDataStore', () => {
  let templateDataStore: TemplateDataStore;

  // テスト用のモックテンプレート
  const mockSystemTemplates: Template[] = [
    {
      id: 'system-template-1',
      name: 'システムテンプレート1',
      questions: ['システム質問1', 'システム質問2'],
      isSystem: true,
      createdAt: new Date('2025-08-30T10:00:00.000Z'),
      updatedAt: new Date('2025-08-30T10:00:00.000Z'),
    },
    {
      id: 'system-template-2',
      name: 'システムテンプレート2',
      questions: ['システム質問3'],
      isSystem: true,
      createdAt: new Date('2025-08-30T10:00:00.000Z'),
      updatedAt: new Date('2025-08-30T10:00:00.000Z'),
    },
  ];

  const mockCustomTemplate: Template = {
    id: 'custom-template-1',
    name: 'カスタムテンプレート1',
    questions: ['カスタム質問1', 'カスタム質問2'],
    isSystem: false,
    createdAt: new Date('2025-08-30T10:00:00.000Z'),
    updatedAt: new Date('2025-08-30T10:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // getDefaultTemplateのモック設定
    vi.mocked(getDefaultTemplate).mockReturnValue(mockSystemTemplates);

    // console.logのスパイ設定
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // タイマーのモック設定
    vi.useFakeTimers();

    // TemplateDataStoreのインスタンスを作成
    templateDataStore = new TemplateDataStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getSystemTemplates', () => {
    test('システムテンプレートを非同期で取得できる', async () => {
      // Given: モックされたgetDefaultTemplate

      // When: getSystemTemplatesを呼び出し
      const promise = templateDataStore.getSystemTemplates();

      // タイマーを進める（100ms setTimeout をシミュレート）
      vi.advanceTimersByTime(100);

      const result = await promise;

      // Then: getDefaultTemplateの戻り値が返される
      expect(result).toEqual(mockSystemTemplates);
      expect(getDefaultTemplate).toHaveBeenCalledTimes(1);
    });

    test('getDefaultTemplateの戻り値をそのまま返す', async () => {
      // Given: 特定のテンプレート配列をgetDefaultTemplateが返すよう設定
      const specificTemplates = [mockSystemTemplates[0]];
      vi.mocked(getDefaultTemplate).mockReturnValue(specificTemplates);

      // When: getSystemTemplatesを呼び出し
      const promise = templateDataStore.getSystemTemplates();
      vi.advanceTimersByTime(100);
      const result = await promise;

      // Then: getDefaultTemplateの戻り値がそのまま返される
      expect(result).toBe(specificTemplates);
      expect(result).toEqual(specificTemplates);
    });

    test('非同期処理（100ms setTimeout）が正しく動作する', async () => {
      // Given: TemplateDataStoreインスタンス

      // When: getSystemTemplatesを呼び出し（まだ解決されていない）
      const promise = templateDataStore.getSystemTemplates();

      // Then: 100ms経過前はまだ未解決
      let isResolved = false;
      void promise.then(() => {
        isResolved = true;
      });

      // 50ms進めても未解決
      vi.advanceTimersByTime(50);
      await Promise.resolve(); // マイクロタスクを処理
      expect(isResolved).toBe(false);

      // 100ms進めると解決
      vi.advanceTimersByTime(50);
      await promise;
      expect(isResolved).toBe(true);
    });

    test('Promiseを返す', () => {
      // Given: TemplateDataStoreインスタンス

      // When: getSystemTemplatesを呼び出し
      const result = templateDataStore.getSystemTemplates();

      // Then: Promiseオブジェクトが返される
      expect(result).toBeInstanceOf(Promise);
      expect(typeof result.then).toBe('function');
    });
  });

  describe('getCustomTemplates', () => {
    test('空配列を返す（現在の仕様）', async () => {
      // Given: TemplateDataStoreインスタンス

      // When: getCustomTemplatesを呼び出し
      const result = await templateDataStore.getCustomTemplates();

      // Then: 空配列が返される
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('Promiseで空配列を解決する', async () => {
      // Given: TemplateDataStoreインスタンス

      // When: getCustomTemplatesを呼び出し
      const promise = templateDataStore.getCustomTemplates();

      // Then: Promiseが返され、空配列で解決される
      expect(promise).toBeInstanceOf(Promise);
      const result = await promise;
      expect(result).toEqual([]);
    });

    test('即座に解決される（setTimeoutなし）', async () => {
      // Given: TemplateDataStoreインスタンス

      // When: getCustomTemplatesを呼び出し
      const promise = templateDataStore.getCustomTemplates();

      // Then: タイマーを進めなくても即座に解決される
      const result = await promise;
      expect(result).toEqual([]);

      // getDefaultTemplateは呼ばれない
      expect(getDefaultTemplate).not.toHaveBeenCalled();
    });
  });

  describe('saveCustomTemplate', () => {
    test('テンプレートを受け取り正常に完了する', async () => {
      // Given: カスタムテンプレート

      // When: saveCustomTemplateを呼び出し
      const result =
        await templateDataStore.saveCustomTemplate(mockCustomTemplate);

      // Then: 正常に完了する（voidが返される）
      expect(result).toBeUndefined();
    });

    test('console.logが呼ばれる', async () => {
      // Given: カスタムテンプレートとconsole.logスパイ
      const consoleLogSpy = vi.spyOn(console, 'log');

      // When: saveCustomTemplateを呼び出し
      await templateDataStore.saveCustomTemplate(mockCustomTemplate);

      // Then: console.logが適切なメッセージとともに呼ばれる
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'カスタムテンプレートを保存:',
        mockCustomTemplate
      );
    });

    test('Promiseでvoidを解決する', async () => {
      // Given: カスタムテンプレート

      // When: saveCustomTemplateを呼び出し
      const promise = templateDataStore.saveCustomTemplate(mockCustomTemplate);

      // Then: Promiseが返され、voidで解決される
      expect(promise).toBeInstanceOf(Promise);
      const result = await promise;
      expect(result).toBeUndefined();
    });

    test('渡されたテンプレートがconsole.logに出力される', async () => {
      // Given: 特定の内容を持つテンプレート
      const specificTemplate: Template = {
        id: 'specific-id',
        name: '特定のテンプレート',
        questions: ['特定の質問1', '特定の質問2'],
        isSystem: false,
        createdAt: new Date('2025-08-30T11:00:00.000Z'),
        updatedAt: new Date('2025-08-30T11:00:00.000Z'),
      };

      const consoleLogSpy = vi.spyOn(console, 'log');

      // When: その特定のテンプレートを保存
      await templateDataStore.saveCustomTemplate(specificTemplate);

      // Then: そのテンプレートがconsole.logに渡される
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'カスタムテンプレートを保存:',
        specificTemplate
      );
    });
  });

  describe('TemplateRepository インターフェース準拠', () => {
    test('TemplateRepositoryインターフェースを正しく実装している', () => {
      // Given: TemplateDataStoreインスタンス

      // Then: 必要なメソッドが存在し、正しい型を持つ
      expect(typeof templateDataStore.getSystemTemplates).toBe('function');
      expect(typeof templateDataStore.getCustomTemplates).toBe('function');
      expect(typeof templateDataStore.saveCustomTemplate).toBe('function');

      // メソッドの戻り値がPromiseである
      expect(templateDataStore.getSystemTemplates()).toBeInstanceOf(Promise);
      expect(templateDataStore.getCustomTemplates()).toBeInstanceOf(Promise);
      expect(
        templateDataStore.saveCustomTemplate(mockCustomTemplate)
      ).toBeInstanceOf(Promise);
    });

    test('すべてのメソッドが存在する', () => {
      // Given: TemplateDataStoreインスタンス

      // Then: TemplateRepositoryインターフェースで定義されたすべてのメソッドが存在
      const expectedMethods = [
        'getSystemTemplates',
        'getCustomTemplates',
        'saveCustomTemplate',
      ];

      expectedMethods.forEach((methodName) => {
        expect(templateDataStore).toHaveProperty(methodName);
        expect(
          typeof templateDataStore[methodName as keyof TemplateDataStore]
        ).toBe('function');
      });
    });
  });

  describe('クラス全体の統合テスト', () => {
    test('複数のメソッドを連続して呼び出せる', async () => {
      // Given: TemplateDataStoreインスタンス
      const consoleLogSpy = vi.spyOn(console, 'log');

      // When: 複数のメソッドを順次呼び出し
      const customTemplatesPromise = templateDataStore.getCustomTemplates();
      const savePromise =
        templateDataStore.saveCustomTemplate(mockCustomTemplate);
      const systemTemplatesPromise = templateDataStore.getSystemTemplates();

      // タイマーを進める（getSystemTemplatesのため）
      vi.advanceTimersByTime(100);

      const [customTemplates, saveResult, systemTemplates] = await Promise.all([
        customTemplatesPromise,
        savePromise,
        systemTemplatesPromise,
      ]);

      // Then: すべてのメソッドが正常に動作
      expect(customTemplates).toEqual([]);
      expect(saveResult).toBeUndefined();
      expect(systemTemplates).toEqual(mockSystemTemplates);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });
});
