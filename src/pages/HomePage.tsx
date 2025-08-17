import { Box, Button, Text, VStack, Spinner } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NurseryCard } from '../components/NurseryCard';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { EmptyState } from '../components/EmptyState';
import { Layout } from '../components/Layout';
import { useNurseryStore } from '../stores/nurseryStore';
import { showToast } from '../utils/toaster';
import { APP_CONFIG } from '../constants/app';
import type { Nursery } from '../types/entities';

interface HomePageProps {
  onCreateNew: () => void;
}

export const HomePage = ({ onCreateNew }: HomePageProps) => {
  const navigate = useNavigate();
  const {
    nurseries,
    loading,
    error,
    loadNurseries,
    clearError,
    setCurrentNursery,
  } = useNurseryStore();

  useEffect(() => {
    void loadNurseries();
  }, [loadNurseries]);

  const handleNurseryClick = async (nursery: Nursery) => {
    try {
      await setCurrentNursery(nursery.id);
      void navigate(`/nursery/${nursery.id}`);
    } catch (error) {
      console.error('保育園選択エラー:', error);
      showToast.error(
        '保育園選択エラー',
        '保育園の選択に失敗しました。もう一度お試しください。'
      );
    }
  };

  if (loading.isLoading) {
    return (
      <Layout>
        <Box textAlign="center" py={8}>
          <Spinner size="lg" color="brand.500" />
          <Text mt={4} color="gray.600">
            {loading.operation || '読み込み中...'}
          </Text>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout headerVariant="with-buttons" leftButton={{ hidden: true }}>
      <Box>
        {error && <ErrorDisplay error={error} onClose={clearError} />}

        <VStack gap={4} align="stretch">
          <Box textAlign="center">
            <Button
              bgColor={APP_CONFIG.COLORS.PRIMARY}
              size="lg"
              onClick={onCreateNew}
              borderRadius="full"
              px={8}
              py={6}
              fontSize="md"
              fontWeight="bold"
            >
              <Text fontSize="lg" mr={2}>
                ＋
              </Text>
              保育園を追加する
            </Button>
          </Box>

          {nurseries.length === 0 ? (
            <EmptyState
              title="まだ保育園が追加されていません"
              description="「保育園を追加する」ボタンから始めましょう"
            />
          ) : (
            <VStack gap={4} align="stretch">
              {nurseries.map((nursery) => (
                <NurseryCard
                  key={nursery.id}
                  nursery={nursery}
                  onClick={(nursery) => void handleNurseryClick(nursery)}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </Layout>
  );
};
