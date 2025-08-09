/**
 * 保育園情報表示コンポーネント
 */

import { Box, Text, VStack, Input } from '@chakra-ui/react';
import { useMemo } from 'react';
import type { Question } from '../types/data';
import { InlineFormActions } from './NurseryCreator/FormActions';

interface NurseryInfoProps {
  visitDate: Date | null;
  questions: Question[];
  isEditingVisitDate: boolean;
  newVisitDate: string;
  onVisitDateClick: () => void;
  onVisitDateChange: (value: string) => void;
  onSaveVisitDate: () => void;
  onCancelVisitDate: () => void;
}

/**
 * 日付フォーマッター
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
    text: `${answeredCount}/${questions.length} 回答済み`,
    percentage,
  };
};

export const NurseryInfo = ({
  visitDate,
  questions,
  isEditingVisitDate,
  newVisitDate,
  onVisitDateClick,
  onVisitDateChange,
  onSaveVisitDate,
  onCancelVisitDate,
}: NurseryInfoProps) => {
  // 進捗データをメモ化してパフォーマンス最適化
  const progressData = useMemo(
    () => getQuestionProgress(questions),
    [questions]
  );

  return (
    <Box
      bg="gray.50"
      p={0}
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
    >
      <VStack align="stretch" gap={{ base: 2, md: 3 }}>
        {/* 見学予定日 */}
        <Box flex={1}>
          <Text
            aria-label="見学予定日"
            fontWeight="bold"
            color="gray.700"
            mb={2}
            fontSize="sm"
          >
            見学予定日
          </Text>
          {isEditingVisitDate ? (
            <VStack align="stretch" gap={2}>
              <Input
                type="date"
                value={newVisitDate}
                onChange={(e) => onVisitDateChange(e.target.value)}
                size="lg"
                bg="white"
              />
              <InlineFormActions
                size="sm"
                onSave={onSaveVisitDate}
                onCancel={onCancelVisitDate}
              />
            </VStack>
          ) : (
            <Text
              cursor="pointer"
              color="brand.600"
              onClick={onVisitDateClick}
              _hover={{
                textDecoration: 'underline',
                color: 'brand.700',
                bg: 'brand.50',
              }}
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="medium"
              p={2}
              borderRadius="md"
              transition="all 0.2s"
            >
              {visitDate ? formatDate(visitDate) : '未設定'}
            </Text>
          )}
        </Box>

        {/* 質問進捗 */}
        <Box flex={1}>
          <Text
            aria-label="質問進捗"
            fontWeight="bold"
            color="gray.700"
            mb={2}
            fontSize="sm"
          >
            質問進捗
          </Text>
          <Text
            color="gray.600"
            fontSize={{ base: 'md', md: 'lg' }}
            fontWeight="medium"
          >
            {progressData.text}
          </Text>
          {questions.length > 0 && (
            <Box mt={2} bg="gray.200" borderRadius="full" h={2}>
              <Box
                bg="brand.500"
                borderRadius="full"
                h={2}
                width={`${progressData.percentage}%`}
                transition="width 0.3s"
              />
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};
