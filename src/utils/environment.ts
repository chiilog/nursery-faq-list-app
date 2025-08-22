export const isDevelopment = (): boolean => {
  // Vite環境 (ブラウザ側)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV;
  }
  // Node/SSR fallback
  return (
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
  );
};

export const validateEnvironmentVariable = (
  varName: string,
  value: string | undefined
): string => {
  if (!value) {
    throw new Error(`Environment variable ${varName} is not defined`);
  }
  return value;
};

export const safeExecute = async <T>(
  operation: () => Promise<T> | T,
  context: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    return null;
  }
};
