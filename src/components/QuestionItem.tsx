/**
 * 質問項目コンポーネント
 */

import { Box, Text, HStack, Badge, VStack, IconButton } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import type { Question } from '../types/entities';

interface QuestionItemProps {
  question: Question;
  onQuestionClick: (
    questionId: string,
    currentAnswer: string,
    questionText: string
  ) => void;
  onDelete?: (questionId: string) => void;
}

export const QuestionItem = ({
  question,
  onQuestionClick,
  onDelete,
}: QuestionItemProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // ボタンクリック時は何もしない
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    onQuestionClick(question.id, question.answer || '', question.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onQuestionClick(question.id, question.answer || '', question.text);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;

    const confirmed = window.confirm(
      `この操作は取り消せません。この質問を削除しますか？`
    );

    if (confirmed) {
      onDelete(question.id);
    }
  };

  return (
    <Box
      p={{ base: 4, md: 5 }}
      border="1px"
      borderColor={question.isAnswered ? 'green.200' : 'gray.200'}
      borderRadius="lg"
      bg={question.isAnswered ? 'green.50' : 'white'}
      shadow="sm"
      _hover={{ shadow: 'md', cursor: 'pointer' }}
      transition="all 0.2s"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`質問: ${question.text}${question.isAnswered ? ' (回答済み)' : ' (未回答)'}`}
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="flex-start" wrap="wrap">
          <Text
            fontWeight="bold"
            flex={1}
            fontSize={{ base: 'sm', md: 'md' }}
            minW="0"
            wordBreak="break-word"
          >
            {question.text}
          </Text>
          <HStack gap={2} flexShrink={0}>
            {question.isAnswered && (
              <Badge colorPalette="green" size="sm">
                回答済み
              </Badge>
            )}
            {onDelete && (
              <IconButton
                aria-label="質問を削除"
                size="sm"
                colorPalette="red"
                variant="surface"
                onClick={handleDeleteClick}
                _hover={{ bg: 'red.50' }}
              >
                <FaTrash />
              </IconButton>
            )}
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
          <Text color="gray.400" fontSize="sm" fontStyle="italic">
            クリックして回答を追加
          </Text>
        )}
      </VStack>
    </Box>
  );
};
