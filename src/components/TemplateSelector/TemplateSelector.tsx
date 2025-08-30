/**
 * @description テンプレート選択UIコンポーネント
 * デフォルトテンプレートの適用機能を提供
 */

import type React from 'react';
import { useCallback, useState, useEffect } from 'react';
import {
  Button,
  Text,
  VStack,
  HStack,
  Dialog,
  useDisclosure,
  Link,
} from '@chakra-ui/react';
import { useSystemTemplates } from '../../hooks/template/useSystemTemplates';
import { handleError } from '../../utils/errorHandler';
import type { Template } from '../../types/entities';

/**
 * @description TemplateSelectorコンポーネントのプロパティ
 */
export interface TemplateSelectorProps {
  /**
   * @description 対象の保育園ID
   */
  nurseryId: string;
}

/**
 * @description テンプレート選択UIコンポーネント
 * デフォルトテンプレートの適用機能を提供するUIコンポーネント
 * @param props - コンポーネントのプロパティ
 * @param props.nurseryId - 対象の保育園ID
 * @returns テンプレート選択UIの要素またはnull
 * @example
 * ```tsx
 * <TemplateSelector nurseryId="nursery-123" />
 * ```
 */
export const TemplateSelector = ({
  nurseryId,
}: TemplateSelectorProps): React.JSX.Element | null => {
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const { templates, loading, loadTemplates } = useSystemTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  /**
   * @description テンプレート適用を実行し、ダイアログを閉じる
   * @returns {Promise<void>} 非同期処理の完了を表すPromise
   */
  const handleApplyTemplate = useCallback((): void => {
    if (!selectedTemplate) return;

    setIsApplying(true);
    try {
      // TODO: TemplateServiceを使って実際のテンプレート適用処理を実装
      console.log('テンプレート適用:', selectedTemplate, nurseryId);
      onClose();
    } catch (error) {
      handleError('テンプレートの適用に失敗しました', error);
    } finally {
      setIsApplying(false);
    }
  }, [selectedTemplate, nurseryId, onClose]);

  /**
   * @description ダイアログを閉じる
   * @returns {void}
   */
  const handleClose = useCallback((): void => {
    setSelectedTemplate(null);
    onClose();
  }, [onClose]);

  // 初回はデフォルトで最初のテンプレートを選択
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  // システム提供テンプレートが存在しない場合は何も表示しない
  if (templates.length === 0 && !loading) {
    return null;
  }

  return (
    <>
      <Link
        colorPalette="brand"
        onClick={onOpen}
        variant="underline"
        aria-label="質問テンプレートを選択してダイアログを開く"
      >
        テンプレートから質問を追加する
      </Link>

      <Dialog.Root
        open={isOpen}
        onOpenChange={(details: { open: boolean }) => {
          if (!details.open) handleClose();
        }}
        size="md"
        aria-labelledby="template-dialog-title"
        aria-describedby="template-dialog-description"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title id="template-dialog-title">
                保活手帳オススメの質問リスト
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="start" gap={4}>
                <Text id="template-dialog-description">
                  自身の経験や、他の人がどんなことを質問したのかなどを調査して、汎用的に使えそうなテンプレートを用意しています。
                  <br />
                  項目の変更や削除はもちろん可能です。このテンプレートが「どんなことを聞いたらいいかな」の参考になれば幸いです！
                </Text>
                <Text fontSize="sm" color="red.600">
                  ※既存の質問はそのまま残り、テンプレートの質問が追加されます。不要な質問は後から削除できます。
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3}>
                <Button variant="ghost" onClick={handleClose}>
                  キャンセル
                </Button>
                <Button
                  colorPalette="brand"
                  onClick={handleApplyTemplate}
                  loading={isApplying || loading}
                  loadingText={loading ? '読み込み中...' : '追加中...'}
                  disabled={!selectedTemplate}
                  aria-label="テンプレートの質問を保育園に追加"
                >
                  追加する
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};
