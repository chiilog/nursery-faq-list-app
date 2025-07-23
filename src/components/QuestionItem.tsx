import { useState } from 'react';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  Input,
  Textarea,
} from '@chakra-ui/react';
import type { Question } from '../types';

interface QuestionItemProps {
  question: Question;
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onDelete: (questionId: string) => void;
}

export const QuestionItem = ({
  question,
  onUpdate,
  onDelete,
}: QuestionItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [editedText, setEditedText] = useState(question.text);
  const [editedPriority, setEditedPriority] = useState(question.priority);
  const [answerText, setAnswerText] = useState(question.answer || '');
  const [validationError, setValidationError] = useState('');

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

  const getPriorityColorScheme = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setEditedText(question.text);
    setEditedPriority(question.priority);
    setValidationError('');
  };

  const handleEditSave = () => {
    if (!editedText.trim()) {
      setValidationError('質問文を入力してください');
      return;
    }

    onUpdate(question.id, {
      text: editedText,
      priority: editedPriority,
    });
    setIsEditing(false);
    setValidationError('');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedText(question.text);
    setEditedPriority(question.priority);
    setValidationError('');
  };

  const handleAnswerStart = () => {
    setIsAnswering(true);
    setAnswerText(question.answer || '');
  };

  const handleAnswerSave = () => {
    onUpdate(question.id, {
      answer: answerText,
      isAnswered: true,
      answeredAt: new Date(),
    });
    setIsAnswering(false);
  };

  const handleAnswerCancel = () => {
    setIsAnswering(false);
    setAnswerText(question.answer || '');
  };

  const handleDeleteClick = () => {
    if (window.confirm(`この質問を削除しますか？\n「${question.text}」`)) {
      onDelete(question.id);
    }
  };

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      bg="white"
      shadow="sm"
      _hover={{ shadow: 'md' }}
    >
      <VStack align="stretch" spacing={3}>
        {/* 質問文とメタ情報 */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="stretch" flex={1} spacing={2}>
            {isEditing ? (
              <VStack align="stretch" spacing={2}>
                <Input
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="質問を入力してください"
                  size="md"
                />
                <select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value)}
                  aria-label="優先度"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    maxWidth: '120px',
                  }}
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
                {validationError && (
                  <Text color="red.500" fontSize="sm">
                    {validationError}
                  </Text>
                )}
              </VStack>
            ) : (
              <>
                <Text fontWeight="medium" fontSize="md">
                  {question.text}
                </Text>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getPriorityColorScheme(question.priority)}
                  >
                    {getPriorityLabel(question.priority)}
                  </Badge>
                  {question.isAnswered && (
                    <Badge colorScheme="green">回答済み</Badge>
                  )}
                </HStack>
              </>
            )}
          </VStack>
        </HStack>

        {/* 回答表示 */}
        {!isEditing && question.isAnswered && question.answer && (
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

        {/* 回答入力モード */}
        {isAnswering && (
          <VStack align="stretch" spacing={3}>
            <Textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="回答を入力してください"
              aria-label="回答を入力してください"
              rows={3}
            />
            <HStack spacing={2}>
              <Button
                colorScheme="teal"
                size="sm"
                onClick={handleAnswerSave}
                minH="44px"
              >
                回答を保存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnswerCancel}
                minH="44px"
              >
                キャンセル
              </Button>
            </HStack>
          </VStack>
        )}

        {/* アクションボタン */}
        <HStack spacing={2} justify="flex-end">
          {isEditing ? (
            <>
              <Button
                colorScheme="teal"
                size="sm"
                onClick={handleEditSave}
                minH="44px"
              >
                保存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditCancel}
                minH="44px"
              >
                キャンセル
              </Button>
            </>
          ) : (
            <>
              {!isAnswering && !question.isAnswered && (
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={handleAnswerStart}
                  minH="44px"
                >
                  回答を入力
                </Button>
              )}
              {!isAnswering && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditStart}
                  minH="44px"
                >
                  編集
                </Button>
              )}
              {!isAnswering && (
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  minH="44px"
                >
                  削除
                </Button>
              )}
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};
