/**
 * 保育園詳細画面コンポーネント
 * TDD Green Phase: テストを通すための最小実装
 */

import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  Input,
  Textarea,
  Badge,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNurseryStore } from '../stores/nurseryStore';
import type { Question } from '../types/data';

/**
 * 日付フォーマッター
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 質問進捗計算
 */
const getQuestionProgress = (questions: Question[]): string => {
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  return `${answeredCount}/${questions.length} 回答済み`;
};

/**
 * 保育園詳細画面コンポーネント
 */
export const NurseryDetailPage = () => {
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const navigate = useNavigate();
  const {
    currentNursery,
    loading,
    error,
    updateQuestion,
    addQuestion,
    updateNursery,
    setCurrentNursery,
    clearError,
  } = useNurseryStore();

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editingAnswer, setEditingAnswer] = useState('');
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingVisitDate, setEditingVisitDate] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState('');

  // URLパラメータから保育園IDを取得してロード
  useEffect(() => {
    if (nurseryId && (!currentNursery || currentNursery.id !== nurseryId)) {
      void setCurrentNursery(nurseryId);
    }
  }, [nurseryId, currentNursery, setCurrentNursery]);

  const handleBack = () => {
    void navigate('/');
  };

  const handleQuestionClick = (
    questionId: string,
    currentAnswer: string,
    questionText: string
  ) => {
    setEditingQuestionId(questionId);
    setEditingAnswer(currentAnswer);
    setEditingQuestionText(questionText);
  };

  const handleSaveAnswer = async () => {
    if (!currentNursery || !editingQuestionId) return;

    const session = currentNursery.visitSessions[0];
    if (!session) return;

    await updateQuestion(currentNursery.id, session.id, editingQuestionId, {
      answer: editingAnswer,
      isAnswered: editingAnswer.trim() !== '',
    });

    setEditingQuestionId(null);
    setEditingAnswer('');
  };

  const handleAddQuestion = async () => {
    if (!currentNursery || !newQuestionText.trim()) return;

    const session = currentNursery.visitSessions[0];
    if (!session) return;

    const nextOrderIndex =
      session.questions.length > 0
        ? Math.max(...session.questions.map((q) => q.orderIndex)) + 1
        : 0;

    await addQuestion(currentNursery.id, session.id, {
      text: newQuestionText,
      answer: '',
      isAnswered: false,
      priority: 'medium',
      category: '基本情報',
      orderIndex: nextOrderIndex,
    });

    setIsAddingQuestion(false);
    setNewQuestionText('');
  };

  const handleVisitDateClick = () => {
    if (!currentNursery?.visitSessions[0]) return;

    setEditingVisitDate(true);
    const date = currentNursery.visitSessions[0].visitDate;
    setNewVisitDate(date.toISOString().split('T')[0]);
  };

  const handleSaveVisitDate = async () => {
    if (!currentNursery || !newVisitDate) return;

    const updatedSessions = [...currentNursery.visitSessions];
    updatedSessions[0] = {
      ...updatedSessions[0],
      visitDate: new Date(newVisitDate),
    };

    await updateNursery(currentNursery.id, {
      visitSessions: updatedSessions,
    });

    setEditingVisitDate(false);
  };

  // ローディング状態
  if (loading.isLoading || (nurseryId && !currentNursery && !error)) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="brand.500" />
        <Text mt={4} color="gray.600">
          {loading.operation || '保育園データを読み込み中...'}
        </Text>
      </Box>
    );
  }

  // エラー状態
  if (error || (!currentNursery && nurseryId)) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="red.500" fontSize="lg" mb={4}>
          {error?.message || '保育園が見つかりません'}
        </Text>
        <Button
          onClick={() => {
            clearError();
            void navigate('/');
          }}
        >
          ホームに戻る
        </Button>
      </Box>
    );
  }

  // nurseryIdがないか、currentNurseryがない場合は404扱い
  if (!nurseryId || !currentNursery) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="red.500" fontSize="lg" mb={4}>
          保育園が見つかりません
        </Text>
        <Button onClick={() => void navigate('/')}>ホームに戻る</Button>
      </Box>
    );
  }

  const session = currentNursery.visitSessions[0];
  const questions = session?.questions || [];

  // 未回答の質問を先に表示
  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.isAnswered === b.isAnswered) {
      return a.orderIndex - b.orderIndex;
    }
    return a.isAnswered ? 1 : -1;
  });

  return (
    <Box p={{ base: 4, md: 6 }} maxW="4xl" mx="auto">
      {/* ヘッダー */}
      <VStack align="stretch" gap={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center" flexWrap="wrap">
          <Button
            variant="ghost"
            onClick={handleBack}
            size={{ base: 'sm', md: 'md' }}
          >
            <Text mr={2}>←</Text>戻る
          </Button>
          <Heading as="h1" size={{ base: 'md', md: 'lg' }} textAlign="center">
            保育園詳細
          </Heading>
          <Box minW={{ base: '60px', md: '80px' }} /> {/* スペーサー */}
        </HStack>

        {/* 保育園情報 */}
        <Box
          bg="gray.50"
          p={{ base: 4, md: 6 }}
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
        >
          <Heading
            as="h2"
            size={{ base: 'lg', md: 'xl' }}
            mb={{ base: 3, md: 4 }}
            color="brand.700"
          >
            {currentNursery.name}
          </Heading>

          <VStack align="stretch" gap={{ base: 3, md: 4 }}>
            {/* 見学予定日 */}
            <Box flex={1}>
              <Text
                aria-label="見学予定日"
                fontWeight="bold"
                color="gray.700"
                mb={2}
                fontSize="sm"
              >
                見学予定日
              </Text>
              {editingVisitDate ? (
                <VStack align="stretch" gap={2}>
                  <Input
                    type="date"
                    value={newVisitDate}
                    onChange={(e) => setNewVisitDate(e.target.value)}
                    size="sm"
                    bg="white"
                  />
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="brand"
                      onClick={() => void handleSaveVisitDate()}
                    >
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingVisitDate(false)}
                    >
                      キャンセル
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Text
                  cursor="pointer"
                  color="brand.600"
                  onClick={handleVisitDateClick}
                  _hover={{
                    textDecoration: 'underline',
                    color: 'brand.700',
                    bg: 'brand.50',
                  }}
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight="medium"
                  p={2}
                  borderRadius="md"
                  transition="all 0.2s"
                >
                  {session ? formatDate(session.visitDate) : '未設定'}
                </Text>
              )}
            </Box>

            {/* 質問進捗 */}
            <Box flex={1}>
              <Text
                aria-label="質問進捗"
                fontWeight="bold"
                color="gray.700"
                mb={2}
                fontSize="sm"
              >
                質問進捗
              </Text>
              <Text
                color="gray.600"
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="medium"
              >
                {getQuestionProgress(questions)}
              </Text>
              {questions.length > 0 && (
                <Box mt={2} bg="gray.200" borderRadius="full" h={2}>
                  <Box
                    bg="brand.500"
                    borderRadius="full"
                    h={2}
                    width={`${(questions.filter((q) => q.isAnswered).length / questions.length) * 100}%`}
                    transition="width 0.3s"
                  />
                </Box>
              )}
            </Box>
          </VStack>
        </Box>

        {/* 質問追加ボタン */}
        <Box>
          {isAddingQuestion ? (
            <VStack
              align="stretch"
              p={{ base: 4, md: 5 }}
              border="2px"
              borderColor="brand.200"
              borderRadius="lg"
              bg="brand.50"
              shadow="sm"
            >
              <Input
                placeholder="新しい質問を入力してください"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                bg="white"
                borderColor="brand.300"
                _focus={{ borderColor: 'brand.500', shadow: 'outline' }}
              />
              <HStack justify="flex-end" gap={2}>
                <Button
                  variant="ghost"
                  onClick={() => setIsAddingQuestion(false)}
                  size={{ base: 'sm', md: 'md' }}
                >
                  キャンセル
                </Button>
                <Button
                  colorScheme="brand"
                  onClick={() => void handleAddQuestion()}
                  disabled={!newQuestionText.trim()}
                  size={{ base: 'sm', md: 'md' }}
                >
                  追加
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Button
              colorScheme="brand"
              onClick={() => setIsAddingQuestion(true)}
              size={{ base: 'md', md: 'lg' }}
              w="full"
            >
              <Text fontSize="lg" mr={2}>
                +
              </Text>
              質問を追加
            </Button>
          )}
        </Box>

        {/* 質問リスト */}
        <VStack align="stretch" gap={4}>
          {questions.length === 0 ? (
            <Box textAlign="center" py={8} color="gray.500">
              <Text fontSize="lg" mb={2}>
                まだ質問がありません
              </Text>
              <Text fontSize="sm">
                「質問を追加」ボタンから質問を追加してください
              </Text>
            </Box>
          ) : (
            sortedQuestions.map((question) => (
              <Box
                key={question.id}
                data-testid={`question-item-${question.id}`}
                data-priority={question.priority}
                p={{ base: 4, md: 5 }}
                border="1px"
                borderColor={question.isAnswered ? 'green.200' : 'gray.200'}
                borderRadius="lg"
                bg={question.isAnswered ? 'green.50' : 'white'}
                shadow="sm"
                _hover={{ shadow: 'md' }}
                transition="all 0.2s"
              >
                {editingQuestionId === question.id ? (
                  <VStack align="stretch" gap={3}>
                    <Input
                      value={editingQuestionText}
                      onChange={(e) => setEditingQuestionText(e.target.value)}
                      placeholder="質問を入力してください"
                      bg="white"
                      size={{ base: 'sm', md: 'md' }}
                    />
                    <Textarea
                      placeholder="回答を入力してください"
                      value={editingAnswer}
                      onChange={(e) => setEditingAnswer(e.target.value)}
                      rows={3}
                      bg="white"
                      resize="vertical"
                      size={{ base: 'sm', md: 'md' }}
                    />
                    <HStack justify="flex-end" gap={2}>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingQuestionId(null)}
                        size={{ base: 'sm', md: 'md' }}
                      >
                        キャンセル
                      </Button>
                      <Button
                        colorScheme="brand"
                        onClick={() => void handleSaveAnswer()}
                        size={{ base: 'sm', md: 'md' }}
                      >
                        保存
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={3}>
                    <HStack
                      justify="space-between"
                      align="flex-start"
                      wrap="wrap"
                    >
                      <Text
                        fontWeight="bold"
                        cursor="pointer"
                        onClick={() =>
                          handleQuestionClick(
                            question.id,
                            question.answer || '',
                            question.text
                          )
                        }
                        _hover={{ color: 'brand.600' }}
                        flex={1}
                        fontSize={{ base: 'sm', md: 'md' }}
                        minW="0" // テキストが親の幅を超えないように
                        wordBreak="break-word"
                      >
                        {question.text}
                      </Text>
                      <HStack gap={2} flexShrink={0}>
                        {question.isAnswered && (
                          <Badge colorScheme="green" size="sm">
                            回答済み
                          </Badge>
                        )}
                        <Badge
                          colorScheme={
                            question.priority === 'high'
                              ? 'red'
                              : question.priority === 'medium'
                                ? 'yellow'
                                : 'gray'
                          }
                          size="sm"
                        >
                          {question.priority === 'high'
                            ? '高'
                            : question.priority === 'medium'
                              ? '中'
                              : '低'}
                        </Badge>
                      </HStack>
                    </HStack>
                    {question.answer && (
                      <Box
                        pl={4}
                        borderLeft="3px"
                        borderColor="brand.200"
                        bg="gray.50"
                        p={3}
                        borderRadius="md"
                      >
                        <Text
                          color="gray.700"
                          fontSize={{ base: 'sm', md: 'md' }}
                          whiteSpace="pre-wrap"
                        >
                          {question.answer}
                        </Text>
                      </Box>
                    )}
                    {!question.answer && (
                      <Text
                        color="gray.400"
                        fontSize="sm"
                        fontStyle="italic"
                        cursor="pointer"
                        onClick={() =>
                          handleQuestionClick(
                            question.id,
                            question.answer || '',
                            question.text
                          )
                        }
                        _hover={{ color: 'brand.500' }}
                      >
                        クリックして回答を追加
                      </Text>
                    )}
                  </VStack>
                )}
              </Box>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
};
