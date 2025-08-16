/**
 * ストレージ抽象化レイヤー
 *
 * localStorage操作の共通インターフェースを提供し、
 * 依存性注入によるテスタビリティと保守性を向上させる
 */

import { DataStoreError } from '../types/errors';

/**
 * ストレージサービスのインターフェース
 * localStorage操作を抽象化し、テスタビリティを向上させる
 */
export interface StorageService {
  /**
   * 指定されたキーの値を取得する
   * @param key - 取得するキー
   * @returns 値またはnull
   * @throws {DataStoreError} 読み込みエラーの場合
   */
  getItem(key: string): string | null;

  /**
   * 指定されたキーに値を設定する
   * @param key - 設定するキー
   * @param value - 設定する値
   * @throws {DataStoreError} 書き込みエラーの場合
   */
  setItem(key: string, value: string): void;

  /**
   * 指定されたキーを削除する
   * @param key - 削除するキー
   * @throws {DataStoreError} 削除エラーの場合
   */
  removeItem(key: string): void;

  /**
   * すべてのデータをクリアする
   * @throws {DataStoreError} クリアエラーの場合
   */
  clear(): void;
}

/**
 * localStorage実装
 * ブラウザのlocalStorageAPIをStorageServiceインターフェースで抽象化
 */
export class LocalStorageService implements StorageService {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      throw new DataStoreError(
        'ストレージからの読み込みに失敗しました',
        'STORAGE_READ_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw new DataStoreError(
        'ストレージへの保存に失敗しました',
        'STORAGE_WRITE_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new DataStoreError(
        'ストレージからの削除に失敗しました',
        'STORAGE_DELETE_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      throw new DataStoreError(
        'ストレージのクリアに失敗しました',
        'STORAGE_CLEAR_FAILED',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

/**
 * デフォルトのストレージサービスインスタンス
 * アプリケーション全体で使用される標準のlocalStorage実装
 */
export const defaultStorageService = new LocalStorageService();
