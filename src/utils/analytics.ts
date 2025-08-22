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
