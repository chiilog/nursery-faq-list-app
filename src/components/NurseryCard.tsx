/**
 * 保育園カードコンポーネント
 * 保育園情報をカード形式で表示し、見学状況と進捗を提供
 */

import { Box, Text, VStack, HStack, Flex } from '@chakra-ui/react';
import type { Nursery } from '../types/entities';
import { InsightTag } from './InsightTag';
import { useNurseryStatus } from '../hooks/useNurseryStatus';

interface NurseryCardProps {
  /** 表示する保育園の情報 */
  nursery: Nursery;
  /** カードクリック時のコールバック関数 */
  onClick: (nursery: Nursery) => void;
}

/**
 * 保育園情報を表示するカードコンポーネント
 *
 * 機能:
 * - 保育園名の表示
 * - 最新見学予定日の表示（未来の予定優先）
 * - 質問進捗の表示（回答済み/全体）
 * - 気づきタグの表示（最大3つまで、重複排除）
 * - キーボードアクセシビリティ対応
 * - ホバー/フォーカス状態のビジュアルフィードバック
 */
export const NurseryCard = ({ nursery, onClick }: NurseryCardProps) => {
  const handleInteraction = () => {
    try {
      if (typeof onClick === 'function') {
        onClick(nursery);
      }
    } catch (error) {
      // エラーをコンソールに記録するが、UIには影響させない
      console.error('NurseryCard onClick error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInteraction();
    }
  };

  const { visitDate, questionProgress, insights } = useNurseryStatus(
    nursery.visitSessions
  );

  return (
    <Box
      as="button"
      role="button"
      aria-label={`${nursery.name}の詳細を開く`}
      tabIndex={0}
      p={4}
      borderWidth={1}
      borderRadius="md"
      bg="white"
      shadow="sm"
      _hover={{
        shadow: 'md',
        transform: 'translateY(-1px)',
        borderColor: 'brand.200',
      }}
      _focus={{
        outline: 'none',
        shadow: 'outline',
        borderColor: 'brand.300',
      }}
      _active={{
        transform: 'translateY(0)',
        shadow: 'sm',
      }}
      transition="all 0.2s ease-in-out"
      width="100%"
      cursor="pointer"
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
    >
      <VStack align="stretch" gap={3}>
        {/* ヘッダー部分: 保育園名とバッジ */}
        <HStack justify="space-between" align="flex-start">
          <Text
            fontWeight="bold"
            fontSize="lg"
            color="gray.800"
            textAlign="left"
            flex={1}
            lineHeight="1.3"
          >
            {nursery.name}
          </Text>
        </HStack>

        {/* 詳細情報部分: 見学日と質問進捗 */}
        <VStack align="stretch" gap={2}>
          <Text color="gray.600" fontSize="sm" textAlign="left">
            見学日: {visitDate}
          </Text>
          <Text color="gray.600" fontSize="sm" textAlign="left">
            質問進捗: {questionProgress}
          </Text>

          {/* 気づきタグ表示 */}
          {insights.length > 0 && (
            <Box>
              <Flex wrap="wrap" gap={1} mt={1}>
                {insights.map((insight, index) => (
                  <InsightTag
                    key={`insight-${index}`}
                    text={insight}
                    showDeleteButton={false}
                    isReadOnly={true}
                  />
                ))}
              </Flex>
            </Box>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};
