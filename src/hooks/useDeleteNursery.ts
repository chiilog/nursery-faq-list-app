/**
 * 保育園削除処理用カスタムフック
 * 削除ロジック、エラーハンドリング、ナビゲーションを責務分離
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNurseryStore } from '../stores/nurseryStore';
import { showToast } from '../utils/toaster';

interface UseDeleteNurseryReturn {
  isDeleting: boolean;
  error: string | null;
  handleDelete: (
    nurseryId: string
  ) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useDeleteNursery = (): UseDeleteNurseryReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { deleteNursery } = useNurseryStore();

  const handleDelete = async (nurseryId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteNursery(nurseryId);
      showToast.success('保育園を削除しました');
      void navigate('/');
      return { success: true };
    } catch (err) {
      const errorMessage =
        '保育園の削除に失敗しました。もう一度お試しください。';
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error('Failed to delete nursery:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isDeleting,
    error,
    handleDelete,
    clearError,
  };
};
