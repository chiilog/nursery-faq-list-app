import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Button,
  Input,
  HStack,
  Container,
} from '@chakra-ui/react';
import type { QuestionList as QuestionListType, Question } from '../types';

interface QuestionListProps {
  questionList: QuestionListType;
  onQuestionUpdate?: (questionId: string, updates: Partial<Question>) => void;
}

export const QuestionList = ({
  questionList,
  onQuestionUpdate,
}: QuestionListProps) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null
  );
  const [answerText, setAnswerText] = useState('');

  // 質問を並び替え: 未回答を上、回答済みを下
  const sortedQuestions = [...questionList.questions].sort((a, b) => {
    if (a.isAnswered === b.isAnswered) {
      return a.orderIndex - b.orderIndex;
    }
    return a.isAnswered ? 1 : -1;
  });

  const handleQuestionClick = (questionId: string) => {
    setExpandedQuestionId(
      expandedQuestionId === questionId ? null : questionId
    );
    setAnswerText('');
  };

  const handleSaveAnswer = (questionId: string) => {
    if (onQuestionUpdate) {
      onQuestionUpdate(questionId, {
        answer: answerText,
        isAnswered: true,
        answeredAt: new Date(),
      });
    }
    setExpandedQuestionId(null);
    setAnswerText('');
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return priority;
    }
  };

  if (questionList.questions.length === 0) {
    return (
      <Container maxW="container.md" py={6}>
        <VStack gap={4} align="stretch">
          <Heading as="h1" size="lg" textAlign="center">
            {questionList.title}
          </Heading>
          <Text textAlign="center" color="gray.500">
            質問がありません
          </Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={6}>
      <VStack gap={6} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="lg" mb={2}>
            {questionList.title}
          </Heading>
          <Text fontWeight="medium" color="gray.700">
            {questionList.nurseryName}
          </Text>
          {questionList.visitDate && (
            <Text color="gray.600" fontSize="sm">
              {formatDate(questionList.visitDate)}
            </Text>
          )}
        </Box>

        <Box as="ul" role="list" aria-label="質問リスト" listStyleType="none">
          {sortedQuestions.map((question) => (
            <Box as="li" key={question.id} role="listitem" mb={4}>
              <Box
                cursor="pointer"
                onClick={(e) => {
                  // 子要素（input、button）がクリックされた場合は処理をスキップ
                  const target = e.target as HTMLElement;
                  if (
                    target.tagName === 'INPUT' ||
                    target.tagName === 'BUTTON' ||
                    target.closest('input, button')
                  ) {
                    return;
                  }
                  handleQuestionClick(question.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleQuestionClick(question.id);
                  }
                }}
                _hover={{ bg: 'gray.50' }}
                minH="44px"
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg="white"
                shadow="sm"
                role="button"
                aria-label={`質問: ${question.text}`}
                tabIndex={0}
              >
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between" align="flex-start">
                    <Text fontWeight="medium" flex={1}>
                      {question.text}
                    </Text>
                    <HStack gap={2}>
                      <Badge
                        colorScheme={
                          question.priority === 'high'
                            ? 'red'
                            : question.priority === 'medium'
                              ? 'yellow'
                              : 'gray'
                        }
                      >
                        {getPriorityLabel(question.priority)}
                      </Badge>
                      {question.isAnswered && (
                        <Badge colorScheme="green">回答済み</Badge>
                      )}
                    </HStack>
                  </HStack>

                  {question.isAnswered && question.answer && (
                    <Text
                      color="gray.600"
                      fontSize="sm"
                      bg="gray.50"
                      p={2}
                      borderRadius="md"
                    >
                      {question.answer}
                    </Text>
                  )}

                  {expandedQuestionId === question.id && (
                    <VStack gap={3} align="stretch" pt={2}>
                      <Input
                        placeholder="回答を入力してください"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                      />
                      <Button
                        colorScheme="teal"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveAnswer(question.id);
                        }}
                      >
                        保存
                      </Button>
                    </VStack>
                  )}
                </VStack>
              </Box>
            </Box>
          ))}
        </Box>
      </VStack>
    </Container>
  );
};
