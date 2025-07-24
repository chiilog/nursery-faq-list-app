/**
 * ローカルストレージを使用したデータストア
 * 設計書のDataStoreインターフェースに基づく実装
 */

import type {
  QuestionList,
  CreateQuestionListInput,
  UpdateQuestionListInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../types/data';
import {
  createQuestionList,
  createQuestion,
  updateQuestionListTimestamp,
  addQuestionToList,
  removeQuestionFromList,
  updateQuestionInList,
} from '../utils/data';
import {
  validateCreateQuestionListInput,
  validateUpdateQuestionListInput,
  validateCreateQuestionInput,
  validateUpdateQuestionInput,
} from '../utils/validation';

// ストレージキー定数
const STORAGE_KEYS = {
  QUESTION_LISTS: 'nursery-qa-question-lists',
  KEY_DERIVATION_SALT: 'nursery-qa-key-salt',
  USER_KEY_MATERIAL: 'nursery-qa-user-key-material',
} as const;

// データストアエラークラス
export class DataStoreError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'DataStoreError';
  }
}

/**
 * 基本的なデータ暗号化機能
 * Web Crypto APIを使用したセキュア暗号化
 */

// ソルトを取得または生成
function getOrCreateSalt(): Uint8Array {
  const storedSalt = localStorage.getItem(STORAGE_KEYS.KEY_DERIVATION_SALT);
  if (storedSalt) {
    try {
      return new Uint8Array(
        atob(storedSalt)
          .split('')
          .map((char) => char.charCodeAt(0))
      );
    } catch {
      // 破損している場合は新しいソルトを生成
    }
  }

  // 新しいソルトを生成して保存
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(
    STORAGE_KEYS.KEY_DERIVATION_SALT,
    btoa(String.fromCharCode(...salt))
  );
  return salt;
}

