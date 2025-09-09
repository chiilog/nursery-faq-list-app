/**
 * 気づきタグ用Tag共通コンポーネント
 * DRY原則に基づいて、削除機能の有無をpropsで制御
 */

import { Tag } from '@chakra-ui/react';
import { IoClose } from 'react-icons/io5';
import { UI_SIZES } from '../constants/ui-theme';

interface InsightTagProps {
  /** タグに表示するテキスト */
  text: string;
  /** 削除ボタンの表示有無 */
  showDeleteButton?: boolean;
  /** 削除ボタンクリック時のコールバック */
  onDelete?: () => void;
  /** タグの透明度（プレースホルダー用） */
  opacity?: number;
  /** 読み取り専用モード */
  isReadOnly?: boolean;
}

/**
 * 気づきタグ用の統一されたTagコンポーネント
 *
 * 機能:
 * - 一貫したスタイル（レスポンシブサイズ、カラーパレット）
 * - オプションでの削除ボタン表示
 * - プレースホルダー用の透明度制御
 * - アクセシビリティ対応
 */
export const InsightTag = ({
  text,
  showDeleteButton = false,
  onDelete,
  opacity = 1,
  isReadOnly = false,
}: InsightTagProps) => {
  const handleDelete = () => {
    if (onDelete && typeof onDelete === 'function') {
      onDelete();
    }
  };

  return (
    <Tag.Root
      colorPalette="accent"
      variant="solid"
      size={UI_SIZES.MEDIUM}
      opacity={opacity}
      py={1}
      px={2}
    >
      <Tag.Label>{text}</Tag.Label>
      {showDeleteButton && !isReadOnly && (
        <Tag.EndElement>
          <Tag.CloseTrigger onClick={handleDelete} aria-label={`${text}を削除`}>
            <IoClose size="14" />
          </Tag.CloseTrigger>
        </Tag.EndElement>
      )}
    </Tag.Root>
  );
};
