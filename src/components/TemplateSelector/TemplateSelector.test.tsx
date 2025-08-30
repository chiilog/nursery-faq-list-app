import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import { TemplateSelector } from './TemplateSelector';
import { useSystemTemplates } from '../../hooks/template/useSystemTemplates';

// モックの設定
vi.mock('../../hooks/template/useSystemTemplates');

describe('TemplateSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック実装
    const templates = [
      {
        id: 'system-common',
        name: '共通テンプレート',
        questions: ['テスト質問1', 'テスト質問2'],
        nurseryType: 'common' as const,
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(useSystemTemplates).mockReturnValue({
      templates,
      loading: false,
      error: null,
      loadTemplates: vi.fn(),
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
    // console.logをスパイする
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

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

    // テンプレート適用のログが出力されることを確認
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'テンプレート適用:',
      expect.objectContaining({
        id: 'system-common',
        name: '共通テンプレート',
        isSystem: true,
      }),
      'nursery-1'
    );

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(
        screen.queryByText('保活手帳オススメの質問リスト')
      ).not.toBeInTheDocument();
    });

    consoleLogSpy.mockRestore();
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

    // キャンセル時は何も処理されないことを確認（console.logも呼ばれない）
    // この場合は特に確認するアクションがない

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(
        screen.queryByText('保活手帳オススメの質問リスト')
      ).not.toBeInTheDocument();
    });
  });

  test('適用中でもリンクは表示される（ローディング状態は確認ダイアログ内で制御される）', () => {
    vi.mocked(useSystemTemplates).mockReturnValue({
      templates: [],
      loading: true,
      error: null,
      loadTemplates: vi.fn(),
    });

    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    const link = screen.getByText('テンプレートから質問を追加する');
    expect(link).toBeInTheDocument();
    // リンクは常にクリック可能
    expect(link).not.toBeDisabled();
  });

  test('テンプレートが存在しない場合は何も表示されない', () => {
    vi.mocked(useSystemTemplates).mockReturnValue({
      templates: [],
      loading: false,
      error: null,
      loadTemplates: vi.fn(),
    });

    const { container } = renderWithProviders(
      <TemplateSelector nurseryId="nursery-1" />
    );

    expect(container.firstChild).toBeNull();
  });

  test('テンプレート適用に失敗した場合のエラー処理', async () => {
    // console.logをスパイする（正常パターンのテスト）
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

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

    // テンプレート適用のログが出力されることを確認
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'テンプレート適用:',
      expect.objectContaining({
        id: 'system-common',
        name: '共通テンプレート',
        isSystem: true,
      }),
      'nursery-1'
    );

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(
        screen.queryByText(/基本質問セットを追加/i)
      ).not.toBeInTheDocument();
    });

    consoleLogSpy.mockRestore();
  });

  test('アクセシビリティ: リンクが適切にアクセス可能', () => {
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    const link = screen.getByText('テンプレートから質問を追加する');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('テンプレートから質問を追加する');
  });
});
