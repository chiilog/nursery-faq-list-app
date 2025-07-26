import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { QuestionListCreator } from './QuestionListCreator';
import { useQuestionListStore } from '../stores/questionListStore';
// import { NurseryPage } from '../pages/NurseryPage';

// 日付フォーマット用のユーティリティ関数
const formatDate = (date: unknown): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date as string);
    return isNaN(dateObj.getTime())
      ? '日付不正'
      : dateObj.toLocaleDateString('ja-JP');
  } catch {
    return '日付不正';
  }
};

// ホームページコンポーネント
const HomePage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const {
    questionLists,
    loading,
    error,
    loadQuestionLists,
    createQuestionList,
    clearError,
  } = useQuestionListStore();

  useEffect(() => {
    void loadQuestionLists();
  }, [loadQuestionLists]);

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleCreateSubmit = async (data: {
    title: string;
    nurseryName: string;
    visitDate: Date | undefined;
  }) => {
    try {
      await createQuestionList({
        title: data.title,
        nurseryName: data.nurseryName,
        visitDate: data.visitDate,
      });
      setIsCreating(false);
    } catch (error) {
      // エラーはストアで管理されているので、ここではログ出力のみ
      console.error('質問リスト作成エラー:', error);
    }
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <QuestionListCreator
        onCreate={(data) => void handleCreateSubmit(data)}
        onCancel={handleCreateCancel}
      />
    );
  }

  return (
    <Box>
      <Heading as="h2" size="xl" mb={4}>
        質問リスト一覧
      </Heading>

      {error && (
        <Box
          p={3}
          bg="red.50"
          borderColor="red.200"
          borderWidth={1}
          borderRadius="md"
          mb={4}
        >
          <Text color="red.700">{error.message}</Text>
          <Button size="sm" mt={2} onClick={clearError}>
            エラーを閉じる
          </Button>
        </Box>
      )}

      <VStack gap={4} align="stretch">
        {loading.isLoading ? (
          <Box textAlign="center" py={4}>
            <Spinner size="md" />
            <Text mt={2}>{loading.operation || '読み込み中...'}</Text>
          </Box>
        ) : questionLists.length === 0 ? (
          <Text color="gray.600">まだ質問リストがありません。</Text>
        ) : (
          <VStack gap={2} align="stretch">
            {questionLists.map((list) => {
              try {
                return (
                  <Box
                    key={list.id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    bg="white"
                    shadow="sm"
                    _hover={{ shadow: 'md' }}
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold" fontSize="lg">
                          {list.title || '無題'}
                        </Text>
                        <Badge colorScheme="blue">
                          {list.questions?.length || 0}問
                        </Badge>
                      </HStack>
                      {list.nurseryName && (
                        <Text color="gray.600" fontSize="sm">
                          {list.nurseryName}
                        </Text>
                      )}
                      {list.visitDate && (
                        <Text color="gray.600" fontSize="sm">
                          見学予定日: {formatDate(list.visitDate)}
                        </Text>
                      )}
                      <Text color="gray.500" fontSize="xs">
                        作成日: {formatDate(list.createdAt)}
                      </Text>
                    </VStack>
                  </Box>
                );
              } catch (error) {
                console.error('質問リスト表示エラー:', error);
                return (
                  <Box
                    key={list.id || `error-item-${questionLists.indexOf(list)}`}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    bg="red.50"
                    borderColor="red.200"
                  >
                    <Text color="red.700">
                      この質問リストの表示でエラーが発生しました
                    </Text>
                  </Box>
                );
              }
            })}
          </VStack>
        )}

        <Box>
          <Button
            colorScheme="teal"
            onClick={handleCreateNew}
            disabled={loading.isLoading}
          >
            新しい質問リストを作成
          </Button>
        </Box>
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
