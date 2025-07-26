/**
 * 保育園カードコンポーネント
 * TDD Refactor Phase: コードの改善とドキュメント充実化
 */

import { Box, Text, Badge, VStack, HStack } from '@chakra-ui/react';
import type { Nursery, VisitSession } from '../types/data';

interface NurseryCardProps {
  /** 表示する保育園の情報 */
  nursery: Nursery;
  /** カードクリック時のコールバック関数 */
  onClick: (nursery: Nursery) => void;
}

/**
 * 日付を見やすい形式（YYYY/M/D）にフォーマット
 */
const formatDate = (date: Date): string => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 見学セッションから最新の見学予定日を取得
 * 優先順位: 1. 未来の予定日（昇順で最初） 2. 最新の日付（過去含む）
 */
const getLatestVisitDate = (visitSessions: VisitSession[]): string => {
  if (visitSessions.length === 0) {
    return '未定';
  }

  const now = new Date();

  // 未来の予定日を優先（最も近い日付）
  const futureSessions = visitSessions
    .filter(
      (session) => session.visitDate > now && session.status === 'planned'
    )
    .sort((a, b) => a.visitDate.getTime() - b.visitDate.getTime());

  if (futureSessions.length > 0) {
    return formatDate(futureSessions[0].visitDate);
  }

  // 未来の予定がない場合は最新の日付
  const latestSession = visitSessions.sort(
    (a, b) => b.visitDate.getTime() - a.visitDate.getTime()
  )[0];

  return formatDate(latestSession.visitDate);
};

/**
 * 全見学セッションの質問進捗を計算
 */
const getQuestionProgress = (visitSessions: VisitSession[]): string => {
  const allQuestions = visitSessions.flatMap((session) => session.questions);
  const answeredQuestions = allQuestions.filter(
    (question) => question.isAnswered
  );
  return `${answeredQuestions.length}/${allQuestions.length}`;
};

/**
 * 保育園情報を表示するカードコンポーネント
 *
 * 機能:
 * - 保育園名の表示
 * - 最新見学予定日の表示（未来の予定優先）
 * - 質問進捗の表示（回答済み/全体）
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

  const visitDate = getLatestVisitDate(nursery.visitSessions);
  const questionProgress = getQuestionProgress(nursery.visitSessions);

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
          <Badge colorScheme="brand" fontSize="xs" flexShrink={0}>
            保育園
          </Badge>
        </HStack>

        {/* 詳細情報部分: 見学日と質問進捗 */}
        <VStack align="stretch" gap={1}>
          <Text color="gray.600" fontSize="sm" textAlign="left">
            見学日: {visitDate}
          </Text>
          <Text color="gray.600" fontSize="sm" textAlign="left">
            質問進捗: {questionProgress}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};
