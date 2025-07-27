/**
 * 保育園詳細ページヘッダーコンポーネント
 */

import { Button, Heading, Box } from '@chakra-ui/react';

interface NurseryHeaderProps {
  onBack: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const NurseryHeader = ({
  onBack,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: NurseryHeaderProps) => {
  return (
    <>
      <Button
        variant="ghost"
        onClick={onBack}
        size={{ base: 'sm', md: 'md' }}
        px={0}
      >
        ← 戻る
      </Button>
      <Heading
        as="h1"
        size={{ base: 'md', md: 'lg' }}
        color="teal.600"
        flex={1}
        textAlign="center"
      >
        保育園詳細
      </Heading>
      {isEditing ? (
        <Box display="flex" gap={2}>
          <Button
            size={{ base: 'sm', md: 'md' }}
            colorScheme="brand"
            onClick={onSave}
          >
            保存
          </Button>
          <Button
            size={{ base: 'sm', md: 'md' }}
            variant="ghost"
            onClick={onCancel}
          >
            キャンセル
          </Button>
        </Box>
      ) : (
        <Button
          size={{ base: 'sm', md: 'md' }}
          variant="ghost"
          onClick={onEdit}
        >
          編集
        </Button>
      )}
    </>
  );
};
