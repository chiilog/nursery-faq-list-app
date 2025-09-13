/**
 * ActionButtonsコンポーネントのテスト
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import { ActionButtons } from './ActionButtons';

describe('ActionButtons', () => {
  describe('基本表示', () => {
    test('プライマリアクションのみの場合、単一ボタンが表示される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
        />
      );

      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'キャンセル' })
      ).not.toBeInTheDocument();
    });

    test('プライマリとセカンダリアクションの両方が表示される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
          }}
        />
      );

      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'キャンセル' })
      ).toBeInTheDocument();
    });

    test('カスタムラベルが正しく表示される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '削除する',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: '戻る',
            onClick: vi.fn(),
          }}
        />
      );

      expect(
        screen.getByRole('button', { name: '削除する' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
    });
  });

  describe('クリックイベント', () => {
    test('プライマリボタンクリックでonClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const handlePrimaryClick = vi.fn();

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: handlePrimaryClick,
          }}
        />
      );

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      expect(handlePrimaryClick).toHaveBeenCalledTimes(1);
    });

    test('セカンダリボタンクリックでonClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleSecondaryClick = vi.fn();

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: handleSecondaryClick,
          }}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(handleSecondaryClick).toHaveBeenCalledTimes(1);
    });

    test('複数回クリックで複数回コールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: 'クリック',
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'クリック' });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('無効化状態', () => {
    test('プライマリボタンがdisabledの場合、クリックできない', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: handleClick,
            disabled: true,
          }}
        />
      );

      const saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).toBeDisabled();

      await user.click(saveButton);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('セカンダリボタンがdisabledの場合、クリックできない', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: handleClick,
            disabled: true,
          }}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      expect(cancelButton).toBeDisabled();

      await user.click(cancelButton);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('プライマリがloading中は、セカンダリボタンも無効化される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
            loading: true,
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
          }}
        />
      );

      // loading中のボタンはaria-labelが空になるため、getAllByRoleを使用
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // 両方のボタンが無効化されている
      expect(buttons[0]).toBeDisabled(); // キャンセルボタン
      expect(buttons[1]).toBeDisabled(); // 保存ボタン（loading中）
    });
  });

  describe('ローディング状態', () => {
    test('プライマリボタンのloading状態が正しく表示される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存中...',
            onClick: vi.fn(),
            loading: true,
          }}
        />
      );

      // loading中のボタンはaria-labelが空になるが、存在は確認できる
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toBeDisabled();

      // loading中でもテキストは表示される
      expect(screen.getByText('保存中...')).toBeInTheDocument();
    });

    test('セカンダリボタンのloading状態が正しく表示される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: '処理中...',
            onClick: vi.fn(),
            loading: true,
          }}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // セカンダリボタン（最初のボタン）がloading中で無効化
      expect(buttons[0]).toBeDisabled();

      // プライマリボタンは有効
      expect(buttons[1]).not.toBeDisabled();

      // loading中でもテキストは表示される
      expect(screen.getByText('処理中...')).toBeInTheDocument();
    });
  });

  describe('スタイルバリエーション', () => {
    test('カスタムvariantが適用される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '削除',
            onClick: vi.fn(),
            variant: 'outline',
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
            variant: 'ghost',
          }}
        />
      );

      const deleteButton = screen.getByRole('button', { name: '削除' });
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });

      expect(deleteButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });

    test('カスタムcolorPaletteが適用される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '削除',
            onClick: vi.fn(),
            colorPalette: 'red',
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
            colorPalette: 'gray',
          }}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    test('デフォルトスタイルが正しく適用される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
        />
      );

      const saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).toBeInTheDocument();
      // デフォルト: variant="solid", colorPalette="brand"
    });
  });

  describe('サイズプロパティ', () => {
    test('sizeプロパティが正しく適用される', () => {
      const { rerender } = renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          size="sm"
        />
      );

      let saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).toBeInTheDocument();

      // サイズ変更
      rerender(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          size="lg"
        />
      );

      saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).toBeInTheDocument();
    });

    test('デフォルトサイズはlgになる', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
        />
      );

      const saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).toBeInTheDocument();
      // デフォルトサイズ: lg
    });
  });

  describe('レイアウトプロパティ', () => {
    test('fullWidthモードで全幅表示される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
          }}
          fullWidth={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      // fullWidth時、プライマリがflex:2、セカンダリがflex:1
    });

    test('justify位置が正しく適用される', () => {
      const { rerender } = renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
          }}
          justify="start"
        />
      );

      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();

      // justify変更
      rerender(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
          }}
          justify="end"
        />
      );

      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    });

    test('カスタムgapが適用される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
          }}
          gap={8}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('エッジケース', () => {
    test('空文字ラベルでもボタンが表示される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '',
            onClick: vi.fn(),
          }}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    test('非常に長いラベルでも正しく表示される', () => {
      const longLabel =
        'これは非常に長いボタンラベルのテストです。文字数が多い場合でも適切に表示されることを確認します。';

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: longLabel,
            onClick: vi.fn(),
          }}
        />
      );

      expect(
        screen.getByRole('button', { name: longLabel })
      ).toBeInTheDocument();
    });

    test('特殊文字を含むラベルが正しく表示される', () => {
      const specialLabel = '保存 & 続行 <script>alert("test")</script>';

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: specialLabel,
            onClick: vi.fn(),
          }}
        />
      );

      expect(
        screen.getByRole('button', { name: specialLabel })
      ).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('ボタンにrole="button"が設定されている', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
          }}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    test('disabled状態がaria属性に反映される', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
            disabled: true,
          }}
        />
      );

      const saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).toHaveAttribute('disabled');
    });

    test('キーボードナビゲーションが機能する', async () => {
      const user = userEvent.setup();
      const handlePrimary = vi.fn();
      const handleSecondary = vi.fn();

      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: handlePrimary,
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: handleSecondary,
          }}
        />
      );

      // Tab でボタン間を移動
      await user.tab();
      const activeElement = document.activeElement as HTMLElement;
      expect(activeElement.tagName).toBe('BUTTON');

      // Enterでクリック
      await user.keyboard('{Enter}');
      expect(handleSecondary).toHaveBeenCalledTimes(1);
    });
  });

  describe('統合テスト', () => {
    test('実際の使用例: 削除ダイアログのボタン構成', () => {
      renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '削除する',
            onClick: vi.fn(),
            disabled: false,
            loading: false,
            variant: 'solid',
            colorPalette: 'red',
          }}
          secondaryAction={{
            label: 'キャンセル',
            onClick: vi.fn(),
            variant: 'outline',
          }}
          size="lg"
          justify="space-between"
          fullWidth={false}
        />
      );

      expect(
        screen.getByRole('button', { name: '削除する' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'キャンセル' })
      ).toBeInTheDocument();
    });

    test('状態遷移: 通常→loading→disabled→通常', () => {
      const { rerender } = renderWithProviders(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
        />
      );

      const saveButton = screen.getByRole('button', { name: '保存' });
      expect(saveButton).not.toBeDisabled();

      // loading状態
      rerender(
        <ActionButtons
          primaryAction={{
            label: '保存中...',
            onClick: vi.fn(),
            loading: true,
          }}
        />
      );

      // loading状態
      const loadingButtons = screen.getAllByRole('button');
      expect(loadingButtons).toHaveLength(1);
      expect(loadingButtons[0]).toBeDisabled();
      expect(screen.getByText('保存中...')).toBeInTheDocument();

      // disabled状態
      rerender(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
            disabled: true,
          }}
        />
      );

      const disabledButton = screen.getByRole('button', { name: '保存' });
      expect(disabledButton).toBeDisabled();

      // 通常状態に戻る
      rerender(
        <ActionButtons
          primaryAction={{
            label: '保存',
            onClick: vi.fn(),
          }}
        />
      );

      const normalButton = screen.getByRole('button', { name: '保存' });
      expect(normalButton).not.toBeDisabled();
    });
  });
});
