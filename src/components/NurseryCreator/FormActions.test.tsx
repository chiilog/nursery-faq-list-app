/**
 * FormActionsコンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import {
  PrimaryFormActions,
  InlineFormActions,
  VerticalFormActions,
} from './FormActions';

describe('FormActionsコンポーネント群', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  describe('PrimaryFormActions', () => {
    it('保存とキャンセルボタンが表示される', () => {
      renderWithProviders(
        <PrimaryFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
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
        <PrimaryFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('保存'));
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('キャンセルボタンクリックでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <PrimaryFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('キャンセル'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('isDisabled=trueで保存ボタンが無効になる', () => {
      renderWithProviders(
        <PrimaryFormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isDisabled={true}
        />
      );

      const saveButton = screen.getByText('保存');
      expect(saveButton).toBeDisabled();

      const cancelButton = screen.getByText('キャンセル');
      expect(cancelButton).not.toBeDisabled();
    });

    it('カスタムラベルが使用できる', () => {
      renderWithProviders(
        <PrimaryFormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          saveLabel="登録"
          cancelLabel="戻る"
        />
      );

      expect(screen.getByText('登録')).toBeInTheDocument();
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });

    it('size propが正しく適用される', () => {
      const { rerender } = renderWithProviders(
        <PrimaryFormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          size="sm"
        />
      );

      const saveButton = screen.getByText('保存');
      const cancelButton = screen.getByText('キャンセル');
      expect(saveButton).toHaveAttribute('data-size', 'sm');
      expect(cancelButton).toHaveAttribute('data-size', 'sm');

      rerender(
        <PrimaryFormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          size="lg"
        />
      );

      expect(saveButton).toHaveAttribute('data-size', 'lg');
      expect(cancelButton).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('InlineFormActions', () => {
    it('保存とキャンセルボタンが表示される', () => {
      renderWithProviders(
        <InlineFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
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
        <InlineFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('保存'));
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('キャンセルボタンクリックでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InlineFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('キャンセル'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('isDisabled=trueで保存ボタンが無効になる', () => {
      renderWithProviders(
        <InlineFormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isDisabled={true}
        />
      );

      const saveButton = screen.getByText('保存');
      expect(saveButton).toBeDisabled();

      const cancelButton = screen.getByText('キャンセル');
      expect(cancelButton).not.toBeDisabled();
    });

    it('デフォルトでsmサイズが適用される', () => {
      renderWithProviders(
        <InlineFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const saveButton = screen.getByText('保存');
      const cancelButton = screen.getByText('キャンセル');
      expect(saveButton).toHaveAttribute('data-size', 'sm');
      expect(cancelButton).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('VerticalFormActions', () => {
    it('保存とキャンセルボタンが縦並びで表示される', () => {
      renderWithProviders(
        <VerticalFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('保存')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();

      // ボタンの配置順序を確認（保存が上、キャンセルが下）
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('保存');
      expect(buttons[1]).toHaveTextContent('キャンセル');
    });

    it('保存ボタンクリックでonSaveが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerticalFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('保存'));
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('キャンセルボタンクリックでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <VerticalFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByText('キャンセル'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('isDisabled=trueで保存ボタンが無効になる', () => {
      renderWithProviders(
        <VerticalFormActions
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isDisabled={true}
        />
      );

      const saveButton = screen.getByText('保存');
      expect(saveButton).toBeDisabled();

      const cancelButton = screen.getByText('キャンセル');
      expect(cancelButton).not.toBeDisabled();
    });

    it('デフォルトでlgサイズが適用される', () => {
      renderWithProviders(
        <VerticalFormActions onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const saveButton = screen.getByText('保存');
      const cancelButton = screen.getByText('キャンセル');
      expect(saveButton).toHaveAttribute('data-size', 'lg');
      expect(cancelButton).toHaveAttribute('data-size', 'lg');
    });
  });
});
