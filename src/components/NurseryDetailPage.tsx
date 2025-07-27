/**
 * 保育園詳細画面コンポーネント
 * リファクタリング: 責務別にコンポーネントを分割
 */

import { Box, VStack, Spinner, Text, Button } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNurseryStore } from '../stores/nurseryStore';
import { Layout } from './Layout';
import { NurseryHeader } from './NurseryHeader';
import { NurseryInfo } from './NurseryInfo';
import { QuestionAddForm } from './QuestionAddForm';
import { QuestionListSection } from './QuestionListSection';

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
      <Layout headerContent={<Box />} showDefaultTitle={false}>
        <Box textAlign="center" py={8}>
          <Spinner size="lg" color="brand.500" />
          <Text mt={4} color="gray.600">
            {loading.operation || '保育園データを読み込み中...'}
          </Text>
        </Box>
      </Layout>
    );
  }

  // エラー状態
  if (error || (!currentNursery && nurseryId)) {
    return (
      <Layout headerContent={<Box />} showDefaultTitle={false}>
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
      </Layout>
    );
  }

  // nurseryIdがないか、currentNurseryがない場合は404扱い
  if (!nurseryId || !currentNursery) {
    return (
      <Layout headerContent={<Box />} showDefaultTitle={false}>
        <Box textAlign="center" py={8}>
          <Text color="red.500" fontSize="lg" mb={4}>
            保育園が見つかりません
          </Text>
          <Button onClick={() => void navigate('/')}>ホームに戻る</Button>
        </Box>
      </Layout>
    );
  }

  const session = currentNursery.visitSessions[0];
  const questions = session?.questions || [];

  return (
    <Layout
      headerContent={
        <NurseryHeader nurseryName={currentNursery.name} onBack={handleBack} />
      }
      showDefaultTitle={false}
    >
      <Box p={{ base: 4, md: 6 }} maxW="4xl" mx="auto">
        <VStack align="stretch" gap={{ base: 4, md: 6 }}>
          {/* 保育園情報 */}
          <NurseryInfo
            visitDate={session?.visitDate || null}
            questions={questions}
            isEditingVisitDate={editingVisitDate}
            newVisitDate={newVisitDate}
            onVisitDateClick={handleVisitDateClick}
            onVisitDateChange={setNewVisitDate}
            onSaveVisitDate={() => void handleSaveVisitDate()}
            onCancelVisitDate={() => setEditingVisitDate(false)}
          />

          {/* 質問追加フォーム */}
          <QuestionAddForm
            isAddingQuestion={isAddingQuestion}
            newQuestionText={newQuestionText}
            onNewQuestionTextChange={setNewQuestionText}
            onToggleAddForm={setIsAddingQuestion}
            onAddQuestion={() => void handleAddQuestion()}
          />

          {/* 質問リスト */}
          <QuestionListSection
            questions={questions}
            editingQuestionId={editingQuestionId}
            editingAnswer={editingAnswer}
            editingQuestionText={editingQuestionText}
            onQuestionClick={handleQuestionClick}
            onSaveAnswer={() => void handleSaveAnswer()}
            onCancelEdit={() => setEditingQuestionId(null)}
            onEditingAnswerChange={setEditingAnswer}
            onEditingQuestionTextChange={setEditingQuestionText}
          />
        </VStack>
      </Box>
    </Layout>
  );
};
