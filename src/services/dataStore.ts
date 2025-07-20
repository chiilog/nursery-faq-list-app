/**
 * ローカルストレージを使用したデータストア
 * 設計書のDataStoreインターフェースに基づく実装
 */

import type {
  QuestionList,
  Question,
  CreateQuestionListInput,
  UpdateQuestionListInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../types/data";
import {
  createQuestionList,
  createQuestion,
  updateQuestionListTimestamp,
  answerQuestion,
  addQuestionToList,
  removeQuestionFromList,
  updateQuestionInList,
} from "../utils/data";
import {
  validateCreateQuestionListInput,
  validateUpdateQuestionListInput,
  validateCreateQuestionInput,
  validateUpdateQuestionInput,
} from "../utils/validation";

// ストレージキー定数
const STORAGE_KEYS = {
  QUESTION_LISTS: "nursery-qa-question-lists",
  ENCRYPTION_KEY: "nursery-qa-encryption-key",
} as const;

// データストアエラークラス
export class DataStoreError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "DataStoreError";
  }
}

/**
 * 基本的なデータ暗号化機能
 * Web Crypto APIを使用した簡易暗号化
 */
class CryptoService {
  private static async getKey(): Promise<CryptoKey> {
    // 開発段階では固定キーを使用（本格運用時はより安全な方法を実装）
    const keyData = new TextEncoder().encode("nursery-qa-app-key-32-chars!");
    return await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(data);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
      );
      
      // IVと暗号化データを結合してBase64エンコード
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      throw new DataStoreError("データの暗号化に失敗しました", "ENCRYPTION_FAILED");
    }
  }

  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getKey();
      const combined = new Uint8Array(
        atob(encryptedData).split("").map(char => char.charCodeAt(0))
      );
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new DataStoreError("データの復号化に失敗しました", "DECRYPTION_FAILED");
    }
  }
}

/**
 * ローカルストレージを使用したデータストア実装
 */
export class DataStore {
  /**
   * 暗号化されたデータをローカルストレージに保存
   */
  private async saveToStorage(key: string, data: any): Promise<void> {
    try {
      const jsonData = JSON.stringify(data, (key, value) => {
        // Dateオブジェクトを文字列に変換
        if (value instanceof Date) {
          return { __type: "Date", value: value.toISOString() };
        }
        return value;
      });
      
      const encryptedData = await CryptoService.encrypt(jsonData);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      throw new DataStoreError(
        "データの保存に失敗しました",
        "STORAGE_SAVE_FAILED"
      );
    }
  }

  /**
   * ローカルストレージから暗号化データを読み込み
   */
  private async loadFromStorage<T>(key: string): Promise<T | null> {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) {
        return null;
      }
      
