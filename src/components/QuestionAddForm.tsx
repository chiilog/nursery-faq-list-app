/**
 * 質問追加フォームコンポーネント
 */

import {
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react';
import { useCallback } from 'react';

interface QuestionAddFormProps {
  isAddingQuestion: boolean;
  newQuestionText: string;
  newAnswerText: string;
  onToggleAddForm: (value: boolean) => void;
  onNewQuestionTextChange: (value: string) => void;
  onNewAnswerTextChange: (value: string) => void;
  onAddQuestion: () => void;
}

export const QuestionAddForm = ({
  isAddingQuestion,
  newQuestionText,
  newAnswerText,
  onToggleAddForm,
  onNewQuestionTextChange,
  onNewAnswerTextChange,
  onAddQuestion,
}: QuestionAddFormProps) => {
  const handleCancel = useCallback(() => {
    onNewQuestionTextChange('');
    onNewAnswerTextChange('');
    onToggleAddForm(false);
  }, [onNewQuestionTextChange, onNewAnswerTextChange, onToggleAddForm]);

  const handleStartAdding = useCallback(() => {
    onToggleAddForm(true);
  }, [onToggleAddForm]);
  if (isAddingQuestion) {
    return (
      <VStack align="stretch">
        <Input
          size="lg"
          placeholder="新しい質問を入力してください"
          aria-label="質問入力"
          autoFocus
          value={newQuestionText}
          onChange={(e) => onNewQuestionTextChange(e.target.value)}
          bg="white"
        />
        <Textarea
          size="lg"
          placeholder="回答があれば入力してください（任意）"
          aria-label="回答入力（任意）"
          value={newAnswerText}
          onChange={(e) => onNewAnswerTextChange(e.target.value)}
          bg="white"
          rows={3}
          resize="vertical"
        />
        <HStack justify="flex-end" gap={2}>
          <Button
            colorPalette="brand"
            variant="subtle"
            onClick={handleCancel}
            size={{ base: 'sm', md: 'md' }}
          >
            キャンセル
          </Button>
          <Button
            colorPalette="brand"
            variant="solid"
            onClick={onAddQuestion}
            disabled={!newQuestionText.trim()}
            size={{ base: 'sm', md: 'md' }}
          >
            追加
          </Button>
        </HStack>
      </VStack>
    );
  }

  return (
    <Button
      colorPalette="brand"
      variant="solid"
      onClick={handleStartAdding}
      size={{ base: 'md', md: 'lg' }}
      w="full"
    >
      <Text fontSize="lg" mr={2}>
        +
      </Text>
      質問を追加
    </Button>
  );
};
