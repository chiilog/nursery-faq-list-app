/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { NurseryNameSection } from './NurseryNameSection';

describe('NurseryNameSection', () => {
  const defaultProps = {
    nurseryName: 'テスト保育園',
    isEditing: false,
    editingName: '',
    onNameChange: vi.fn(),
  };

  describe('通常表示モード', () => {
    it('保育園名が表示される', () => {
      renderWithProviders(<NurseryNameSection {...defaultProps} />);

      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
    });

    it('入力フィールドは表示されない', () => {
      renderWithProviders(<NurseryNameSection {...defaultProps} />);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
      editingName: 'テスト保育園',
    };

    it('入力フィールドが表示される', () => {
      renderWithProviders(<NurseryNameSection {...editingProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('テスト保育園');
    });

    it('保育園名のテキストは表示されない', () => {
      renderWithProviders(<NurseryNameSection {...editingProps} />);

      expect(screen.queryByText('テスト保育園')).not.toBeInTheDocument();
    });

    it('入力値が変更されるとonNameChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const onNameChange = vi.fn();

      renderWithProviders(
        <NurseryNameSection
          {...defaultProps}
          isEditing={true}
          editingName=""
          onNameChange={onNameChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'A');

      // onNameChangeが呼ばれることを確認
      expect(onNameChange).toHaveBeenCalledWith('A');
    });

    it('プレースホルダーが正しく表示される', () => {
      renderWithProviders(
        <NurseryNameSection {...editingProps} editingName="" />
      );

      const input = screen.getByPlaceholderText('保育園名を入力してください');
      expect(input).toBeInTheDocument();
    });
  });
});
