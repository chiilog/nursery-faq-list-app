import { Box, Text, Button } from '@chakra-ui/react';

interface ErrorDisplayProps {
  error: { message: string };
  onClose: () => void;
}

export const ErrorDisplay = ({ error, onClose }: ErrorDisplayProps) => (
  <Box
    p={4}
    bg="red.50"
    borderColor="red.200"
    borderWidth={1}
    borderRadius="md"
    mb={6}
  >
    <Text color="red.700" fontWeight="medium">
      {error.message}
    </Text>
    <Button size="sm" mt={2} onClick={onClose}>
      エラーを閉じる
    </Button>
  </Box>
);
