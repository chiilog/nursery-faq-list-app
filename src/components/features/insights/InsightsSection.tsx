/**
 * 気づきタグセクション
 * タグ形式で見学中の気づきを素早く記録・管理
 */

import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  Flex,
  Group,
} from '@chakra-ui/react';
import { InsightTag } from './InsightTag';
import { useInsightsManager } from '../../../hooks/useInsightsManager';

interface InsightsSectionProps {
  /** 現在の気づきタグ配列 */
  insights: string[];
  /** タグ変更時のコールバック */
  onInsightsChange: (insights: string[]) => void;
  /** 読み取り専用モードかどうか */
  isReadOnly?: boolean;
}

export const InsightsSection = ({
  insights,
  onInsightsChange,
  isReadOnly = false,
}: InsightsSectionProps) => {
  const {
    inputValue,
    setInputValue,
    addInsight,
    removeInsight,
    handleKeyDown,
    isAddDisabled,
  } = useInsightsManager(insights, onInsightsChange, isReadOnly);

  return (
    <Box>
      <VStack align="stretch" gap={3}>
        {/* ヘッダー */}
        <Text
          as="h3"
          role="heading"
          fontSize="md"
          fontWeight="semibold"
          color="gray.700"
        >
          気づいたこと
        </Text>

        {/* タグ入力フィールド */}
        <Box>
          <Group gap={0} width="full">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="見学中に気づいたことを入力"
              disabled={isReadOnly}
              aria-label="見学中に気づいたことを入力してください"
              fontSize="16px" // スマホでのズーム防止
              minHeight="44px" // タッチターゲットサイズ
              borderEndRadius="0"
              borderEndWidth="0"
            />
            <Button
              onClick={addInsight}
              disabled={isAddDisabled}
              bg="bg.subtle"
              variant="outline"
              size="md"
              minHeight="44px" // タッチターゲットサイズ
              borderStartRadius="0"
              px={4}
            >
              追加
            </Button>
          </Group>
        </Box>

        {/* 既存タグの表示 */}
        {insights.length > 0 && (
          <Box>
            <Flex
              as="ul"
              role="list"
              wrap="wrap"
              gap={{ base: 2, md: 3 }}
              mt={2}
            >
              {insights.map((insight, index) => {
                const handleDelete = () => removeInsight(index);
                return (
                  <Box key={`${insight}-${index}`} as="li" listStyleType="none">
                    <InsightTag
                      text={insight}
                      showDeleteButton={!isReadOnly}
                      onDelete={handleDelete}
                      isReadOnly={isReadOnly}
                    />
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* タグが空の場合のプレースホルダーバッジ */}
        {insights.length === 0 && !isReadOnly && (
          <Box mt={2}>
            <Flex wrap="wrap" gap={{ base: 2, md: 3 }}>
              <InsightTag
                text="例）園庭ひろい"
                showDeleteButton={false}
                opacity={0.6}
              />
              <InsightTag
                text="例）おやつ手作り"
                showDeleteButton={false}
                opacity={0.6}
              />
              <InsightTag
                text="例）トイレ古そう"
                showDeleteButton={false}
                opacity={0.6}
              />
            </Flex>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
