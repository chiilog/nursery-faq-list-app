/**
 * 保育園詳細ページヘッダーコンポーネント
 */

import { Button, Heading, Spacer } from '@chakra-ui/react';

interface NurseryHeaderProps {
  onBack: () => void;
}

export const NurseryHeader = ({ onBack }: NurseryHeaderProps) => {
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
      <Spacer />
    </>
  );
};
