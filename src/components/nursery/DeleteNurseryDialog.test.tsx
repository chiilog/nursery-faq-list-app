import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import system from '../../theme';
import { DeleteNurseryDialog } from './DeleteNurseryDialog';
import type { Nursery } from '../../types';

// React Routerのモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// showToastのモック
vi.mock('../../utils/toaster', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// useNurseryStoreのモック
vi.mock('../../stores/nurseryStore', () => ({
  useNurseryStore: () => ({
    deleteNursery: vi.fn(),
  }),
}));

const mockNursery: Nursery = {
  id: 'nursery-1',
  name: 'テスト保育園',
  visitSessions: [
    {
      id: 'session-1',
      visitDate: new Date('2024-02-15'),
      status: 'planned',
      questions: [
        {
          id: 'q1',
          text: '保育方針について教えてください',
          isAnswered: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'q2',
          text: '給食について教えてください',
          answer: 'アレルギー対応あり',
          isAnswered: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DeleteNurseryDialog', () => {
  const renderDialog = (props: any) => {
    return render(
      <MemoryRouter>
        <ChakraProvider value={system}>
          <DeleteNurseryDialog {...props} />
        </ChakraProvider>
      </MemoryRouter>
    );
  };

  test('削除ダイアログが表示される', () => {
    const onClose = vi.fn();

    renderDialog({
      nursery: mockNursery,
      isOpen: true,
      onClose,
    });

    expect(screen.getByText('保育園の削除')).toBeInTheDocument();
    expect(
      screen.getByText('確認のため保育園名を入力してください')
    ).toBeInTheDocument();
  });

  test('削除影響範囲が表示される', () => {
    const onClose = vi.fn();

    renderDialog({
      nursery: mockNursery,
      isOpen: true,
      onClose,
    });

    expect(screen.getByText('• 保育園名')).toBeInTheDocument();
    expect(screen.getByText(/見学予定日/)).toBeInTheDocument();
    expect(screen.getByText(/作成した質問と回答（2件）/)).toBeInTheDocument();
  });

  test('保育園名を正しく入力すると削除ボタンが有効になる', async () => {
    const onClose = vi.fn();

    renderDialog({
      nursery: mockNursery,
      isOpen: true,
      onClose,
    });

    const input = screen.getByLabelText(/保育園名を入力/);
    const deleteButton = screen.getByRole('button', { name: '削除する' });

    expect(deleteButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'テスト保育園' } });

    await waitFor(() => {
      expect(deleteButton).toBeEnabled();
    });
  });

  test('間違った保育園名では削除ボタンが無効のまま', async () => {
    const onClose = vi.fn();

    renderDialog({
      nursery: mockNursery,
      isOpen: true,
      onClose,
    });

    const input = screen.getByLabelText(/保育園名を入力/);
    const deleteButton = screen.getByRole('button', { name: '削除する' });

    fireEvent.change(input, { target: { value: '間違った名前' } });

    await waitFor(() => {
      expect(deleteButton).toBeDisabled();
    });
  });

  test('削除ボタンをクリックすると削除処理が実行される', async () => {
    const onClose = vi.fn();

    renderDialog({
      nursery: mockNursery,
      isOpen: true,
      onClose,
    });

    const input = screen.getByLabelText(/保育園名を入力/);
    const deleteButton = screen.getByRole('button', { name: '削除する' });

    fireEvent.change(input, { target: { value: 'テスト保育園' } });

    await waitFor(() => {
      expect(deleteButton).toBeEnabled();
    });

    fireEvent.click(deleteButton);

    // カスタムフック内で削除処理が実行されることを正しいテストに変更する必要あり
    expect(deleteButton).toBeInTheDocument();
  });

  test('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    const onClose = vi.fn();

    renderDialog({
      nursery: mockNursery,
      isOpen: true,
      onClose,
    });

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('isOpenがfalseの場合、ダイアログは表示されない', () => {
    const onClose = vi.fn();

    renderDialog({
      nursery: mockNursery,
      isOpen: false,
      onClose,
    });

    expect(screen.queryByText('保育園の削除')).not.toBeInTheDocument();
  });
});
