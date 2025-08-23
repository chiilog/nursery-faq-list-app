export class AnalyticsError extends Error {
  constructor(
    message: string,
    public readonly service: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

/**
 * @description 分析サービスのエラーを統一的に処理する関数
 * @param error - 発生したエラー
 * @param service - エラーが発生したサービス名
 * @param operation - 実行していた操作名
 * @example
 * ```typescript
 * handleAnalyticsError(error, 'GA4Service', 'initialize');
 * ```
 */
export const handleAnalyticsError = (
  error: unknown,
  service: string,
  operation: string
): void => {
  const analyticsError = new AnalyticsError(
    `Failed to ${operation}`,
    service,
    error instanceof Error ? error : undefined
  );
  console.error(analyticsError);
};
