/**
 * 保育園詳細画面コンポーネント
 * リファクタリング: 責務別にコンポーネントを分割
 */

import {
  Box,
  VStack,
  Spinner,
  Text,
  Button,
  HStack,
  Separator,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNurseryStore } from '../stores/nurseryStore';
import { Layout } from './Layout';
import { NurseryHeader } from './NurseryHeader';
import { NurseryInfoCard } from './NurseryInfoCard';
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
  const [newVisitDate, setNewVisitDate] = useState('');

  // 保育園編集関連の状態
  const [isEditingNursery, setIsEditingNursery] = useState(false);
  const [editingNurseryName, setEditingNurseryName] = useState('');

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

  // 保育園編集関連の処理
  const handleEditNursery = () => {
    if (!currentNursery) return;

    setEditingNurseryName(currentNursery.name);
    setIsEditingNursery(true);

    // 見学日も編集可能にする
    const session = currentNursery.visitSessions[0];
    if (session) {
      setNewVisitDate(session.visitDate.toISOString().split('T')[0]);
    } else {
      // 見学セッションが存在しない場合は空文字列で初期化
      setNewVisitDate('');
    }
  };

  const handleSaveNursery = async () => {
    if (!currentNursery) return;

    // バリデーション
    const trimmedName = editingNurseryName.trim();
    if (!trimmedName) {
      alert('保育園名を入力してください');
      return;
    }
    if (trimmedName.length > 100) {
      alert('保育園名は100文字以内で入力してください');
      return;
    }
    // 見学日が入力されている場合のみ見学セッションを更新/作成
    let updatedSessions = [...currentNursery.visitSessions];
    if (newVisitDate) {
      if (updatedSessions[0]) {
        // 既存の見学セッションを更新
        updatedSessions[0] = {
          ...updatedSessions[0],
          visitDate: new Date(newVisitDate),
        };
      } else {
        // 見学セッションが存在しない場合は新しく作成
        updatedSessions = [
          {
            id: `session-${crypto.randomUUID()}`,
            visitDate: new Date(newVisitDate),
            status: 'planned' as const,
            questions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      }
    }

    await updateNursery(currentNursery.id, {
      name: trimmedName,
      visitSessions: updatedSessions,
    });

    setIsEditingNursery(false);
  };

  const handleCancelEditNursery = () => {
    setIsEditingNursery(false);
    setEditingNurseryName('');
    setNewVisitDate('');
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
      headerContent={<NurseryHeader onBack={handleBack} />}
      showDefaultTitle={false}
    >
      <Box p={0} maxW="4xl" mx="auto">
        <VStack align="stretch" gap={{ base: 3, md: 4 }}>
          {/* 編集・保存・キャンセルボタン */}
          <HStack justify="space-between" align="center">
            <Box /> {/* 左側のスペーサー */}
            {isEditingNursery ? (
              <HStack gap={2}>
                <Button
                  size="sm"
                  colorScheme="brand"
                  onClick={() => void handleSaveNursery()}
                >
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEditNursery}
                >
                  キャンセル
                </Button>
              </HStack>
            ) : (
              <Button
                size="sm"
                variant="outline"
                colorScheme="brand"
                onClick={handleEditNursery}
              >
                編集
              </Button>
            )}
          </HStack>

          {/* 保育園情報カード */}
          <NurseryInfoCard
            nurseryName={currentNursery.name}
            visitDate={session?.visitDate || null}
            questions={questions}
            isEditing={isEditingNursery}
            editingName={editingNurseryName}
            newVisitDate={newVisitDate}
            onNameChange={setEditingNurseryName}
            onVisitDateChange={setNewVisitDate}
          />

          {/* 保育園情報と質問エリアの区切り */}
          <Separator my={4} />

          {/* 質問追加フォーム */}
          <Box mb={2}>
            <QuestionAddForm
              isAddingQuestion={isAddingQuestion}
              newQuestionText={newQuestionText}
              onNewQuestionTextChange={setNewQuestionText}
              onToggleAddForm={setIsAddingQuestion}
              onAddQuestion={() => void handleAddQuestion()}
            />
          </Box>

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
