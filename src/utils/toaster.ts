/**
 * トースト通知のユーティリティ
 * Chakra UI v3対応
 */

import { toaster } from '../lib/toaster';

/**
 * トースト表示のヘルパーユーティリティ
 * Chakra UI v3の最新仕様に対応
 */
export const showToast = {
  /**
   * 成功通知を表示
   */
  success: (message: string) =>
    toaster.create({
      description: message,
      type: 'success',
      duration: 3000,
    }),

  /**
   * エラー通知を表示
   */
  error: (message: string) =>
    toaster.create({
      description: message,
      type: 'error',
      duration: 5000,
    }),

  /**
   * 警告通知を表示
   */
  warning: (message: string) =>
    toaster.create({
      description: message,
      type: 'warning',
      duration: 4000,
    }),

  /**
   * 情報通知を表示
   */
  info: (message: string) =>
    toaster.create({
      description: message,
      type: 'info',
      duration: 3000,
    }),

  /**
   * 読み込み中の通知を表示
   */
  loading: (message: string) =>
    toaster.create({
      description: message,
      type: 'loading',
    }),
};
