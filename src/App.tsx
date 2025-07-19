import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
} from '@chakra-ui/react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Container maxW="lg" py={8}>
      <VStack gap={8}>
        <HStack gap={4}>
          <Image src={viteLogo} alt="Vite logo" boxSize="60px" />
          <Image src={reactLogo} alt="React logo" boxSize="60px" />
        </HStack>

        <Heading as="h1" size="xl" color="brand.500">
          保育園見学質問リストアプリ
        </Heading>

        <Box
          p={6}
          borderRadius="xl"
          bg="white"
          boxShadow="md"
          border="1px solid"
          borderColor="neutral.200"
        >
          <VStack gap={4}>
            <Button
              onClick={() => setCount((count) => count + 1)}
              colorScheme="brand"
              size="lg"
            >
              カウント: {count}
            </Button>
            <Text color="neutral.600">
              <code>src/App.tsx</code> を編集してHMRをテストしてください
            </Text>
          </VStack>
        </Box>

        <Text fontSize="sm" color="neutral.500" textAlign="center">
          ViteとReactのロゴをクリックして詳細を確認してください
        </Text>
      </VStack>
    </Container>
  );
}

export default App;
