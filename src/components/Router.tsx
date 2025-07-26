import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Box, Heading, Text, Button, VStack, Spinner } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { NurseryCard } from './NurseryCard';
import { useNurseryStore } from '../stores/nurseryStore';
import type { Nursery } from '../types/data';
// import { NurseryCreator } from './NurseryCreator'; // TODO: 実装予定

// ホームページコンポーネント（保育園カード一覧）
const HomePage = () => {
  const [isCreating, setIsCreating] = useState(false);
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

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  // TODO: 保育園作成機能は次のステップで実装

  const handleCreateCancel = () => {
    setIsCreating(false);
  };

  const handleNurseryClick = async (nursery: Nursery) => {
    try {
      await setCurrentNursery(nursery.id);
      // TODO: 保育園詳細ページへの遷移を実装
      console.log('保育園詳細ページに遷移:', nursery.name);
    } catch (error) {
      console.error('保育園選択エラー:', error);
    }
  };

  if (isCreating) {
    return (
      <Box maxW="md" mx="auto" p={6}>
        <Heading as="h2" size="lg" mb={4}>
          新しい保育園を追加
        </Heading>
        <VStack gap={4} align="stretch">
          <Text>保育園作成フォームは次のステップで実装予定です。</Text>
          <Button onClick={handleCreateCancel}>戻る</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Box
          p={4}
          bg="red.50"
          borderColor="red.200"
          borderWidth={1}
          borderRadius="md"
          mb={6}
        >
          <Text color="red.700" fontWeight="medium">
            {error.message}
          </Text>
          <Button size="sm" mt={2} onClick={clearError}>
            エラーを閉じる
          </Button>
        </Box>
      )}

      <VStack gap={4} align="stretch">
        {/* メインアクションボタン */}
        <Box textAlign="center">
          <Button
            colorScheme="brand"
            size="lg"
            onClick={handleCreateNew}
            disabled={loading.isLoading}
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

        {/* 保育園カード一覧 */}
        {loading.isLoading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color="brand.500" />
            <Text mt={4} color="gray.600">
              {loading.operation || '読み込み中...'}
            </Text>
          </Box>
        ) : nurseries.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="gray.600" fontSize="lg" mb={2}>
              まだ保育園が追加されていません
            </Text>
            <Text color="gray.500" fontSize="sm">
              「保育園を追加する」ボタンから始めましょう
            </Text>
          </Box>
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
  );
};

const NotFoundPage = () => (
  <Box textAlign="center" py={10}>
    <Heading as="h2" size="xl" mb={4}>
      404
    </Heading>
    <Text>ページが見つかりません</Text>
  </Box>
);

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/nursery"
          element={<Text>保育園管理ページ（実装中）</Text>}
        />
        <Route
          path="/nursery/:nurseryId"
          element={<Text>保育園詳細ページ（実装中）</Text>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
