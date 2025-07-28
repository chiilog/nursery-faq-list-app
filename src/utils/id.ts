/**
 * ID生成ユーティリティ
 */

/**
 * プレフィックス付きのユニークIDを生成
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/**
 * シンプルなユニークIDを生成
 */
export function generateId(): string {
  return crypto.randomUUID();
}
