/**
 * 保育園名表示・編集セクションコンポーネント
 */

import { Box, Text, Input } from '@chakra-ui/react';

interface NurseryNameSectionProps {
  nurseryName: string;
  isEditing: boolean;
  editingName: string;
  onNameChange: (value: string) => void;
}

export const NurseryNameSection = ({
  nurseryName,
  isEditing,
  editingName,
  onNameChange,
}: NurseryNameSectionProps) => {
  if (isEditing) {
    return (
      <Box
        p={0}
        borderRadius="lg"
        border="2px"
        borderColor="brand.200"
        bg="brand.50"
      >
        <Input
          value={editingName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="保育園名を入力してください"
          size={{ base: 'md', md: 'lg' }}
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          bg="white"
          borderColor="brand.300"
          _focus={{ borderColor: 'brand.500', shadow: 'outline' }}
        />
      </Box>
    );
  }

  return (
    <Box
      p={0}
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
      bg="white"
      textAlign="center"
    >
      <Text
        fontSize={{ base: 'lg', md: 'xl' }}
        fontWeight="bold"
        color="teal.600"
        textAlign="center"
      >
        {nurseryName}
      </Text>
    </Box>
  );
};
