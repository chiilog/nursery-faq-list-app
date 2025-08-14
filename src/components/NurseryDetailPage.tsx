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
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNurseryStore } from '../stores/nurseryStore';
import { Layout } from './Layout';
import { NurseryInfoCard } from './NurseryInfoCard';
import { QuestionAddForm } from './QuestionAddForm';
import { QuestionsSection } from './QuestionsSection';
import { InsightsSection } from './InsightsSection';
import { InlineFormActions } from './NurseryCreator/FormActions';
import { DeleteNurseryDialog } from './nursery/DeleteNurseryDialog';
import { showToast } from '../utils/toaster';
import { useNurseryEdit } from '../hooks/useNurseryEdit';
import { useQuestionEditor } from '../hooks/useQuestionEditor';
import { useQuestionForm } from '../hooks/useQuestionForm';

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

  // カスタムフックで状態管理を統合
  const questionEditor = useQuestionEditor();
  const questionForm = useQuestionForm();

  // 削除確認ダイアログの状態管理
  const {
    open: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // 保育園編集フックを使用
  const nurseryEdit = useNurseryEdit(currentNursery, updateNursery);

  // URLパラメータから保育園IDを取得してロード
  useEffect(() => {
    if (nurseryId) {
      void setCurrentNursery(nurseryId);
    }
  }, [nurseryId, setCurrentNursery]);

  const handleBack = useCallback(() => {
    void navigate('/');
  }, [navigate]);

  const handleQuestionClick = useCallback(
    (questionId: string, currentAnswer: string, questionText: string) => {
      questionEditor.startEdit(questionId, currentAnswer, questionText);
    },
    [questionEditor]
  );

  const handleSaveAnswer = useCallback(async () => {
    if (!currentNursery || !questionEditor.editState.questionId) return;

    const session = currentNursery.visitSessions[0];
    if (!session) return;

    await updateQuestion(
      currentNursery.id,
      session.id,
      questionEditor.editState.questionId,
      {
        text: questionEditor.editState.questionText.trim(),
        answer: questionEditor.editState.answer,
        isAnswered: questionEditor.editState.answer.trim() !== '',
      }
    );

    questionEditor.resetEdit();
  }, [currentNursery, questionEditor, updateQuestion]);

  const handleAddQuestion = useCallback(async () => {
    if (!currentNursery || !questionForm.isValid) return;

    const session = currentNursery.visitSessions[0];
    if (!session) return;

    await addQuestion(currentNursery.id, session.id, {
      text: questionForm.formState.questionText,
      answer: questionForm.formState.answerText.trim(),
      isAnswered: questionForm.formState.answerText.trim() !== '',
    });

    questionForm.resetForm();
  }, [currentNursery, questionForm, addQuestion]);

  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      if (!currentNursery) return;

      const session = currentNursery.visitSessions[0];
      if (!session) return;

      try {
        await deleteQuestion(currentNursery.id, session.id, questionId);
        showToast.success('削除完了', '質問を削除しました');

        // 編集中の質問が削除された場合は編集状態をリセット
        if (questionEditor.editState.questionId === questionId) {
          questionEditor.resetEdit();
        }
      } catch (error) {
        console.error('Failed to delete question:', error);
        showToast.error(
          '削除エラー',
          '質問の削除に失敗しました。もう一度お試しください。'
        );
      }
    },
    [currentNursery, deleteQuestion, questionEditor]
  );

  // 気づいたことのタグ変更のハンドラー
  const handleInsightsChange = useCallback(
    async (insights: string[]) => {
      if (!currentNursery) return;

      const session = currentNursery.visitSessions[0];
      if (!session) return;

      try {
        await updateVisitSession(session.id, { insights });
      } catch (error) {
        console.error('Failed to save insights:', error);
        showToast.error(
          '保存エラー',
          'タグの保存に失敗しました。もう一度お試しください。'
        );
      }
    },
    [currentNursery, updateVisitSession]
  );

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
        text: '← 戻る',
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
              <InlineFormActions
                size="sm"
                onSave={() => void nurseryEdit.handleSaveNursery()}
                onCancel={nurseryEdit.handleCancelEditNursery}
                isDisabled={nurseryEdit.isSaveDisabled}
              />
            ) : (
              <Button
                size="sm"
                variant="outline"
                colorPalette="brand"
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

          {/* 気づいたことのタグ用セクション */}
          <InsightsSection
            insights={session?.insights || []}
            onInsightsChange={(insights) => void handleInsightsChange(insights)}
          />

          {/* 質問エリアと質問追加フォームの区切り */}
          <Separator my={2} />

          {/* 質問追加フォーム */}
          <Box mb={2}>
            <QuestionAddForm
              isAddingQuestion={questionForm.formState.isAdding}
              newQuestionText={questionForm.formState.questionText}
              newAnswerText={questionForm.formState.answerText}
              onNewQuestionTextChange={questionForm.updateQuestionText}
              onNewAnswerTextChange={questionForm.updateAnswerText}
              onToggleAddForm={(value) =>
                value ? questionForm.startAdding() : questionForm.cancelAdding()
              }
              onAddQuestion={() => void handleAddQuestion()}
            />
          </Box>

          {/* 質問リスト */}
          <QuestionsSection
            questions={questions}
            editingQuestionId={questionEditor.editState.questionId}
            editingAnswer={questionEditor.editState.answer}
            editingQuestionText={questionEditor.editState.questionText}
            onQuestionClick={handleQuestionClick}
            onSaveAnswer={() => void handleSaveAnswer()}
            onCancelEdit={questionEditor.resetEdit}
            onEditingAnswerChange={questionEditor.updateAnswer}
            onEditingQuestionTextChange={questionEditor.updateQuestionText}
            onDeleteQuestion={(questionId) =>
              void handleDeleteQuestion(questionId)
            }
          />

          {/* 質問エリアと削除ボタンの区切り */}
          <Separator my={4} />

          {/* 保育園削除ボタン - 質問リストの最下部 */}
          <Button
            width="full"
            colorPalette="red"
            variant="solid"
            size="lg"
            onClick={onDeleteOpen}
          >
            保育園を削除
          </Button>
        </VStack>
      </Box>

      {/* 削除確認ダイアログ */}
      {currentNursery && (
        <DeleteNurseryDialog
          nursery={currentNursery}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}
    </Layout>
  );
};
