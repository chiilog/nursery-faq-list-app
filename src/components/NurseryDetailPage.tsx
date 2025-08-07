/**
 * 保育園詳細画面コンポーネント
 * リファクタリング: 責務別にコンポーネントを分割
 */
import { IoChevronBack } from 'react-icons/io5';

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
import { NurseryInfoCard } from './NurseryInfoCard';
import { QuestionAddForm } from './QuestionAddForm';
import { QuestionsSection } from './QuestionsSection';
import { NotesSection } from './NotesSection';
import { FormActions } from './NurseryCreator/FormActions';
import { showToast } from '../utils/toaster';
import { useNurseryEdit } from '../hooks/useNurseryEdit';

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
    updateVisitSession,
    setCurrentNursery,
    clearError,
    deleteQuestion,
  } = useNurseryStore();

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editingAnswer, setEditingAnswer] = useState('');
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');

  // 保育園編集フックを使用
  const nurseryEdit = useNurseryEdit(currentNursery, updateNursery);

  // URLパラメータから保育園IDを取得してロード
  useEffect(() => {
    if (nurseryId) {
      void setCurrentNursery(nurseryId);
    }
  }, [nurseryId, setCurrentNursery]);

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
      text: editingQuestionText,
      answer: editingAnswer,
      isAnswered: editingAnswer.trim() !== '',
    });

    setEditingQuestionId(null);
    setEditingAnswer('');
    setEditingQuestionText('');
  };

  const handleAddQuestion = async () => {
    if (!currentNursery || !newQuestionText.trim()) return;

    const session = currentNursery.visitSessions[0];
    if (!session) return;

    await addQuestion(currentNursery.id, session.id, {
      text: newQuestionText,
      answer: '',
      isAnswered: false,
    });

    setIsAddingQuestion(false);
    setNewQuestionText('');
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!currentNursery) return;

    const session = currentNursery.visitSessions[0];
    if (!session) return;

    try {
      await deleteQuestion(currentNursery.id, session.id, questionId);
      showToast.success('削除完了', '質問を削除しました');

      // 編集中の質問が削除された場合は編集状態をリセット
      if (editingQuestionId === questionId) {
        setEditingQuestionId(null);
        setEditingAnswer('');
        setEditingQuestionText('');
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      showToast.error(
        '削除エラー',
        '質問の削除に失敗しました。もう一度お試しください。'
      );
    }
  };

  // 見学メモ自動保存のハンドラー
  const handleNotesAutoSave = async (notes: string) => {
    if (!currentNursery) return;

    const session = currentNursery.visitSessions[0];
    if (!session) return;

    try {
      await updateVisitSession(session.id, { notes });
    } catch (error) {
      console.error('Failed to save notes:', error);
      showToast.error(
        '保存エラー',
        'メモの保存に失敗しました。もう一度お試しください。'
      );
    }
  };

  // ローディング状態
  if (loading.isLoading || (nurseryId && !currentNursery && !error)) {
    return (
      <Layout showDefaultTitle={false}>
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
      <Layout showDefaultTitle={false}>
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
      <Layout showDefaultTitle={false}>
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
      headerTitle="保育園詳細"
      headerVariant="with-buttons"
      leftButton={{
        icon: <IoChevronBack />,
        onClick: handleBack,
        variant: 'ghost',
      }}
      showDefaultTitle={false}
    >
      <Box p={0} maxW="4xl" mx="auto">
        <VStack align="stretch" gap={{ base: 3, md: 4 }}>
          {/* 編集・保存・キャンセルボタン */}
          <HStack justify="space-between" align="center">
            <Box /> {/* 左側のスペーサー */}
            {nurseryEdit.isEditingNursery ? (
              <FormActions
                size="sm"
                variant="inline"
                onSave={() => void nurseryEdit.handleSaveNursery()}
                onCancel={nurseryEdit.handleCancelEditNursery}
                isDisabled={nurseryEdit.isSaveDisabled}
                saveButtonProps={{
                  opacity: nurseryEdit.isSaveDisabled ? 0.4 : 1,
                  cursor: nurseryEdit.isSaveDisabled
                    ? 'not-allowed'
                    : 'pointer',
                }}
              />
            ) : (
              <Button
                size="sm"
                variant="outline"
                colorScheme="brand"
                onClick={nurseryEdit.handleEditNursery}
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
            isEditing={nurseryEdit.isEditingNursery}
            editingName={nurseryEdit.editingNurseryName}
            newVisitDate={nurseryEdit.newVisitDate}
            hasNameError={nurseryEdit.hasNameError}
            onNameChange={nurseryEdit.handleNurseryNameChange}
            onVisitDateChange={nurseryEdit.setNewVisitDate}
          />

          {/* 保育園情報と質問エリアの区切り */}
          <Separator my={2} />

          {/* 見学メモセクション */}
          <NotesSection
            notes={session?.notes || ''}
            onAutoSave={(notes) => void handleNotesAutoSave(notes)}
          />

          {/* 質問エリアと質問追加フォームの区切り */}
          <Separator my={2} />

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
          <QuestionsSection
            questions={questions}
            editingQuestionId={editingQuestionId}
            editingAnswer={editingAnswer}
            editingQuestionText={editingQuestionText}
            onQuestionClick={handleQuestionClick}
            onSaveAnswer={() => void handleSaveAnswer()}
            onCancelEdit={() => {
              setEditingQuestionId(null);
              setEditingAnswer('');
              setEditingQuestionText('');
            }}
            onEditingAnswerChange={setEditingAnswer}
            onEditingQuestionTextChange={setEditingQuestionText}
            onDeleteQuestion={(questionId) =>
              void handleDeleteQuestion(questionId)
            }
          />
        </VStack>
      </Box>
    </Layout>
  );
};