      const decryptedData = await CryptoService.decrypt(encryptedData);
      return JSON.parse(decryptedData, (key, value) => {
        // 文字列をDateオブジェクトに復元
        if (value && typeof value === "object" && value.__type === "Date") {
          return new Date(value.value);
        }
        return value;
      });
    } catch (error) {
      throw new DataStoreError(
        "データの読み込みに失敗しました",
        "STORAGE_LOAD_FAILED"
      );
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
        `入力データが無効です: ${validation.errors.join(", ")}`,
        "VALIDATION_FAILED"
      );
    }

    try {
      const newList = createQuestionList(input);
      const existingLists = await this.getAllQuestionLists();
      
      // 同名チェック
      const duplicateName = existingLists.some(
        list => list.title.toLowerCase() === newList.title.toLowerCase()
      );
      if (duplicateName) {
        throw new DataStoreError(
          "同名の質問リストが既に存在します",
          "DUPLICATE_TITLE"
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
        "質問リストの作成に失敗しました",
        "CREATE_FAILED"
      );
    }
  }

  /**
   * 質問リストを取得
   */
  async getQuestionList(id: string): Promise<QuestionList | null> {
    if (!id) {
      throw new DataStoreError("IDが指定されていません", "INVALID_ID");
    }

    try {
      const lists = await this.getAllQuestionLists();
      return lists.find(list => list.id === id) || null;
    } catch (error) {
      throw new DataStoreError(
        "質問リストの取得に失敗しました",
        "GET_FAILED"
      );
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
      throw new DataStoreError("IDが指定されていません", "INVALID_ID");
    }

    // バリデーション
    const validation = validateUpdateQuestionListInput(updates);
    if (!validation.isValid) {
      throw new DataStoreError(
        `更新データが無効です: ${validation.errors.join(", ")}`,
        "VALIDATION_FAILED"
      );
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex(list => list.id === id);
      
      if (listIndex === -1) {
        throw new DataStoreError(
          "指定された質問リストが見つかりません",
          "NOT_FOUND"
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
            "同名の質問リストが既に存在します",
            "DUPLICATE_TITLE"
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
        "質問リストの更新に失敗しました",
        "UPDATE_FAILED"
      );
    }
  }

  /**
   * 質問リストを削除
   */
  async deleteQuestionList(id: string): Promise<void> {
    if (!id) {
      throw new DataStoreError("IDが指定されていません", "INVALID_ID");
    }

    try {
      const lists = await this.getAllQuestionLists();
      const filteredLists = lists.filter(list => list.id !== id);
      
      if (filteredLists.length === lists.length) {
        throw new DataStoreError(
          "指定された質問リストが見つかりません",
          "NOT_FOUND"
        );
      }

      await this.saveQuestionLists(filteredLists);
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        "質問リストの削除に失敗しました",
        "DELETE_FAILED"
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
      throw new DataStoreError("リストIDが指定されていません", "INVALID_LIST_ID");
    }

    // バリデーション
    const validation = validateCreateQuestionInput(questionInput);
    if (!validation.isValid) {
      throw new DataStoreError(
        `質問データが無効です: ${validation.errors.join(", ")}`,
        "VALIDATION_FAILED"
      );
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex(list => list.id === listId);
      
      if (listIndex === -1) {
        throw new DataStoreError(
          "指定された質問リストが見つかりません",
          "LIST_NOT_FOUND"
        );
      }

      const updatedList = addQuestionToList(lists[listIndex], questionInput);
      lists[listIndex] = updatedList;
      
      await this.saveQuestionLists(lists);
      
      // 追加された質問のIDを返す
      const addedQuestion = updatedList.questions[updatedList.questions.length - 1];
      return addedQuestion.id;
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        "質問の追加に失敗しました",
        "ADD_QUESTION_FAILED"
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
      throw new DataStoreError("リストIDが指定されていません", "INVALID_LIST_ID");
    }
    if (!questionId) {
      throw new DataStoreError("質問IDが指定されていません", "INVALID_QUESTION_ID");
    }

    // バリデーション
    const validation = validateUpdateQuestionInput(updates);
    if (!validation.isValid) {
      throw new DataStoreError(
        `更新データが無効です: ${validation.errors.join(", ")}`,
        "VALIDATION_FAILED"
      );
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex(list => list.id === listId);
      
      if (listIndex === -1) {
        throw new DataStoreError(
          "指定された質問リストが見つかりません",
          "LIST_NOT_FOUND"
        );
      }

      const questionList = lists[listIndex];
      const question = questionList.questions.find(q => q.id === questionId);
      
      if (!question) {
        throw new DataStoreError(
          "指定された質問が見つかりません",
          "QUESTION_NOT_FOUND"
        );
      }

      const updatedQuestion = { ...question, ...updates };
      const updatedList = updateQuestionInList(questionList, questionId, updatedQuestion);
      
      lists[listIndex] = updatedList;
      await this.saveQuestionLists(lists);
    } catch (error) {
      if (error instanceof DataStoreError) {
        throw error;
      }
      throw new DataStoreError(
        "質問の更新に失敗しました",
        "UPDATE_QUESTION_FAILED"
      );
    }
  }

  /**
   * 質問を削除
   */
  async deleteQuestion(listId: string, questionId: string): Promise<void> {
    if (!listId) {
      throw new DataStoreError("リストIDが指定されていません", "INVALID_LIST_ID");
    }
    if (!questionId) {
      throw new DataStoreError("質問IDが指定されていません", "INVALID_QUESTION_ID");
    }

    try {
      const lists = await this.getAllQuestionLists();
      const listIndex = lists.findIndex(list => list.id === listId);
      
      if (listIndex === -1) {
        throw new DataStoreError(
          "指定された質問リストが見つかりません",
          "LIST_NOT_FOUND"
        );
      }

      const questionList = lists[listIndex];
      const questionExists = questionList.questions.some(q => q.id === questionId);
      
      if (!questionExists) {
        throw new DataStoreError(
          "指定された質問が見つかりません",
          "QUESTION_NOT_FOUND"
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
        "質問の削除に失敗しました",
        "DELETE_QUESTION_FAILED"
      );
    }
  }

  /**
   * テンプレートを取得
   */
  async getTemplates(): Promise<QuestionList[]> {
    try {
      const lists = await this.getAllQuestionLists();
      return lists.filter(list => list.isTemplate);
    } catch (error) {
      throw new DataStoreError(
        "テンプレートの取得に失敗しました",
        "GET_TEMPLATES_FAILED"
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
      throw new DataStoreError("テンプレートIDが指定されていません", "INVALID_TEMPLATE_ID");
    }

    // バリデーション
    const validation = validateCreateQuestionListInput(customizations);
    if (!validation.isValid) {
      throw new DataStoreError(
        `カスタマイズデータが無効です: ${validation.errors.join(", ")}`,
        "VALIDATION_FAILED"
      );
    }

    try {
      const template = await this.getQuestionList(templateId);
      if (!template) {
        throw new DataStoreError(
          "指定されたテンプレートが見つかりません",
          "TEMPLATE_NOT_FOUND"
        );
      }

      if (!template.isTemplate) {
        throw new DataStoreError(
          "指定されたリストはテンプレートではありません",
          "NOT_TEMPLATE"
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
        list => list.title.toLowerCase() === finalList.title.toLowerCase()
      );
      if (duplicateName) {
        throw new DataStoreError(
          "同名の質問リストが既に存在します",
          "DUPLICATE_TITLE"
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
        "テンプレートからの作成に失敗しました",
        "CREATE_FROM_TEMPLATE_FAILED"
      );
    }
  }

  /**
   * 全てのデータを削除（データプライバシー対応）
   */
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.QUESTION_LISTS);
      localStorage.removeItem(STORAGE_KEYS.ENCRYPTION_KEY);
    } catch (error) {
      throw new DataStoreError(
        "データの削除に失敗しました",
        "CLEAR_DATA_FAILED"
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
    } catch (error) {
      throw new DataStoreError(
        "データのエクスポートに失敗しました",
        "EXPORT_FAILED"
      );
    }
  }
}

// シングルトンインスタンス
export const dataStore = new DataStore();