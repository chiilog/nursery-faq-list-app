import { Box, Heading, Text } from '@chakra-ui/react';
import { Layout } from '../components/layout/Layout';

export const NotFoundPage = () => (
  <Layout>
    <Box textAlign="center" py={10}>
      <Heading as="h2" size="xl" mb={4}>
        404
      </Heading>
      <Text>ページが見つかりません</Text>
    </Box>
  </Layout>
);
