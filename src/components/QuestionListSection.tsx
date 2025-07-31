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
  Badge,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import type { Question } from '../types/data';

interface QuestionEditFormProps {
  question: Question;
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

interface QuestionDisplayProps {
  question: Question;
  onQuestionClick: (
    questionId: string,
    currentAnswer: string,
    questionText: string
  ) => void;
}

/**
 * 優先度に基づいてバッジの色を取得
 */
const getPriorityColorScheme = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'yellow';
    default:
      return 'gray';
  }
};

/**
 * 優先度に基づいてバッジのテキストを取得
 */
const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    default:
      return '低';
  }
};

const QuestionDisplay = ({
  question,
  onQuestionClick,
}: QuestionDisplayProps) => (
  <VStack align="stretch" gap={3}>
    <HStack justify="space-between" align="flex-start" wrap="wrap">
      <Text
        fontWeight="bold"
        cursor="pointer"
        onClick={() =>
          onQuestionClick(question.id, question.answer || '', question.text)
        }
        _hover={{ color: 'brand.600' }}
        flex={1}
        fontSize={{ base: 'sm', md: 'md' }}
        minW="0"
        wordBreak="break-word"
      >
        {question.text}
      </Text>
      <HStack gap={2} flexShrink={0}>
        {question.isAnswered && (
          <Badge colorScheme="green" size="sm">
            回答済み
          </Badge>
        )}
        <Badge
          colorScheme={getPriorityColorScheme(question.priority)}
          size="sm"
        >
          {getPriorityText(question.priority)}
        </Badge>
      </HStack>
    </HStack>
    {question.answer && (
      <Box
        pl={4}
        borderLeft="3px"
        borderColor="brand.200"
        bg="gray.50"
        p={3}
        borderRadius="md"
      >
        <Text
          color="gray.700"
          fontSize={{ base: 'sm', md: 'md' }}
          whiteSpace="pre-wrap"
        >
          {question.answer}
        </Text>
      </Box>
    )}
    {!question.answer && (
      <Text
        color="gray.400"
        fontSize="sm"
        fontStyle="italic"
        cursor="pointer"
        onClick={() =>
          onQuestionClick(question.id, question.answer || '', question.text)
        }
        _hover={{ color: 'brand.500' }}
      >
        クリックして回答を追加
      </Text>
    )}
  </VStack>
);

interface QuestionListSectionProps {
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

export const QuestionListSection = ({
  questions,
  editingQuestionId,
  editingQuestionText,
  editingAnswer,
  onQuestionClick,
  onEditingQuestionTextChange,
  onEditingAnswerChange,
  onSaveAnswer,
  onCancelEdit,
}: QuestionListSectionProps) => {
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
          p={{ base: 4, md: 5 }}
          border="1px"
          borderColor={question.isAnswered ? 'green.200' : 'gray.200'}
          borderRadius="lg"
          bg={question.isAnswered ? 'green.50' : 'white'}
          shadow="sm"
          _hover={{ shadow: 'md' }}
          transition="all 0.2s"
        >
          {editingQuestionId === question.id ? (
            <QuestionEditForm
              question={question}
              editingQuestionText={editingQuestionText}
              editingAnswer={editingAnswer}
              onQuestionTextChange={onEditingQuestionTextChange}
              onAnswerChange={onEditingAnswerChange}
              onSaveAnswer={onSaveAnswer}
              onCancelEdit={onCancelEdit}
            />
          ) : (
            <QuestionDisplay
              question={question}
              onQuestionClick={onQuestionClick}
            />
          )}
        </Box>
      ))}
    </VStack>
  );
};
