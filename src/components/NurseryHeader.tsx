/**
 * 保育園詳細ページヘッダーコンポーネント
 */

import { Button, Heading, Text, Box } from '@chakra-ui/react';

interface NurseryHeaderProps {
  nurseryName: string;
  onBack: () => void;
}

export const NurseryHeader = ({ nurseryName, onBack }: NurseryHeaderProps) => {
  return (
    <>
      <Button
        variant="ghost"
        onClick={onBack}
        size={{ base: 'sm', md: 'md' }}
        px={0}
      >
        <Text>←</Text>戻る
      </Button>
      <Heading
        as="h1"
        size={{ base: 'md', md: 'lg' }}
        color="teal.600"
        flex={1}
        textAlign="center"
      >
        {nurseryName}
      </Heading>
      <Box minW={{ base: '60px', md: '80px' }} /> {/* スペーサー */}
    </>
  );
};
