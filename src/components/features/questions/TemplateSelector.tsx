/**
 * @description テンプレート選択UIコンポーネント
 * デフォルトテンプレートの適用機能を提供
 */

import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Text,
  VStack,
  HStack,
  Dialog,
  useDisclosure,
  Link,
  Alert,
} from '@chakra-ui/react';
import { useSystemTemplates } from '../../../hooks/template/useSystemTemplates';
import { useTemplateApplication } from '../../../hooks/template/useTemplateApplication';
import { showToast } from '../../../utils/toaster';
import type { Template } from '../../../types/entities';

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
  const {
    templates: systemTemplates,
    loading,
    loadTemplates,
  } = useSystemTemplates();
  const { isApplying, applyTemplate } = useTemplateApplication();

  const templates: Template[] = systemTemplates;

  // コンポーネント内でシンプルな状態管理
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // テンプレート一覧が更新された時の自動選択ロジック
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  /**
   * @description テンプレート適用処理
   */
  const handleApplyTemplate = useCallback(async (): Promise<void> => {
    if (!selectedTemplate) return;

    setErrorMessage(null);

    try {
      const success = await applyTemplate(nurseryId, selectedTemplate);

      if (success) {
        // 成功時: トースト表示とダイアログクローズ
        showToast.success('質問を追加しました');
        setSelectedTemplate(null);
        setErrorMessage(null);
        onClose();
      } else {
        // 失敗時: エラーメッセージを表示（ダイアログは開いたまま）
        setErrorMessage('質問の追加に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      // 予期せぬエラーのハンドリング
      setErrorMessage('質問の追加中にエラーが発生しました。');
      console.error('テンプレート適用エラー:', error);
    }
  }, [selectedTemplate, nurseryId, applyTemplate, onClose]);

  /**
   * @description 状態をリセットしてダイアログを閉じる
   */
  const handleClose = useCallback((): void => {
    setSelectedTemplate(null);
    setErrorMessage(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    void loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadTemplatesは依存配列から除去（空の依存配列を持つuseCallbackなので安定）

  // テンプレート自動選択ロジックは useTemplateSelectorState に移動

  // システムテンプレート読み込み中またはエラー時は何も表示しない
  if (loading || templates.length === 0) {
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

                {errorMessage && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>{errorMessage}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
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
