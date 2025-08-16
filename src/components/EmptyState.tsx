import { Box, Text } from '@chakra-ui/react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <Box textAlign="center" py={8}>
    <Text color="gray.600" fontSize="lg" mb={2}>
      {title}
    </Text>
    {description && (
      <Text color="gray.500" fontSize="sm">
        {description}
      </Text>
    )}
  </Box>
);
