/**
 * ローディング表示コンポーネント
 */

interface LoadingDisplayProps {
  loading: {
    isLoading: boolean;
    operation?: string;
  };
}

export const LoadingDisplay = ({ loading }: LoadingDisplayProps) => {
  if (!loading.isLoading) {
    return null;
  }

  return (
    <div>
      <span>{loading.operation || '処理中...'}</span>
    </div>
  );
};
