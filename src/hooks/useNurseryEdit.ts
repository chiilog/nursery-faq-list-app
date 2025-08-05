/**
 * 保育園編集フック
 * TDD Green Phase: テストを通す最小限の実装
 */

import { useState } from 'react';
import { showToast } from '../utils/toaster';
import { generateId } from '../utils/id';
import type { Nursery } from '../types/data';

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

export function useNurseryEdit(
  currentNursery: Nursery | null,
  updateNursery: (id: string, updates: Partial<Nursery>) => Promise<void>
): UseNurseryEditReturn {
  // 保育園編集関連の状態
  const [isEditingNursery, setIsEditingNursery] = useState(false);
  const [editingNurseryName, setEditingNurseryName] = useState('');
  const [hasNameError, setHasNameError] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState('');

  // 編集開始処理
  const handleEditNursery = () => {
    if (!currentNursery) return;

    setEditingNurseryName(currentNursery.name);
    setIsEditingNursery(true);
    setHasNameError(false);

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

  // 保存処理
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

  // キャンセル処理
  const handleCancelEditNursery = () => {
    setIsEditingNursery(false);
    setEditingNurseryName('');
    setNewVisitDate('');
    setHasNameError(false);
  };

  // 保育園名の変更ハンドラー
  const handleNurseryNameChange = (value: string) => {
    setEditingNurseryName(value);
    // 空文字の場合はエラー表示
    setHasNameError(!value.trim());
  };

  // 変更があるかどうかを判定
  const currentSession = currentNursery?.visitSessions[0];
  const currentDateString = currentSession?.visitDate
    ? currentSession.visitDate.toISOString().split('T')[0]
    : '';

  const hasChanges =
    currentNursery &&
    isEditingNursery &&
    (editingNurseryName.trim() !== currentNursery.name ||
      newVisitDate !== currentDateString);

  // 保存ボタンの無効化状態
  const isSaveDisabled = !editingNurseryName.trim() || !hasChanges;

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