// ユーザー固有の永続的なキーマテリアルを取得または生成
function getUserKeyMaterial(): string {
  // 既存のキーマテリアルを取得
  const existingKeyMaterial = localStorage.getItem(
    STORAGE_KEYS.USER_KEY_MATERIAL
  );
  if (existingKeyMaterial) {
    return existingKeyMaterial;
  }

  // 新しいキーマテリアルを生成
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timestamp = Date.now().toString();
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  const randomString = Array.from(randomValues, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  const keyMaterial = `${userAgent}-${language}-${timestamp}-${randomString}`;

  // 永続的に保存
  localStorage.setItem(STORAGE_KEYS.USER_KEY_MATERIAL, keyMaterial);

  return keyMaterial;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const salt = getOrCreateSalt();
  const keyMaterial = getUserKeyMaterial();

  // キーマテリアルをPBKDF2で強化
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyMaterial),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data: string): Promise<string> {
  try {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // IVと暗号化データを結合してBase64エンコード
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch {
    throw new DataStoreError(
      'データの暗号化に失敗しました',
      'ENCRYPTION_FAILED'
    );
  }
}

async function decryptData(encryptedData: string): Promise<string> {
  try {
    const key = await getCryptoKey();
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map((char) => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    throw new DataStoreError(
      'データの復号化に失敗しました',
      'DECRYPTION_FAILED'
    );
  }
}

/**
 * ローカルストレージを使用したデータストア実装
 */
export class DataStore {
  /**
   * 暗号化されたデータをローカルストレージに保存
   */
  private async saveToStorage(key: string, data: unknown): Promise<void> {
    try {
      const jsonData = JSON.stringify(data, (_, value: unknown) => {
        // Dateオブジェクトを文字列に変換
        if (value instanceof Date) {
          return { __dateType: 'Date', value: value.toISOString() } as const;
        }
        return value;
      });

      const encryptedData = await encryptData(jsonData);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error('saveToStorage error:', error);
      throw new DataStoreError(
        'データの保存に失敗しました',
        'STORAGE_SAVE_FAILED'
      );
    }
  }

  /**
   * 暗号化データを復号化する
   */
  private async decryptStoredData(storedData: string): Promise<string> {
    try {
      return await decryptData(storedData);
    } catch {
      console.warn(
        'データの復号化に失敗しました。データをクリアして新しく開始します。'
      );
      throw new DataStoreError(
        'データの復号化に失敗しました',
        'DECRYPTION_FAILED'
      );
    }
  }

  /**
   * 平文データを暗号化してマイグレーションする
   */
  private async migrateUnencryptedData<T>(key: string, data: T): Promise<void> {
    try {
      await this.saveToStorage(key, data);
    } catch (migrationError) {
      console.warn(
        'データの暗号化処理に失敗しました:',
        (migrationError as Error).message
      );
      // マイグレーション失敗は致命的ではないため継続
    }
  }

  /**
   * JSON文字列をパースしてDateオブジェクトを復元する
   */
  private parseJsonWithDateRevival<T>(jsonData: string): T {
    return JSON.parse(jsonData, (_, value: unknown) => {
      // 文字列をDateオブジェクトに復元
      if (
        value &&
        typeof value === 'object' &&
        '__dateType' in value &&
        'value' in value &&
        (value as { __dateType: unknown; value: unknown }).__dateType ===
          'Date' &&
        typeof (value as { __dateType: unknown; value: unknown }).value ===
          'string'
      ) {
        return new Date((value as { __dateType: string; value: string }).value);
      }
      return value;
    }) as T;
  }

  /**
   * ローカルストレージからデータを読み込み（暗号化・平文両対応）
   */
  private async loadFromStorage<T>(key: string): Promise<T | null> {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) {
        return null;
      }

      // データが暗号化データかどうかを判別
      const isEncryptedData = this.isBase64EncodedData(storedData);
      let jsonData: string;

      if (isEncryptedData) {
        // 暗号化データとして復号化を試行
        jsonData = await this.decryptStoredData(storedData);
      } else {
        // 平文データとして処理（後方互換性）
        jsonData = storedData;
      }

      // JSONパースを実行
      const parsedData = this.parseJsonWithDateRevival<T>(jsonData);

      // 平文データの場合、暗号化して保存し直す（マイグレーション）
      if (!isEncryptedData) {
        await this.migrateUnencryptedData(key, parsedData);
      }

      return parsedData;
    } catch (error) {
      console.error('loadFromStorage error:', error);

      // 復号化失敗エラーの場合は、データをクリアして新しく開始
      if (
        error instanceof DataStoreError &&
        error.code === 'DECRYPTION_FAILED'
      ) {
        console.warn('データをクリアして新しく開始します');
        localStorage.removeItem(key);
        return null;
      }

      // 既にDataStoreErrorの場合はそのまま投げる
      if (error instanceof DataStoreError) {
        throw error;
      }

      throw new DataStoreError(
        'データの読み込みに失敗しました',
        'STORAGE_LOAD_FAILED'
      );
    }
  }

  /**
   * Base64エンコードされた暗号化データかどうかを判別
   */
  private isBase64EncodedData(data: string): boolean {
    // まず有効なJSONかどうかを確認
    try {
      JSON.parse(data);
      // JSONとして解析できる場合は平文データ
      return false;
    } catch {
      // JSONとして解析できない場合は暗号化データの可能性がある
    }

    // Base64の基本的な特徴をチェック
    if (data.length === 0) return false;

    // Base64文字セットのみで構成されているかチェック
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(data)) return false;

    // Base64の長さは4の倍数である必要がある
    if (data.length % 4 !== 0) return false;

    // Base64として有効かどうかをチェック
    try {
      atob(data);
      // Base64として有効で、JSONとして無効な場合は暗号化データ
      return true;
    } catch {
      // Base64としても無効な場合は平文データ
      return false;
    }
  }

  /**
   * 全ての質問リストを取得
   */
  async getAllQuestionLists(): Promise<QuestionList[]> {
    const lists = await this.loadFromStorage<QuestionList[]>(
      STORAGE_KEYS.QUESTION_LISTS
    );
    return lists || [];
  }

  /**
   * 質問リストを保存
   */
  private async saveQuestionLists(lists: QuestionList[]): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.QUESTION_LISTS, lists);
  }

  /**
   * 質問リストを作成
   */
  async createQuestionList(input: CreateQuestionListInput): Promise<string> {
    // バリデーション
    const validation = validateCreateQuestionListInput(input);
    if (!validation.isValid) {
      throw new DataStoreError(
        `入力データが無効です: ${validation.errors.join(', ')}`,
        'VALIDATION_FAILED'
      );
    }

    try {
      const newList = createQuestionList(input);
      const existingLists = await this.getAllQuestionLists();

      // 同名チェック
      const duplicateName = existingLists.some(
        (list) => list.title.toLowerCase() === newList.title.toLowerCase()
      );
      if (duplicateName) {
        throw new DataStoreError(
          '同名の質問リストが既に存在します',
          'DUPLICATE_TITLE'
        );
      }

      const updatedLists = [...existingLists, newList];
      await this.saveQuestionLists(updatedLists);

      return newList.id;
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        '質問リストの作成に失敗しました',
        'CREATE_FAILED'
      );
    }
  }

  /**
   * 質問リストを取得
   */
  async getQuestionList(id: string): Promise<QuestionList | null> {
    if (!id) {
      throw new DataStoreError('IDが指定されていません', 'INVALID_ID');
    }

    try {
      const lists = await this.getAllQuestionLists();
      return lists.find((list) => list.id === id) || null;
    } catch {
      throw new DataStoreError('質問リストの取得に失敗しました', 'GET_FAILED');
    }
  }

  /**
   * 質問リストを更新
   */
  async updateQuestionList(
    id: string,
    updates: UpdateQuestionListInput
  ): Promise<void> {
    if (!id) {
      throw new DataStoreError('IDが指定されていません', 'INVALID_ID');
    }

    // バリデーション
    const validation = validateUpdateQuestionListInput(updates);
    if (!validation.isValid) {
      throw new DataStoreError(
        `更新データが無効です: ${validation.errors.join(', ')}`,
        'VALIDATION_FAILED'
      );
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex((list) => list.id === id);

      if (listIndex === -1) {
        throw new DataStoreError(
          '指定された質問リストが見つかりません',
          'NOT_FOUND'
        );
      }

      // 同名チェック（自分以外で）
      if (updates.title) {
        const duplicateName = lists.some(
          (list, index) =>
            index !== listIndex &&
            list.title.toLowerCase() === updates.title!.toLowerCase()
        );
        if (duplicateName) {
          throw new DataStoreError(
            '同名の質問リストが既に存在します',
            'DUPLICATE_TITLE'
          );
        }
      }

      const updatedList = updateQuestionListTimestamp({
        ...lists[listIndex],
        ...updates,
      });

      lists[listIndex] = updatedList;
      await this.saveQuestionLists(lists);
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        '質問リストの更新に失敗しました',
        'UPDATE_FAILED'
      );
    }
  }

  /**
   * 質問リストを削除
   */
  async deleteQuestionList(id: string): Promise<void> {
    if (!id) {
      throw new DataStoreError('IDが指定されていません', 'INVALID_ID');
    }

    try {
      const lists = await this.getAllQuestionLists();
      const filteredLists = lists.filter((list) => list.id !== id);

      if (filteredLists.length === lists.length) {
        throw new DataStoreError(
          '指定された質問リストが見つかりません',
          'NOT_FOUND'
        );
      }

      await this.saveQuestionLists(filteredLists);
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        '質問リストの削除に失敗しました',
        'DELETE_FAILED'
      );
    }
  }

  /**
   * 質問を追加
   */
  async addQuestion(
    listId: string,
    questionInput: CreateQuestionInput
  ): Promise<string> {
    if (!listId) {
      throw new DataStoreError(
        'リストIDが指定されていません',
        'INVALID_LIST_ID'
      );
    }

    // バリデーション
    const validation = validateCreateQuestionInput(questionInput);
    if (!validation.isValid) {
      throw new DataStoreError(
        `質問データが無効です: ${validation.errors.join(', ')}`,
        'VALIDATION_FAILED'
      );
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex((list) => list.id === listId);

      if (listIndex === -1) {
        throw new DataStoreError(
          '指定された質問リストが見つかりません',
          'LIST_NOT_FOUND'
        );
      }

      const updatedList = addQuestionToList(lists[listIndex], questionInput);
      lists[listIndex] = updatedList;

      await this.saveQuestionLists(lists);

      // 追加された質問のIDを返す
      const addedQuestion =
        updatedList.questions[updatedList.questions.length - 1];
      return addedQuestion.id;
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        '質問の追加に失敗しました',
        'ADD_QUESTION_FAILED'
      );
    }
  }

  /**
   * 質問を更新
   */
  async updateQuestion(
    listId: string,
    questionId: string,
    updates: UpdateQuestionInput
  ): Promise<void> {
    if (!listId) {
      throw new DataStoreError(
        'リストIDが指定されていません',
        'INVALID_LIST_ID'
      );
    }
    if (!questionId) {
      throw new DataStoreError(
        '質問IDが指定されていません',
        'INVALID_QUESTION_ID'
      );
    }

    // バリデーション
    const validation = validateUpdateQuestionInput(updates);
    if (!validation.isValid) {
      throw new DataStoreError(
        `更新データが無効です: ${validation.errors.join(', ')}`,
        'VALIDATION_FAILED'
      );
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex((list) => list.id === listId);

      if (listIndex === -1) {
        throw new DataStoreError(
          '指定された質問リストが見つかりません',
          'LIST_NOT_FOUND'
        );
      }

      const questionList = lists[listIndex];
      const question = questionList.questions.find((q) => q.id === questionId);

      if (!question) {
        throw new DataStoreError(
          '指定された質問が見つかりません',
          'QUESTION_NOT_FOUND'
        );
      }

      const updatedQuestion = { ...question, ...updates };
      const updatedList = updateQuestionInList(
        questionList,
        questionId,
        updatedQuestion
      );

      lists[listIndex] = updatedList;
      await this.saveQuestionLists(lists);
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        '質問の更新に失敗しました',
        'UPDATE_QUESTION_FAILED'
      );
    }
  }

  /**
   * 複数の質問を一括更新
   */
  async updateQuestionsBatch(
    listId: string,
    updates: Array<{ questionId: string; updates: UpdateQuestionInput }>
  ): Promise<void> {
    if (!listId) {
      throw new DataStoreError(
        'リストIDが指定されていません',
        'INVALID_LIST_ID'
      );
    }

    if (!updates.length) {
      return; // 更新がない場合は何もしない
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex((list) => list.id === listId);

      if (listIndex === -1) {
        throw new DataStoreError(
          '指定された質問リストが見つかりません',
          'LIST_NOT_FOUND'
        );
      }

      let questionList = lists[listIndex];

      // 全ての更新を適用
      for (const { questionId, updates: questionUpdates } of updates) {
        // バリデーション
        const validation = validateUpdateQuestionInput(questionUpdates);
        if (!validation.isValid) {
          throw new DataStoreError(
            `質問ID ${questionId} の更新データが無効です: ${validation.errors.join(', ')}`,
            'VALIDATION_FAILED'
          );
        }

        const question = questionList.questions.find(
          (q) => q.id === questionId
        );
        if (!question) {
          throw new DataStoreError(
            `質問ID ${questionId} が見つかりません`,
            'QUESTION_NOT_FOUND'
          );
        }

        const updatedQuestion = { ...question, ...questionUpdates };
        questionList = updateQuestionInList(
          questionList,
          questionId,
          updatedQuestion
        );
      }

      lists[listIndex] = questionList;
      await this.saveQuestionLists(lists);
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        '質問の一括更新に失敗しました',
        'BATCH_UPDATE_FAILED'
      );
    }
  }

  /**
   * 質問を削除
   */
  async deleteQuestion(listId: string, questionId: string): Promise<void> {
    if (!listId) {
      throw new DataStoreError(
        'リストIDが指定されていません',
        'INVALID_LIST_ID'
      );
    }
    if (!questionId) {
      throw new DataStoreError(
        '質問IDが指定されていません',
        'INVALID_QUESTION_ID'
      );
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex((list) => list.id === listId);

      if (listIndex === -1) {
        throw new DataStoreError(
          '指定された質問リストが見つかりません',
          'LIST_NOT_FOUND'
        );
      }

      const questionList = lists[listIndex];
      const questionExists = questionList.questions.some(
        (q) => q.id === questionId
      );

      if (!questionExists) {
        throw new DataStoreError(
          '指定された質問が見つかりません',
          'QUESTION_NOT_FOUND'
        );
      }

      const updatedList = removeQuestionFromList(questionList, questionId);
      lists[listIndex] = updatedList;

      await this.saveQuestionLists(lists);
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        '質問の削除に失敗しました',
        'DELETE_QUESTION_FAILED'
      );
    }
  }

  /**
   * テンプレートを取得
   */
  async getTemplates(): Promise<QuestionList[]> {
    try {
      const lists = await this.getAllQuestionLists();
      return lists.filter((list) => list.isTemplate);
    } catch {
      throw new DataStoreError(
        'テンプレートの取得に失敗しました',
        'GET_TEMPLATES_FAILED'
      );
    }
  }

  /**
   * テンプレートから質問リストを作成
   */
  async createFromTemplate(
    templateId: string,
    customizations: CreateQuestionListInput
  ): Promise<string> {
    if (!templateId) {
      throw new DataStoreError(
        'テンプレートIDが指定されていません',
        'INVALID_TEMPLATE_ID'
      );
    }

    // バリデーション
    const validation = validateCreateQuestionListInput(customizations);
    if (!validation.isValid) {
      throw new DataStoreError(
        `カスタマイズデータが無効です: ${validation.errors.join(', ')}`,
        'VALIDATION_FAILED'
      );
    }

    try {
      const template = await this.getQuestionList(templateId);
      if (!template) {
        throw new DataStoreError(
          '指定されたテンプレートが見つかりません',
          'TEMPLATE_NOT_FOUND'
        );
      }

      if (!template.isTemplate) {
        throw new DataStoreError(
          '指定されたリストはテンプレートではありません',
          'NOT_TEMPLATE'
        );
      }

      // 新しい質問リストを作成
      const newList = createQuestionList(customizations);

      // テンプレートの質問をコピー
      const templateQuestions = template.questions.map((question, index) =>
        createQuestion(
          {
            text: question.text,
            priority: question.priority,
            category: question.category,
          },
          index
        )
      );

      const finalList: QuestionList = {
        ...newList,
        questions: templateQuestions,
      };

      const existingLists = await this.getAllQuestionLists();

      // 同名チェック
      const duplicateName = existingLists.some(
        (list) => list.title.toLowerCase() === finalList.title.toLowerCase()
      );
      if (duplicateName) {
        throw new DataStoreError(
          '同名の質問リストが既に存在します',
          'DUPLICATE_TITLE'
        );
      }

      const updatedLists = [...existingLists, finalList];
      await this.saveQuestionLists(updatedLists);

      return finalList.id;
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        'テンプレートからの作成に失敗しました',
        'CREATE_FROM_TEMPLATE_FAILED'
      );
    }
  }

  /**
   * 全てのデータを削除（データプライバシー対応）
   */
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.QUESTION_LISTS);
      localStorage.removeItem(STORAGE_KEYS.KEY_DERIVATION_SALT);
      localStorage.removeItem(STORAGE_KEYS.USER_KEY_MATERIAL);
      console.info('全てのデータを削除しました');
      // 非同期処理の一貫性のため
      await Promise.resolve();
    } catch {
      throw new DataStoreError(
        'データの削除に失敗しました',
        'CLEAR_DATA_FAILED'
      );
    }
  }

  /**
   * データエクスポート（将来のバックアップ機能用）
   */
  async exportData(): Promise<string> {
    try {
      const lists = await this.getAllQuestionLists();
      return JSON.stringify(lists, null, 2);
    } catch {
      throw new DataStoreError(
        'データのエクスポートに失敗しました',
        'EXPORT_FAILED'
      );
    }
  }
}

// シングルトンインスタンス
export const dataStore = new DataStore();
