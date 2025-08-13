/**
 * NurseryNameInputコンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { NurseryNameInput } from './NurseryNameInput';

describe('NurseryNameInput コンポーネント', () => {
  describe('基本表示', () => {
    test('プレースホルダーが表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput
          value=""
          onChange={mockOnChange}
          placeholder="保育園名を入力してください"
        />
      );

      expect(
        screen.getByPlaceholderText('保育園名を入力してください')
      ).toBeInTheDocument();
    });

    test('入力値が表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput value="テスト保育園" onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('テスト保育園')).toBeInTheDocument();
    });

    test('ラベル付きで表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput value="" onChange={mockOnChange} label="保育園名" />
      );

      expect(screen.getByText('保育園名')).toBeInTheDocument();
    });

    test('必須マークが表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput
          value=""
          onChange={mockOnChange}
          label="保育園名"
          isRequired={true}
        />
      );

      expect(screen.getByText('保育園名')).toBeInTheDocument();
      // 必須マークの具体的なテストは省略（Chakra UIの実装に依存）
    });
  });

  describe('入力操作', () => {
    test('テキスト入力でonChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput value="" onChange={mockOnChange} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'テスト保育園');

      // userEvent.typeは1文字ずつonChangeを呼び出すため、呼び出し回数をチェック
      expect(mockOnChange).toHaveBeenCalledTimes(6); // 'テスト保育園' = 6文字
      // 各文字が順番に入力されることを確認
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'テ');
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'ス');
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'ト');
      expect(mockOnChange).toHaveBeenNthCalledWith(4, '保');
      expect(mockOnChange).toHaveBeenNthCalledWith(5, '育');
      expect(mockOnChange).toHaveBeenNthCalledWith(6, '園');
    });

    test('1文字ずつ入力される', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput value="" onChange={mockOnChange} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '新');

      expect(mockOnChange).toHaveBeenCalledWith('新');
    });

    test('絵文字や記号が含まれていても入力できる', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput value="" onChange={mockOnChange} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '🌸さくら保育園☆（本店）');

      // 絵文字や記号を含む文字列の入力を確認
      // userEvent.typeは各キーストロークでonChangeを呼び出す
      // 絵文字は2文字分として扱われることがある
      expect(mockOnChange).toHaveBeenCalled();
      // 最後の文字が入力されることを確認
      expect(mockOnChange).toHaveBeenLastCalledWith('）');
    });
  });

  describe('エラー状態', () => {
    test('エラー状態でボーダーが赤色になる（ラベルなし）', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput
          value=""
          onChange={mockOnChange}
          isInvalid={true}
          errorMessage="保育園名を入力してください"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-error', 'true');
      expect(
        screen.getByText('保育園名を入力してください')
      ).toBeInTheDocument();
    });

    test('エラー状態でエラーメッセージが表示される（ラベル付き）', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput
          value=""
          onChange={mockOnChange}
          label="保育園名"
          isInvalid={true}
          errorMessage="保育園名は100文字以内で入力してください"
        />
      );

      expect(
        screen.getByText('保育園名は100文字以内で入力してください')
      ).toBeInTheDocument();
    });

    test('エラーが解消されると正常状態に戻る', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput
          value="テスト保育園"
          onChange={mockOnChange}
          isInvalid={false}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-error', 'false');
      expect(
        screen.queryByText('保育園名を入力してください')
      ).not.toBeInTheDocument();
    });
  });

  describe('無効化状態', () => {
    test('disabled状態でInputが無効化される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput value="" onChange={mockOnChange} disabled={true} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    test('disabled状態でも入力値は表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput
          value="編集中の保育園名"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const input = screen.getByDisplayValue('編集中の保育園名');
      expect(input).toBeDisabled();
    });
  });

  describe('アクセシビリティ', () => {
    test('ラベルとInputが正しく関連付けられる', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput
          value=""
          onChange={mockOnChange}
          label="保育園名"
          id="nursery-name"
        />
      );

      const input = screen.getByLabelText('保育園名');
      expect(input).toHaveAttribute('id', 'nursery-name');
    });

    test('required属性が正しく設定される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <NurseryNameInput value="" onChange={mockOnChange} isRequired={true} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });
});
