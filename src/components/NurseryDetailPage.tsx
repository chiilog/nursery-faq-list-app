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
import { QuestionList } from './QuestionList';
import { showToast } from '../utils/toaster';
import { generateId } from '../utils/id';

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
    deleteQuestion,
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
  const [hasNameError, setHasNameError] = useState(false);

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

    await addQuestion(currentNursery.id, session.id, {
      text: newQuestionText,
      answer: '',
      isAnswered: false,
      priority: 'medium',
      category: '基本情報',
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

  // 保育園編集関連の処理
  const handleEditNursery = () => {
    if (!currentNursery) return;

    setEditingNurseryName(currentNursery.name);
    setIsEditingNursery(true);
    setHasNameError(false); // エラー状態をリセット

    // 見学日も編集可能にする
    const session = currentNursery.visitSessions[0];
    if (session && session.visitDate) {
      try {
        const dateStr = session.visitDate.toISOString().split('T')[0];
        setNewVisitDate(dateStr);
      } catch {
        console.warn('Invalid visit date:', session.visitDate);
        setNewVisitDate('');
      }
    } else {
      // 見学セッションが存在しないか、見学日が未定の場合は空文字列で初期化
      setNewVisitDate('');
    }
  };

  const handleSaveNursery = async () => {
    if (!currentNursery) return;

    // バリデーション
    const trimmedName = editingNurseryName.trim();
    if (!trimmedName) {
      showToast.error('入力エラー', '保育園名を入力してください');
      return;
    }
    if (trimmedName.length > 100) {
      showToast.error('入力エラー', '保育園名は100文字以内で入力してください');
      return;
    }

    // 見学日が入力されている場合のみ見学セッションを更新/作成
    let updatedSessions = [...currentNursery.visitSessions];
    if (newVisitDate) {
      try {
        const visitDate = new Date(newVisitDate);
        // 無効な日付をチェック
        if (isNaN(visitDate.getTime())) {
          showToast.error('入力エラー', '有効な日付を入力してください');
          return;
        }

        if (updatedSessions[0]) {
          // 既存の見学セッションを更新
          updatedSessions[0] = {
            ...updatedSessions[0],
            visitDate,
          };
        } else {
          // 見学セッションが存在しない場合は新しく作成
          updatedSessions = [
            {
              id: `session-${generateId()}`,
              visitDate,
              status: 'planned' as const,
              questions: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
        }
      } catch (error) {
        showToast.error('エラー', '日付の処理中にエラーが発生しました');
        console.error('Date parsing error:', error);
        return;
      }
    }

    await updateNursery(currentNursery.id, {
      name: trimmedName,
      visitSessions: updatedSessions,
    });

    showToast.success('保存完了', '保育園情報を更新しました');
    setIsEditingNursery(false);
  };

  const handleCancelEditNursery = () => {
    setIsEditingNursery(false);
    setEditingNurseryName('');
    setNewVisitDate('');
    setHasNameError(false); // エラー状態をリセット
  };

  // 保育園名の変更ハンドラー
  const handleNurseryNameChange = (value: string) => {
    setEditingNurseryName(value);
    // 空文字の場合はエラー表示
    setHasNameError(!value.trim());
  };

  // 変更があるかどうかを判定（軽量な計算なのでuseMemo不要）
  const hasChanges = (() => {
    if (!currentNursery) return false;

    const nameChanged = editingNurseryName.trim() !== currentNursery.name;
    const session = currentNursery.visitSessions[0];
    const currentDateString = session?.visitDate
      ? session.visitDate.toISOString().split('T')[0]
      : '';
    const dateChanged = newVisitDate !== currentDateString;

    return nameChanged || dateChanged;
  })();

  // 保存ボタンの無効化状態
  const isSaveDisabled = !editingNurseryName.trim() || !hasChanges;

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
                  disabled={isSaveDisabled}
                  opacity={isSaveDisabled ? 0.4 : 1}
                  cursor={isSaveDisabled ? 'not-allowed' : 'pointer'}
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
            hasNameError={hasNameError}
            onNameChange={handleNurseryNameChange}
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
          <QuestionList
            questions={questions}
            editingQuestionId={editingQuestionId}
            editingAnswer={editingAnswer}
            editingQuestionText={editingQuestionText}
            onQuestionClick={handleQuestionClick}
            onSaveAnswer={() => void handleSaveAnswer()}
            onCancelEdit={() => setEditingQuestionId(null)}
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
