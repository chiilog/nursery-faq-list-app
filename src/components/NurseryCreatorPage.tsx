/**
 * 保育園追加ページコンポーネント
 * ヘッダーとレイアウトを含む完全なページコンポーネント
 */

import { Box, HStack, Heading, IconButton } from '@chakra-ui/react';
import { IoClose } from 'react-icons/io5';
import { Layout } from './Layout';
import { NurseryCreator } from './NurseryCreator/NurseryCreator';

interface NurseryCreatorPageProps {
  onCancel: () => void;
}

export const NurseryCreatorPage = ({ onCancel }: NurseryCreatorPageProps) => {
  return (
    <Layout
      headerContent={
        <HStack justify="space-between" align="center" w="full">
          <IconButton
            onClick={onCancel}
            variant="ghost"
            aria-label="閉じる"
            size="md"
            borderRadius="full"
            _hover={{ bg: 'gray.100' }}
          >
            <IoClose />
          </IconButton>
          <Heading as="h1" size="md" color="teal.600">
            新しい保育園を追加
          </Heading>
          <Box w="40px" /> {/* スペーサー（閉じるボタンと同じ幅） */}
        </HStack>
      }
      showDefaultTitle={false}
    >
      <NurseryCreator onCancel={onCancel} />
    </Layout>
  );
};
