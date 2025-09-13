/**
 * エラー表示コンポーネント
 */

import { Button } from '@chakra-ui/react';

interface ErrorDisplayProps {
  error: {
    message: string;
    timestamp: Date;
  } | null;
  onClearError: () => void;
}

export const ErrorDisplay = ({ error, onClearError }: ErrorDisplayProps) => {
  if (!error) {
    return null;
  }

  return (
    <div>
      <p>{error.message}</p>
      <Button onClick={onClearError}>エラーを閉じる</Button>
    </div>
  );
};
