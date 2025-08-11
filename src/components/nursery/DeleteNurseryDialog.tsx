import { useState } from 'react';
import { Dialog, Input, Text, VStack, Alert, Box } from '@chakra-ui/react';
import type { Nursery } from '../../types';
import { ActionButtons } from '../ui/ActionButtons';
import { useDeleteNursery } from '../../hooks/useDeleteNursery';

interface DeleteNurseryDialogProps {
  nursery: Nursery;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteNurseryDialog = ({
  nursery,
  isOpen,
  onClose,
}: DeleteNurseryDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const { isDeleting, error, handleDelete, clearError } = useDeleteNursery();

  const handleConfirmDelete = async () => {
    if (confirmText !== nursery.name) return;

    const result = await handleDelete(nursery.id);
    if (result.success) {
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    clearError();
    onClose();
  };

  const totalQuestions = nursery.visitSessions.reduce(
    (sum, session) => sum + session.questions.length,
    0
  );

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => details.open || handleClose()}
      size="md"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>保育園の削除</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap={4} align="stretch">
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Box>
                  <Text fontWeight="bold">この操作は取り消せません</Text>
                  <Text fontSize="sm">
                    「{nursery.name}」とそのすべてのデータが完全に削除されます。
                  </Text>
                </Box>
              </Alert.Root>

              <Box
                p={3}
                borderWidth={1}
                borderRadius="md"
                borderColor="gray.200"
              >
                <Text fontSize="sm" color="gray.600" mb={2}>
                  削除される内容:
                </Text>
                <VStack align="start" gap={1}>
                  <Text fontSize="sm">• 保育園名</Text>
                  {nursery.visitSessions.length > 0 && (
                    <Text fontSize="sm">
                      • 見学予定日（
                      {nursery.visitSessions[0].visitDate
                        ? new Date(
                            nursery.visitSessions[0].visitDate
                          ).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '未設定'}
                      ）
                    </Text>
                  )}
                  {totalQuestions > 0 && (
                    <Text fontSize="sm">
                      • 作成した質問と回答（{totalQuestions}件）
                    </Text>
                  )}
                  {nursery.visitSessions.some((s) => s.notes) && (
                    <Text fontSize="sm">• 見学時のメモ</Text>
                  )}
                </VStack>
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>
                  確認のため保育園名を入力してください
                </Text>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={nursery.name}
                  aria-label="保育園名を入力"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  「{nursery.name}」と入力してください
                </Text>
              </Box>
            </VStack>
          </Dialog.Body>

          {error && (
            <Alert.Root status="error" mb={4}>
              <Alert.Indicator />
              <Box>
                <Text fontSize="sm">{error}</Text>
              </Box>
            </Alert.Root>
          )}

          <Dialog.Footer>
            <ActionButtons
              primaryAction={{
                label: '削除する',
                onClick: () => void handleConfirmDelete(),
                disabled: confirmText !== nursery.name || isDeleting,
                loading: isDeleting,
                variant: 'solid',
                colorPalette: 'red',
              }}
              secondaryAction={{
                label: 'キャンセル',
                onClick: handleClose,
                variant: 'outline',
              }}
              fullWidth
            />
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
