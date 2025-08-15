/**
 * ストレージ抽象化レイヤー
 *
 * localStorage操作の共通インターフェースを提供し、
 * 依存性注入によるテスタビリティと保守性を向上させる
 */

import { DataStoreError } from '../types/errors';

export interface StorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * localStorage実装
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

// デフォルトインスタンス
export const defaultStorageService = new LocalStorageService();
