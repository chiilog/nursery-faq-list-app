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
import { APP_CONFIG } from '../constants/app';

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
          _focus={{
            borderColor: APP_CONFIG.COLORS.SECONDARY,
            shadow: 'outline',
          }}
        />
        <Textarea
          size="lg"
          placeholder="回答があれば入力してください（任意）"
          aria-label="回答入力（任意）"
          value={newAnswerText}
          onChange={(e) => onNewAnswerTextChange(e.target.value)}
          bg="white"
          _focus={{
            borderColor: APP_CONFIG.COLORS.SECONDARY,
            shadow: 'outline',
          }}
          rows={3}
          resize="vertical"
        />
        <HStack justify="flex-end" gap={2}>
          <Button
            bgColor={APP_CONFIG.COLORS.PRIMARY_LIGHT}
            color={APP_CONFIG.COLORS.PRIMARY_DARK}
            variant="ghost"
            onClick={handleCancel}
            size={{ base: 'sm', md: 'md' }}
          >
            キャンセル
          </Button>
          <Button
            bgColor={APP_CONFIG.COLORS.PRIMARY}
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
      bgColor={APP_CONFIG.COLORS.PRIMARY}
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
