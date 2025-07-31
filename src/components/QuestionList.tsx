/**
 * 質問リストセクションコンポーネント
 */

import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import type { Question } from '../types/data';
import { QuestionItem } from './QuestionItem';

interface QuestionEditFormProps {
  editingQuestionText: string;
  editingAnswer: string;
  onQuestionTextChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onSaveAnswer: () => void;
  onCancelEdit: () => void;
}

const QuestionEditForm = ({
  editingQuestionText,
  editingAnswer,
  onQuestionTextChange,
  onAnswerChange,
  onSaveAnswer,
  onCancelEdit,
}: QuestionEditFormProps) => (
  <VStack align="stretch" gap={3}>
    <Input
      size="lg"
      value={editingQuestionText}
      onChange={(e) => onQuestionTextChange(e.target.value)}
      placeholder="質問を入力してください"
      bg="white"
    />
    <Textarea
      size="lg"
      placeholder="回答を入力してください"
      value={editingAnswer}
      onChange={(e) => onAnswerChange(e.target.value)}
      rows={3}
      bg="white"
      resize="vertical"
      autoresize
    />
    <HStack justify="flex-end" gap={2}>
      <Button
        variant="ghost"
        onClick={onCancelEdit}
        size={{ base: 'sm', md: 'md' }}
      >
        キャンセル
      </Button>
      <Button
        colorScheme="brand"
        onClick={onSaveAnswer}
        size={{ base: 'sm', md: 'md' }}
      >
        保存
      </Button>
    </HStack>
  </VStack>
);

interface QuestionListProps {
  questions: Question[];
  editingQuestionId: string | null;
  editingQuestionText: string;
  editingAnswer: string;
  onQuestionClick: (
    questionId: string,
    currentAnswer: string,
    questionText: string
  ) => void;
  onEditingQuestionTextChange: (value: string) => void;
  onEditingAnswerChange: (value: string) => void;
  onSaveAnswer: () => void;
  onCancelEdit: () => void;
}

export const QuestionList = ({
  questions,
  editingQuestionId,
  editingQuestionText,
  editingAnswer,
  onQuestionClick,
  onEditingQuestionTextChange,
  onEditingAnswerChange,
  onSaveAnswer,
  onCancelEdit,
}: QuestionListProps) => {
  // 未回答の質問を先に表示（useMemoでパフォーマンス最適化）
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      if (a.isAnswered === b.isAnswered) {
        return a.orderIndex - b.orderIndex;
      }
      return a.isAnswered ? 1 : -1;
    });
  }, [questions]);

  if (questions.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <Text fontSize="lg" mb={2}>
          まだ質問がありません
        </Text>
        <Text fontSize="sm">
          「質問を追加」ボタンから質問を追加してください
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      {sortedQuestions.map((question) => (
        <Box
          key={question.id}
          data-testid={`question-item-${question.id}`}
          data-priority={question.priority}
        >
          {editingQuestionId === question.id ? (
            <Box
              p={{ base: 4, md: 5 }}
              border="1px"
              borderColor={question.isAnswered ? 'green.200' : 'gray.200'}
              borderRadius="lg"
              bg={question.isAnswered ? 'green.50' : 'white'}
              shadow="sm"
              _hover={{ shadow: 'md' }}
              transition="all 0.2s"
            >
              <QuestionEditForm
                editingQuestionText={editingQuestionText}
                editingAnswer={editingAnswer}
                onQuestionTextChange={onEditingQuestionTextChange}
                onAnswerChange={onEditingAnswerChange}
                onSaveAnswer={onSaveAnswer}
                onCancelEdit={onCancelEdit}
              />
            </Box>
          ) : (
            <QuestionItem
              question={question}
              onQuestionClick={onQuestionClick}
            />
          )}
        </Box>
      ))}
    </VStack>
  );
};
