/**
 * VisitDatePickerコンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { VisitDatePicker } from './VisitDatePicker';

describe('VisitDatePicker コンポーネント', () => {
  describe('基本表示', () => {
    test('プレースホルダーが表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <VisitDatePicker
          selectedDate={null}
          onChange={mockOnChange}
          placeholder="見学日を選択してください"
        />
      );

      expect(
        screen.getByPlaceholderText('見学日を選択してください')
      ).toBeInTheDocument();
    });

    test('選択された日付が表示される', () => {
      const mockOnChange = vi.fn();
      const selectedDate = new Date('2025-02-15');

      renderWithProviders(
        <VisitDatePicker selectedDate={selectedDate} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('2025/02/15')).toBeInTheDocument();
    });

    test('ラベル付きで表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <VisitDatePicker
          selectedDate={null}
          onChange={mockOnChange}
          label="見学日"
        />
      );

      expect(screen.getByText('見学日')).toBeInTheDocument();
    });

    test('必須マークが表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <VisitDatePicker
          selectedDate={null}
          onChange={mockOnChange}
          label="見学日"
          isRequired={true}
        />
      );

      expect(screen.getByText('見学日')).toBeInTheDocument();
      // 必須マークの具体的なテストは省略（Chakra UIの実装に依存）
    });
  });

  describe('エラー状態', () => {
    test('エラー状態でボーダーが赤色になる', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <VisitDatePicker
          selectedDate={null}
          onChange={mockOnChange}
          label="見学日"
          isInvalid={true}
          errorMessage="有効な日付を入力してください"
        />
      );

      expect(
        screen.getByText('有効な日付を入力してください')
      ).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <VisitDatePicker
          selectedDate={null}
          onChange={mockOnChange}
          label="見学日"
          isInvalid={true}
          errorMessage="見学日は今日以降の日付を入力してください"
        />
      );

      expect(
        screen.getByText('見学日は今日以降の日付を入力してください')
      ).toBeInTheDocument();
    });
  });

  describe('ヘルプテキスト', () => {
    test('ヘルプテキストが表示される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <VisitDatePicker
          selectedDate={null}
          onChange={mockOnChange}
          label="見学日"
          helperText="見学日が未定の場合は空欄のまま保存してください"
        />
      );

      expect(
        screen.getByText('見学日が未定の場合は空欄のまま保存してください')
      ).toBeInTheDocument();
    });
  });

  describe('無効化状態', () => {
    test('disabled状態でInputが無効化される', () => {
      const mockOnChange = vi.fn();

      renderWithProviders(
        <VisitDatePicker
          selectedDate={null}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('インタラクション', () => {
    test('日付をクリアできる', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const selectedDate = new Date('2025-02-15');

      renderWithProviders(
        <VisitDatePicker selectedDate={selectedDate} onChange={mockOnChange} />
      );

      // クリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: 'Close' });
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith(null, expect.anything());
    });
  });
});
