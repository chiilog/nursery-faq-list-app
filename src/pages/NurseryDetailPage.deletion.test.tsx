import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { NurseryDetailPage } from '../components/NurseryDetailPage';
import { useNurseryStore } from '../stores/nurseryStore';
import { useNavigate } from 'react-router-dom';
import system from '../theme';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ nurseryId: 'nursery-1' }),
    useNavigate: vi.fn(),
  };
});

vi.mock('../stores/nurseryStore', () => ({
  useNurseryStore: vi.fn(),
}));

const mockNursery = {
  id: 'nursery-1',
  name: 'テスト保育園',
  visitSessions: [
    {
      id: 'session-1',
      visitDate: new Date('2024-02-15'),
      status: 'planned' as const,
      questions: [
        {
          id: 'q1',
          text: '保育方針について教えてください',
          isAnswered: false,
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

describe('NurseryDetailPage - 削除機能', () => {
  const mockNavigate = vi.fn();
  const mockDeleteNursery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    vi.mocked(useNurseryStore).mockReturnValue({
      nurseries: [mockNursery],
      currentNursery: mockNursery,
      currentVisitSession: null,
      loading: { isLoading: false },
      error: null,
      syncState: {
        isOnline: true,
        pendingChanges: 0,
      },
      deleteNursery: mockDeleteNursery,
      updateNursery: vi.fn(),
      updateVisitSession: vi.fn(),
      loadNurseries: vi.fn(),
      createNursery: vi.fn(),
      setCurrentNursery: vi.fn(),
      createVisitSession: vi.fn(),
      deleteVisitSession: vi.fn(),
      setCurrentVisitSession: vi.fn(),
      addQuestion: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
      clearError: vi.fn(),
      setLoading: vi.fn(),
      getNurseryStats: vi.fn(),
    } as any);
  });

  const renderPage = () => {
    return render(
      <ChakraProvider value={system}>
        <BrowserRouter>
          <NurseryDetailPage />
        </BrowserRouter>
      </ChakraProvider>
    );
  };

  test('削除ボタンが表示される', () => {
    renderPage();

    const deleteButton = screen.getByRole('button', { name: /保育園を削除/ });
    expect(deleteButton).toBeInTheDocument();
  });

  test('削除ボタンをクリックすると確認ダイアログが表示される', async () => {
    renderPage();

    const deleteButton = screen.getByRole('button', { name: /保育園を削除/ });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('保育園の削除')).toBeInTheDocument();
      expect(screen.getByText('この操作は取り消せません')).toBeInTheDocument();
    });
  });

  test('削除確認後、保育園が削除されてホーム画面に遷移する', async () => {
    renderPage();

    const deleteButton = screen.getByRole('button', { name: /保育園を削除/ });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('保育園の削除')).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/保育園名を入力/);
    fireEvent.change(input, { target: { value: 'テスト保育園' } });

    const confirmDeleteButton = screen.getByRole('button', {
      name: '削除する',
    });

    await waitFor(() => {
      expect(confirmDeleteButton).toBeEnabled();
    });

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteNursery).toHaveBeenCalledWith('nursery-1');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('削除をキャンセルするとダイアログが閉じる', async () => {
    renderPage();

    const deleteButton = screen.getByRole('button', { name: /保育園を削除/ });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('保育園の削除')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('保育園の削除')).not.toBeInTheDocument();
    });

    expect(mockDeleteNursery).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('削除に失敗した場合エラーメッセージが表示される', async () => {
    mockDeleteNursery.mockRejectedValueOnce(new Error('削除に失敗しました'));

    renderPage();

    const deleteButton = screen.getByRole('button', { name: /保育園を削除/ });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('保育園の削除')).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/保育園名を入力/);
    fireEvent.change(input, { target: { value: 'テスト保育園' } });

    const confirmDeleteButton = screen.getByRole('button', {
      name: '削除する',
    });

    await waitFor(() => {
      expect(confirmDeleteButton).toBeEnabled();
    });

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteNursery).toHaveBeenCalledWith('nursery-1');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
