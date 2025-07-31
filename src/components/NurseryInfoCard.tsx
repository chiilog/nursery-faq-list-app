/**
 * 保育園情報カードコンポーネント
 * ホームページのNurseryCardデザインを統合した編集可能なカード
 */

import { Box, Text, VStack, Input } from '@chakra-ui/react';
import { useMemo } from 'react';
import type { Question } from '../types/data';

interface NurseryInfoCardProps {
  nurseryName: string;
  visitDate: Date | null;
  questions: Question[];
  isEditing?: boolean;
  editingName?: string;
  newVisitDate?: string;
  hasNameError?: boolean;
  onNameChange?: (value: string) => void;
  onVisitDateChange?: (value: string) => void;
}

/**
 * 日付フォーマッター（NurseryCardと同じ形式）
 */
const formatDate = (date: Date): string => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 質問進捗計算
 */
const getQuestionProgress = (
  questions: Question[]
): { text: string; percentage: number } => {
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const percentage =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  return {
    text: `${answeredCount}/${questions.length}`,
    percentage,
  };
};

export const NurseryInfoCard = ({
  nurseryName,
  visitDate,
  questions,
  isEditing = false,
  editingName = '',
  newVisitDate = '',
  hasNameError = false,
  onNameChange,
  onVisitDateChange,
}: NurseryInfoCardProps) => {
  // 進捗データをメモ化してパフォーマンス最適化
  const progressData = useMemo(
    () => getQuestionProgress(questions),
    [questions]
  );

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      bg="white"
      shadow="sm"
      transition="all 0.2s ease-in-out"
      _hover={{
        shadow: 'md',
      }}
    >
      <VStack align="stretch" gap={3}>
        {/* 保育園名 */}
        {isEditing ? (
          <VStack align="stretch" gap={1}>
            <Input
              size="lg"
              value={editingName}
              onChange={(e) => onNameChange?.(e.target.value)}
              placeholder="保育園名を入力してください"
              fontSize="lg"
              fontWeight="bold"
              bg="white"
              borderColor={hasNameError ? 'red.500' : 'brand.300'}
              _focus={{
                borderColor: hasNameError ? 'red.500' : 'brand.500',
                shadow: hasNameError ? '0 0 0 1px red.500' : 'outline',
              }}
              data-error={hasNameError}
            />
            {hasNameError && (
              <Text color="red.500" fontSize="sm">
                保育園名を入力してください
              </Text>
            )}
          </VStack>
        ) : (
          <Text
            fontWeight="bold"
            fontSize="lg"
            color="gray.800"
            textAlign="left"
            lineHeight="1.3"
          >
            {nurseryName}
          </Text>
        )}

        {/* 詳細情報部分: 見学日と質問進捗 */}
        <VStack align="stretch" gap={1}>
          {isEditing ? (
            <VStack align="stretch" gap={1}>
              <Text color="gray.600" fontSize="sm" fontWeight="medium">
                見学日
              </Text>
              <Input
                type="date"
                value={newVisitDate}
                onChange={(e) => onVisitDateChange?.(e.target.value)}
                size="lg"
                bg="white"
                borderColor="brand.300"
                _focus={{ borderColor: 'brand.500', shadow: 'outline' }}
                aria-label="見学日を選択してください"
              />
            </VStack>
          ) : (
            <Text color="gray.600" fontSize="sm" textAlign="left">
              見学日: {visitDate ? formatDate(visitDate) : '未設定'}
            </Text>
          )}

          <Text color="gray.600" fontSize="sm" textAlign="left">
            質問進捗: {progressData.text}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};
