import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import { TemplateSelector } from './TemplateSelector';
import { useTemplate } from '../../hooks/useTemplate';

// モックの設定
vi.mock('../../hooks/useTemplate');

describe('TemplateSelector', () => {
  const mockApplyTemplate = vi.fn();
  const mockGetTemplates = vi.fn();
  const mockGetAllTemplates = vi.fn();
  const mockHasTemplates = vi.fn();

  const mockTemplateStats = {
    total: 1,
    system: 1,
    custom: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック実装
    const templates = [
      {
        id: 'default-nursery-visit',
        title: '保育園見学 基本質問セット',
        description: 'テスト用テンプレート',
        isCustom: false,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockGetTemplates.mockReturnValue(templates);
    mockGetAllTemplates.mockReturnValue(templates);
    mockHasTemplates.mockReturnValue(true);

    vi.mocked(useTemplate).mockReturnValue({
      isApplying: false,
      applyTemplate: mockApplyTemplate,
      getTemplates: mockGetTemplates,
      hasTemplates: mockHasTemplates,
      getAllTemplates: mockGetAllTemplates,
      templateStats: mockTemplateStats,
    });
  });

  test('「テンプレートから質問を追加する」リンクが表示される', () => {
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    const button = screen.getByText('テンプレートから質問を追加する');
    expect(button).toBeInTheDocument();
    // ボタンのテキストも確認
    expect(button).toHaveTextContent('テンプレートから質問を追加する');
  });

  test('リンククリックで確認ダイアログが表示される', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    const button = screen.getByText('テンプレートから質問を追加する');
    await user.click(button);

    // 確認ダイアログの内容を確認
    const dialog = screen.getByRole('dialog');
    expect(
      screen.getByText('保活手帳オススメの質問リスト')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/汎用的に使えそうなテンプレートを用意しています/i)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', {
        name: /テンプレートの質問を保育園に追加/i,
      })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /キャンセル/i })
    ).toBeInTheDocument();
  });

  test('確認ダイアログで「追加する」をクリックするとテンプレートが適用される', async () => {
    mockApplyTemplate.mockResolvedValue(true);

    const user = userEvent.setup();
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    // リンクをクリック
    const button = screen.getByText('テンプレートから質問を追加する');
    await user.click(button);

    // 確認ダイアログで「追加する」をクリック
    const dialog = screen.getByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: /テンプレートの質問を保育園に追加/i,
    });
    await user.click(confirmButton);

    // テンプレート適用関数が呼ばれたことを確認
    expect(mockApplyTemplate).toHaveBeenCalledWith('nursery-1');

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(
        screen.queryByText('保活手帳オススメの質問リスト')
      ).not.toBeInTheDocument();
    });
  });

  test('確認ダイアログで「キャンセル」をクリックすると何もしない', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    // リンクをクリック
    const button = screen.getByText('テンプレートから質問を追加する');
    await user.click(button);

    // 確認ダイアログで「キャンセル」をクリック
    const dialog = screen.getByRole('dialog');
    const cancelButton = within(dialog).getByRole('button', {
      name: /キャンセル/i,
    });
    await user.click(cancelButton);

    // テンプレート適用関数が呼ばれていないことを確認
    expect(mockApplyTemplate).not.toHaveBeenCalled();

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(
        screen.queryByText('保活手帳オススメの質問リスト')
      ).not.toBeInTheDocument();
    });
  });

  test('適用中でもリンクは表示される（ローディング状態は確認ダイアログ内で制御される）', () => {
    vi.mocked(useTemplate).mockReturnValue({
      isApplying: true,
      applyTemplate: mockApplyTemplate,
      getTemplates: mockGetTemplates,
      hasTemplates: mockHasTemplates,
      getAllTemplates: mockGetAllTemplates,
      templateStats: mockTemplateStats,
    });

    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    const link = screen.getByText('テンプレートから質問を追加する');
    expect(link).toBeInTheDocument();
    // リンクは常にクリック可能
    expect(link).not.toBeDisabled();
  });

  test('テンプレートが存在しない場合は何も表示されない', () => {
    vi.mocked(useTemplate).mockReturnValue({
      isApplying: false,
      applyTemplate: mockApplyTemplate,
      getTemplates: mockGetTemplates,
      hasTemplates: vi.fn().mockReturnValue(false),
      getAllTemplates: mockGetAllTemplates,
      templateStats: mockTemplateStats,
    });

    const { container } = renderWithProviders(
      <TemplateSelector nurseryId="nursery-1" />
    );

    expect(container.firstChild).toBeNull();
  });

  test('テンプレート適用に失敗した場合のエラー処理', async () => {
    mockApplyTemplate.mockResolvedValue(false);

    const user = userEvent.setup();
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    // リンクをクリック
    const button = screen.getByText('テンプレートから質問を追加する');
    await user.click(button);

    // 確認ダイアログで「追加する」をクリック
    const dialog = screen.getByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: /テンプレートの質問を保育園に追加/i,
    });
    await user.click(confirmButton);

    // ダイアログが閉じることを確認（エラー処理はuseTemplateフック内で行われる）
    await waitFor(() => {
      expect(
        screen.queryByText(/基本質問セットを追加/i)
      ).not.toBeInTheDocument();
    });
  });

  test('アクセシビリティ: リンクが適切にアクセス可能', () => {
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    const link = screen.getByText('テンプレートから質問を追加する');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('テンプレートから質問を追加する');
  });
});
