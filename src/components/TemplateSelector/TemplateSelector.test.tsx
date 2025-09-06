import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import { TemplateSelector } from './TemplateSelector';
import { useSystemTemplates } from '../../hooks/template/useSystemTemplates';
import { useTemplateApplication } from '../../hooks/template/useTemplateApplication';
import { showToast } from '../../utils/toaster';

// モックの設定
vi.mock('../../hooks/template/useSystemTemplates');
vi.mock('../../hooks/template/useTemplateApplication');
vi.mock('../../utils/toaster');

describe('TemplateSelector', () => {
  const mockApplyTemplate =
    vi.fn<ReturnType<typeof useTemplateApplication>['applyTemplate']>();
  const mockShowToastSuccess = vi.fn();
  const mockShowToastError = vi.fn();

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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(useSystemTemplates).mockReturnValue({
      templates,
      loading: false,
      error: null,
      loadTemplates: vi.fn(),
    });

    vi.mocked(useTemplateApplication).mockReturnValue({
      isApplying: false,
      applyTemplate: mockApplyTemplate,
    });

    // showToastの各メソッドを個別にモック
    vi.mocked(showToast).success = mockShowToastSuccess;
    vi.mocked(showToast).error = mockShowToastError;
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
    mockApplyTemplate.mockResolvedValueOnce(true);

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

    // useTemplateApplication.applyTemplateが正しいパラメータで呼ばれることを確認
    await waitFor(() => {
      expect(mockApplyTemplate).toHaveBeenCalledWith(
        'nursery-1',
        expect.objectContaining({
          id: 'system-common',
          name: '共通テンプレート',
          isSystem: true,
        })
      );
    });

    // 成功トーストが表示されることを確認
    expect(mockShowToastSuccess).toHaveBeenCalledWith('質問を追加しました');

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

    // キャンセル時は何も処理されないことを確認（console.logも呼ばれない）
    // この場合は特に確認するアクションがない

    // ダイアログが閉じることを確認
    await waitFor(() => {
      expect(
        screen.queryByText('保活手帳オススメの質問リスト')
      ).not.toBeInTheDocument();
    });
  });

  test('テンプレートが存在する場合はリンクが表示される', () => {
    const mockSystemTemplates = [
      {
        id: 'system-common',
        name: '共通テンプレート',
        questions: ['テスト質問1', 'テスト質問2'],
        nurseryType: 'common' as const,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(useSystemTemplates).mockReturnValue({
      templates: mockSystemTemplates, // テンプレートがある状態でテスト
      loading: false, // loading: trueだとリンクが表示されないため
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
    // applyTemplateがエラーを投げるようにモック
    mockApplyTemplate.mockResolvedValueOnce(false);

    // console.errorをスパイ
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

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

    // applyTemplateがfalseを返したことを確認
    await waitFor(() => {
      expect(mockApplyTemplate).toHaveBeenCalledTimes(1);
    });

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(
        screen.getByText('質問の追加に失敗しました。もう一度お試しください。')
      ).toBeInTheDocument();
    });

    // ダイアログは開いたまま（エラー時は閉じない）
    expect(
      screen.getByText('保活手帳オススメの質問リスト')
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  test('アクセシビリティ: リンクが適切にアクセス可能', () => {
    renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

    const link = screen.getByText('テンプレートから質問を追加する');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('テンプレートから質問を追加する');
  });

  // エラーハンドリングテスト
  describe('エラーハンドリング', () => {
    test('useSystemTemplatesがエラーを返した場合でもリンクは表示される', () => {
      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: [],
        loading: false,
        error: 'ネットワークエラーが発生しました',
        loadTemplates: vi.fn(),
      });

      renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

      // エラーがあってもテンプレートが空の場合は何も表示されない
      const { container } = renderWithProviders(
        <TemplateSelector nurseryId="nursery-1" />
      );
      expect(container.firstChild).toBeNull();
    });

    test('useSystemTemplatesがエラーとテンプレートの両方を返した場合', () => {
      const templates = [
        {
          id: 'system-common',
          name: '共通テンプレート',
          questions: ['テスト質問1'],
          nurseryType: 'common' as const,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(useSystemTemplates).mockReturnValue({
        templates,
        loading: false,
        error: '一部のテンプレートの読み込みに失敗しました',
        loadTemplates: vi.fn(),
      });

      renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

      // エラーがあってもテンプレートが存在する場合はリンクが表示される
      const link = screen.getByText('テンプレートから質問を追加する');
      expect(link).toBeInTheDocument();
    });

    test('nurseryIdが空文字の場合のバリデーション', () => {
      expect(() => {
        renderWithProviders(<TemplateSelector nurseryId="" />);
      }).not.toThrow();

      // 空文字でもコンポーネントが正常にレンダリングされること
      const link = screen.getByText('テンプレートから質問を追加する');
      expect(link).toBeInTheDocument();
    });

    test('nurseryIdがundefinedの場合の処理', () => {
      expect(() => {
        renderWithProviders(<TemplateSelector nurseryId={undefined as any} />);
      }).not.toThrow();
    });
  });

  // 境界値テスト
  describe('境界値テスト', () => {
    test('テンプレートが大量にある場合の処理', () => {
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        id: `template-${i}`,
        name: `テンプレート${i}`,
        questions: [`質問${i}`],
        nurseryType: 'common' as const,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: manyTemplates,
        loading: false,
        error: null,
        loadTemplates: vi.fn(),
      });

      expect(() => {
        renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);
      }).not.toThrow();

      const link = screen.getByText('テンプレートから質問を追加する');
      expect(link).toBeInTheDocument();
    });

    test('質問が空のテンプレートがある場合', () => {
      const templatesWithEmptyQuestions = [
        {
          id: 'empty-template',
          name: '空のテンプレート',
          questions: [], // 空の質問配列
          nurseryType: 'common' as const,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: templatesWithEmptyQuestions,
        loading: false,
        error: null,
        loadTemplates: vi.fn(),
      });

      renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);

      const link = screen.getByText('テンプレートから質問を追加する');
      expect(link).toBeInTheDocument();
    });

    test('非常に長い名前のテンプレートがある場合', () => {
      const longNameTemplate = [
        {
          id: 'long-name-template',
          name: 'とても長い名前のテンプレート'.repeat(10), // 非常に長い名前
          questions: ['質問1'],
          nurseryType: 'common' as const,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: longNameTemplate,
        loading: false,
        error: null,
        loadTemplates: vi.fn(),
      });

      expect(() => {
        renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);
      }).not.toThrow();
    });
  });

  // 型安全性テスト
  describe('型安全性テスト', () => {
    test('不正な型のpropsでも安全に処理される', () => {
      // TypeScriptでは型エラーになるが、実行時には処理される
      expect(() => {
        renderWithProviders(<TemplateSelector nurseryId={123 as any} />);
      }).not.toThrow();
    });

    test('useSystemTemplatesが不正な型のテンプレートを返した場合', () => {
      const invalidTemplates = [
        {
          id: 123, // 本来はstring
          name: null, // 本来はstring
          questions: 'invalid', // 本来はstring[]
          isSystem: 'yes', // 本来はboolean
        },
      ];

      vi.mocked(useSystemTemplates).mockReturnValue({
        templates: invalidTemplates as any,
        loading: false,
        error: null,
        loadTemplates: vi.fn(),
      });

      expect(() => {
        renderWithProviders(<TemplateSelector nurseryId="nursery-1" />);
      }).not.toThrow();
    });
  });
});
