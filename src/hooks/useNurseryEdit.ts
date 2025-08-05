/**
 * 保育園編集フック
 * 保育園情報の編集状態管理とバリデーション機能を提供
 *
 * @param currentNursery - 編集対象の保育園データ
 * @param updateNursery - 保育園データ更新関数
 * @returns 編集状態と操作関数
 */

import { useState, useCallback, useMemo } from 'react';
import { showToast } from '../utils/toaster';
import { generateId } from '../utils/id';
import type { Nursery, VisitSession } from '../types/data';

export interface UseNurseryEditReturn {
  // 状態
  isEditingNursery: boolean;
  editingNurseryName: string;
  newVisitDate: string;
  hasNameError: boolean;
  hasChanges: boolean;
  isSaveDisabled: boolean;

  // アクション
  handleEditNursery: () => void;
  handleSaveNursery: () => Promise<void>;
  handleCancelEditNursery: () => void;
  handleNurseryNameChange: (value: string) => void;
  setNewVisitDate: (value: string) => void;
}

// 定数
const NURSERY_NAME_MAX_LENGTH = 100;

export function useNurseryEdit(
  currentNursery: Nursery | null,
  updateNursery: (id: string, updates: Partial<Nursery>) => Promise<void>
): UseNurseryEditReturn {
  // 保育園編集関連の状態
  const [isEditingNursery, setIsEditingNursery] = useState(false);
  const [editingNurseryName, setEditingNurseryName] = useState('');
  const [hasNameError, setHasNameError] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState('');

  // ヘルパー関数: 日付を文字列に変換
  const formatDateForInput = useCallback((date: Date | null): string => {
    if (!date) return '';
    try {
      return date.toISOString().split('T')[0];
    } catch {
      console.warn('Invalid visit date:', date);
      return '';
    }
  }, []);

  // ヘルパー関数: バリデーション
  const validateNurseryName = useCallback((name: string): boolean => {
    const trimmedName = name.trim();
    return (
      trimmedName.length > 0 && trimmedName.length <= NURSERY_NAME_MAX_LENGTH
    );
  }, []);

  // 編集開始処理
  const handleEditNursery = useCallback(() => {
    if (!currentNursery) return;

    setEditingNurseryName(currentNursery.name);
    setIsEditingNursery(true);
    setHasNameError(false);

    // 見学日も編集可能にする
    const session = currentNursery.visitSessions[0];
    const dateString = formatDateForInput(session?.visitDate || null);
    setNewVisitDate(dateString);
  }, [currentNursery, formatDateForInput]);

  // ヘルパー関数: 見学セッション作成/更新
  const createOrUpdateSession = useCallback(
    (
      existingSession: VisitSession | undefined,
      visitDate: Date
    ): VisitSession => {
      if (existingSession) {
        return {
          ...existingSession,
          visitDate,
        };
      }

      return {
        id: `session-${generateId()}`,
        visitDate,
        status: 'planned' as const,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    []
  );

  // 保存処理
  const handleSaveNursery = useCallback(async () => {
    if (!currentNursery) return;

    // バリデーション
    const trimmedName = editingNurseryName.trim();
    if (!validateNurseryName(editingNurseryName)) {
      if (!trimmedName) {
        showToast.error('入力エラー', '保育園名を入力してください');
      } else {
        showToast.error(
          '入力エラー',
          `保育園名は${NURSERY_NAME_MAX_LENGTH}文字以内で入力してください`
        );
      }
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

        const existingSession = updatedSessions[0];
        const updatedSession = createOrUpdateSession(
          existingSession,
          visitDate
        );

        if (existingSession) {
          updatedSessions[0] = updatedSession;
        } else {
          updatedSessions = [updatedSession];
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
  }, [
    currentNursery,
    editingNurseryName,
    newVisitDate,
    validateNurseryName,
    createOrUpdateSession,
    updateNursery,
  ]);

  // キャンセル処理
  const handleCancelEditNursery = useCallback(() => {
    setIsEditingNursery(false);
    setEditingNurseryName('');
    setNewVisitDate('');
    setHasNameError(false);
  }, []);

  // 保育園名の変更ハンドラー
  const handleNurseryNameChange = useCallback((value: string) => {
    setEditingNurseryName(value);
    // 空文字の場合はエラー表示
    setHasNameError(!value.trim());
  }, []);

  // 変更があるかどうかを判定（メモ化）
  const hasChanges = useMemo(() => {
    if (!currentNursery || !isEditingNursery) return false;

    const currentSession = currentNursery.visitSessions[0];
    const currentDateString = formatDateForInput(
      currentSession?.visitDate || null
    );

    return (
      editingNurseryName.trim() !== currentNursery.name ||
      newVisitDate !== currentDateString
    );
  }, [
    currentNursery,
    isEditingNursery,
    editingNurseryName,
    newVisitDate,
    formatDateForInput,
  ]);

  // 保存ボタンの無効化状態（メモ化）
  const isSaveDisabled = useMemo(() => {
    return !editingNurseryName.trim() || !hasChanges;
  }, [editingNurseryName, hasChanges]);

  return {
    // 状態
    isEditingNursery,
    editingNurseryName,
    newVisitDate,
    hasNameError,
    hasChanges: !!hasChanges,
    isSaveDisabled,

    // アクション
    handleEditNursery,
    handleSaveNursery,
    handleCancelEditNursery,
    handleNurseryNameChange,
    setNewVisitDate,
  };
}
