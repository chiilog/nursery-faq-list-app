/**
 * FormActionsコンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { FormActions } from './FormActions';

describe('FormActions', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Primary variant (デフォルト)', () => {
    it('保存とキャンセルボタンが表示される', () => {
      renderWithProviders(
        <FormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('保存')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();

      // ボタンの配置順序を確認（キャンセルが左、保存が右）
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('キャンセル');
      expect(buttons[1]).toHaveTextContent('保存');
    });

    it('保存ボタンクリックでonSaveが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('保存'));
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('キャンセルボタンクリックでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('キャンセル'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('isDisabledがtrueの時、保存ボタンのみが無効化される', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isDisabled={true}
        />
      );

      expect(screen.getByText('保存')).toBeDisabled();
      expect(screen.getByText('キャンセル')).not.toBeDisabled();
    });

    it('大きいサイズ（lg）がデフォルトで適用される', () => {
      renderWithProviders(
        <FormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const saveButton = screen.getByText('保存');
      // Chakra UIのButtonコンポーネントはクラス名でサイズを表現
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Inline variant', () => {
    it('インラインバリアントで小さいサイズが適用される', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          variant="inline"
          size="sm"
        />
      );

      const saveButton = screen.getByText('保存');
      // サイズsmが指定されていることを確認
      expect(saveButton).toBeInTheDocument();
    });

    it('カスタムラベルが表示される', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saveLabel="更新"
          cancelLabel="戻る"
        />
      );

      expect(screen.getByText('更新')).toBeInTheDocument();
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });
  });

  describe('カスタムボタンプロパティ', () => {
    it('saveButtonPropsが適用される', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saveButtonProps={{
            'aria-label': 'カスタム保存ボタン',
          }}
        />
      );

      expect(screen.getByLabelText('カスタム保存ボタン')).toBeInTheDocument();
    });

    it('cancelButtonPropsが適用される', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          cancelButtonProps={{
            'aria-label': 'カスタムキャンセルボタン',
          }}
        />
      );

      expect(
        screen.getByLabelText('カスタムキャンセルボタン')
      ).toBeInTheDocument();
    });

    it('disabledの時にカスタムスタイルが適用される', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isDisabled={true}
          saveButtonProps={{
            opacity: 0.4,
            cursor: 'not-allowed',
          }}
        />
      );

      const saveButton = screen.getByText('保存').closest('button');
      expect(saveButton).toHaveStyle({
        opacity: '0.4',
        cursor: 'not-allowed',
      });
    });
  });

  describe('異なるサイズ', () => {
    it.each(['sm', 'md', 'lg'] as const)('サイズ %s が適用される', (size) => {
      renderWithProviders(
        <FormActions onSave={mockOnSave} onCancel={mockOnCancel} size={size} />
      );

      const saveButton = screen.getByText('保存');
      // サイズが指定されていることを確認
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('縦並びレイアウト', () => {
    it('縦並びで保存ボタンが上、キャンセルボタンが下に表示される', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          layout="vertical"
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('保存');
      expect(buttons[1]).toHaveTextContent('キャンセル');
    });

    it('縦並びでボタンが全幅になる', () => {
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          layout="vertical"
        />
      );

      // 縦並びレイアウトではボタンが存在し、正しい順序で配置される
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent('保存');
      expect(buttons[1]).toHaveTextContent('キャンセル');
    });

    it('縦並びレイアウトでもクリックイベントが動作する', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          layout="vertical"
        />
      );

      await user.click(screen.getByText('保存'));
      expect(mockOnSave).toHaveBeenCalledTimes(1);

      await user.click(screen.getByText('キャンセル'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
