/**
 * 保育園情報カードコンポーネント
 * ホームページのNurseryCardデザインを統合した編集可能なカード
 */

import { Box, Text, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';
import { VisitDatePicker } from './common/VisitDatePicker';
import { NurseryNameInput } from './common/NurseryNameInput';
import type { Question } from '../types/data';
import { formatDate } from '../utils/dateFormat';

interface NurseryInfoCardProps {
  nurseryName: string;
  visitDate: Date | null;
  questions: Question[];
  isEditing?: boolean;
  editingName?: string;
  newVisitDate?: Date | null;
  hasNameError?: boolean;
  onNameChange?: (value: string) => void;
  onVisitDateChange?: (date: Date | null) => void;
}

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
  newVisitDate = null,
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
          <NurseryNameInput
            value={editingName}
            onChange={(value) => onNameChange?.(value)}
            isInvalid={hasNameError}
            errorMessage={
              hasNameError ? '保育園名を入力してください' : undefined
            }
          />
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
              <VisitDatePicker
                selectedDate={newVisitDate}
                onChange={onVisitDateChange!}
                label="見学日"
                placeholder="見学日を選択してください"
                disabled={false}
              />
            </VStack>
          ) : (
            <Text color="gray.600" fontSize="sm" textAlign="left">
              見学日: {visitDate ? formatDate(visitDate) : '未定'}
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
