/**
 * 見学メモセクション
 * 保育園見学時のサッとメモできる自由入力欄
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Textarea, Text, VStack, HStack, Badge } from '@chakra-ui/react';

interface NotesSectionProps {
  /** 現在のメモ内容 */
  notes: string;
  /** 自動保存時のコールバック（オプション） */
  onAutoSave?: (notes: string) => void;
  /** 読み取り専用モードかどうか */
  isReadOnly?: boolean;
}

const MAX_NOTES_LENGTH = 2000;

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onAutoSave,
  isReadOnly = false,
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [showLimitReachedAlert, setShowLimitReachedAlert] = useState(false);
  const hasInitialized = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初期化時のみpropsから値を設定
  useEffect(() => {
    if (!hasInitialized.current) {
      setLocalNotes(notes);
      hasInitialized.current = true;
    }
  }, [notes]);

  // 制限到達時のフィードバック
  const showLimitFeedback = useCallback(() => {
    setShowLimitReachedAlert(true);
  }, []);

  const handleNotesChange = (value: string) => {
    // 文字数制限チェック
    if (value.length > MAX_NOTES_LENGTH) {
      showLimitFeedback();
      return;
    }

    setLocalNotes(value);

    // 制限以下になったらアラートを非表示
    if (showLimitReachedAlert && value.length <= MAX_NOTES_LENGTH) {
      setShowLimitReachedAlert(false);
    }
  };

  const handleBlur = () => {
    // フォーカス外れ時に自動保存（値が変更されている場合のみ）
    if (onAutoSave && localNotes !== notes) {
      onAutoSave(localNotes);
    }
  };

  const charactersLeft = MAX_NOTES_LENGTH - localNotes.length;
  const isNearLimit = charactersLeft <= 50;
  const isVeryNearLimit = charactersLeft <= 10;
  const isClosingInLimit = charactersLeft <= 100;
  const isOverLimit = localNotes.length > MAX_NOTES_LENGTH;

  const getCounterColor = () => {
    if (isOverLimit) return 'red.500';
    if (isVeryNearLimit) return 'red.500';
    if (isNearLimit) return 'orange.500';
    if (isClosingInLimit) return 'yellow.500';
    return 'gray.500';
  };

  const getWarningMessage = () => {
    if (isClosingInLimit && !isNearLimit) {
      return `あと${charactersLeft}文字で上限です`;
    }
    if (isNearLimit && !isVeryNearLimit) {
      return `あと${charactersLeft}文字で上限です`;
    }
    if (isVeryNearLimit && charactersLeft > 0) {
      return `あと${charactersLeft}文字で上限です！`;
    }
    return null;
  };

  return (
    <Box>
      <VStack align="stretch" gap={3}>
        {/* ヘッダー */}
        <HStack justify="space-between" align="center">
          <Text fontSize="md" fontWeight="semibold" color="gray.700">
            見学メモ
          </Text>
          <Badge colorScheme="blue" size="sm">
            自由記入
          </Badge>
        </HStack>

        {/* 制限到達時のアラート */}
        {showLimitReachedAlert ? (
          <Box
            bg="red.50"
            border="1px"
            borderColor="red.200"
            borderRadius="md"
            p={3}
          >
            <Text fontSize="sm" color="red.600">
              ⚠️ 文字数制限（{MAX_NOTES_LENGTH}文字）に達しました
            </Text>
          </Box>
        ) : null}

        {/* テキストエリア */}
        <Box position="relative">
          <Textarea
            ref={textareaRef}
            value={localNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="見学中のメモをここに..."
            resize="vertical"
            minHeight="120px"
            maxHeight="300px"
            readOnly={isReadOnly}
            aria-label="見学メモ"
            autoresize
            borderColor={
              isOverLimit
                ? 'red.300'
                : isVeryNearLimit
                  ? 'red.300'
                  : isNearLimit
                    ? 'orange.300'
                    : 'gray.300'
            }
            _focus={{
              borderColor: isOverLimit
                ? 'red.500'
                : isVeryNearLimit
                  ? 'red.500'
                  : isNearLimit
                    ? 'orange.500'
                    : 'brand.500',
              boxShadow: isOverLimit
                ? '0 0 0 1px red.500'
                : isVeryNearLimit
                  ? '0 0 0 1px red.500'
                  : isNearLimit
                    ? '0 0 0 1px orange.500'
                    : '0 0 0 1px var(--chakra-colors-brand-500)',
            }}
            _hover={{
              borderColor: isOverLimit
                ? 'red.400'
                : isVeryNearLimit
                  ? 'red.400'
                  : isNearLimit
                    ? 'orange.400'
                    : 'gray.400',
            }}
          />
        </Box>

        {/* フッター */}
        <HStack justify="space-between" align="center">
          <Box flex="1">
            {/* 警告メッセージ */}
            {getWarningMessage() ? (
              <Text
                fontSize="sm"
                color={
                  isVeryNearLimit
                    ? 'red.500'
                    : isNearLimit
                      ? 'orange.500'
                      : 'yellow.500'
                }
                fontWeight={isVeryNearLimit ? 'bold' : 'medium'}
                aria-live="polite"
              >
                {getWarningMessage()}
              </Text>
            ) : null}
            {isOverLimit ? (
              <Text fontSize="sm" color="red.500">
                メモは{MAX_NOTES_LENGTH}文字以内で入力してください
              </Text>
            ) : null}
          </Box>

          <Text
            fontSize="sm"
            color={getCounterColor()}
            fontWeight={isVeryNearLimit ? 'bold' : 'normal'}
          >
            {localNotes.length}/{MAX_NOTES_LENGTH}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};
