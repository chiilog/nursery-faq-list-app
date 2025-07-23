import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Box, Heading, Text } from '@chakra-ui/react';

// 一時的なページコンポーネント
const HomePage = () => (
  <Box>
    <Heading as="h2" size="xl" mb={4}>
      質問リスト一覧
    </Heading>
    <Text>質問リストがここに表示されます。</Text>
  </Box>
);

const NotFoundPage = () => (
  <Box textAlign="center" py={10}>
    <Heading as="h2" size="xl" mb={4}>
      404
    </Heading>
    <Text>ページが見つかりません</Text>
  </Box>
);

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
