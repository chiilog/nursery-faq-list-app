/**
 * 質問追加フォームコンポーネント
 */

import { Button, Input, Textarea, VStack, HStack, Text } from '@chakra-ui/react';

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
  if (isAddingQuestion) {
    return (
      <VStack
        align="stretch"
        p={4}
        border="2px"
        borderColor="brand.200"
        borderRadius="lg"
        bg="brand.50"
        shadow="sm"
      >
        <Input
          size="lg"
          placeholder="新しい質問を入力してください"
          value={newQuestionText}
          onChange={(e) => onNewQuestionTextChange(e.target.value)}
          bg="white"
          borderColor="brand.300"
          _focus={{ borderColor: 'brand.500', shadow: 'outline' }}
        />
        <Textarea
          placeholder="回答があれば入力してください（任意）"
          value={newAnswerText}
          onChange={(e) => onNewAnswerTextChange(e.target.value)}
          bg="white"
          borderColor="brand.300"
          _focus={{ borderColor: 'brand.500', shadow: 'outline' }}
          rows={3}
          resize="vertical"
        />
        <HStack justify="flex-end" gap={2}>
          <Button
            variant="ghost"
            onClick={() => onToggleAddForm(false)}
            size={{ base: 'sm', md: 'md' }}
          >
            キャンセル
          </Button>
          <Button
            colorPalette="brand"
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
      onClick={() => onToggleAddForm(true)}
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
