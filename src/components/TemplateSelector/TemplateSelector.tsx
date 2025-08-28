/**
 * @description テンプレート選択UIコンポーネント
 * デフォルトテンプレートの適用機能を提供
 */

import type React from 'react';
import {
  Button,
  Text,
  VStack,
  HStack,
  Dialog,
  useDisclosure,
  Link,
} from '@chakra-ui/react';
import { useTemplate } from '../../hooks/useTemplate';

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
  const { isApplying, applyTemplate, hasTemplates } = useTemplate();

  // システム提供テンプレートが存在しない場合は何も表示しない
  if (!hasTemplates(false)) {
    return null;
  }

  /**
   * @description テンプレート適用を実行し、ダイアログを閉じる
   * @returns {Promise<void>} 非同期処理の完了を表すPromise
   */
  const handleApplyTemplate = async (): Promise<void> => {
    // デフォルトテンプレートを適用（templateIdを省略）
    await applyTemplate(nurseryId);
    onClose();
  };

  /**
   * @description ダイアログを閉じる
   * @returns {void}
   */
  const handleClose = (): void => {
    onClose();
  };

  return (
    <>
      <Link colorPalette="brand" onClick={onOpen} variant="underline">
        テンプレートから質問を追加する
      </Link>

      <Dialog.Root
        open={isOpen}
        onOpenChange={(details: { open: boolean }) => {
          if (!details.open) handleClose();
        }}
        size="md"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>保活手帳オススメの質問リスト</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="start" gap={4}>
                <Text>
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
                  onClick={() => void handleApplyTemplate()}
                  loading={isApplying}
                  loadingText="追加中..."
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
