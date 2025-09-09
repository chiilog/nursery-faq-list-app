/**
 * 質問追加フォームコンポーネント
 */

import { Button, Input, Textarea, VStack, HStack } from '@chakra-ui/react';
import { useCallback } from 'react';

interface QuestionAddFormProps {
  newQuestionText: string;
  newAnswerText: string;
  onNewQuestionTextChange: (value: string) => void;
  onNewAnswerTextChange: (value: string) => void;
  onAddQuestion: () => void;
}

export const QuestionAddForm = ({
  newQuestionText,
  newAnswerText,
  onNewQuestionTextChange,
  onNewAnswerTextChange,
  onAddQuestion,
}: QuestionAddFormProps) => {
  const handleCancel = useCallback(() => {
    onNewQuestionTextChange('');
    onNewAnswerTextChange('');
  }, [onNewQuestionTextChange, onNewAnswerTextChange]);

  return (
    <VStack align="stretch">
      <Input
        size="lg"
        placeholder="新しい質問を入力してください"
        aria-label="質問入力"
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
          aria-label="質問追加をキャンセル"
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
};
