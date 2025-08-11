/**
 * 気づきタグの状態管理を行うカスタムフック
 * タグの追加・削除・入力値管理のロジックを統合管理
 */

import { useState, useCallback } from 'react';

/**
 * 気づきタグの管理機能
 */
export interface InsightsManagerResult {
  /** 現在の入力値 */
  inputValue: string;
  /** 入力値を更新する関数 */
  setInputValue: (value: string) => void;
  /** タグを追加する関数 */
  addInsight: () => void;
  /** タグを削除する関数 */
  removeInsight: (index: number) => void;
  /** Enterキー処理用のハンドラー */
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  /** 追加ボタンが無効かどうか */
  isAddDisabled: boolean;
}

/**
 * 気づきタグの状態管理を行うカスタムフック
 *
 * @param insights - 現在の気づきタグ配列
 * @param onInsightsChange - タグ変更時のコールバック関数
 * @param isReadOnly - 読み取り専用モードかどうか
 * @returns 気づきタグの管理機能
 *
 * @example
 * ```tsx
 * const {
 *   inputValue,
 *   setInputValue,
 *   addInsight,
 *   removeInsight,
 *   handleKeyDown,
 *   isAddDisabled,
 * } = useInsightsManager(insights, onInsightsChange, isReadOnly);
 *
 * return (
 *   <div>
 *     <input
 *       value={inputValue}
 *       onChange={(e) => setInputValue(e.target.value)}
 *       onKeyDown={handleKeyDown}
 *     />
 *     <button onClick={addInsight} disabled={isAddDisabled}>
 *       追加
 *     </button>
 *   </div>
 * );
 * ```
 */
export const useInsightsManager = (
  insights: string[],
  onInsightsChange: (insights: string[]) => void,
  isReadOnly: boolean = false
): InsightsManagerResult => {
  const [inputValue, setInputValue] = useState('');

  const addInsight = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') {
      return; // 空文字や空白文字のみは追加しない
    }

    const newInsights = [...insights, trimmedValue];
    onInsightsChange(newInsights);
    setInputValue(''); // 入力フィールドをクリア
  }, [inputValue, insights, onInsightsChange]);

  const removeInsight = useCallback(
    (indexToRemove: number) => {
      const newInsights = insights.filter(
        (_, index) => index !== indexToRemove
      );
      onInsightsChange(newInsights);
    },
    [insights, onInsightsChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addInsight();
      }
    },
    [addInsight]
  );

  const isAddDisabled = isReadOnly || inputValue.trim() === '';

  return {
    inputValue,
    setInputValue,
    addInsight,
    removeInsight,
    handleKeyDown,
    isAddDisabled,
  };
};
