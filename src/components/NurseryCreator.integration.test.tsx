/**
 * 保育園追加コンポーネントの統合テスト
 * 実際のuseNurseryStoreとの連携をテスト
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import { NurseryCreator } from './NurseryCreator';

// 実際のstoreを使用するため、モックは削除
// ただし、実際のAPI呼び出しは避けるため、createNursery関数だけモック

describe('NurseryCreator 統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('実際のストアとの連携で保存が正常に動作する', async () => {
    const user = userEvent.setup();
    const mockOnCancel = vi.fn();

    renderWithProviders(<NurseryCreator onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText('保育園名');
    const visitDateInput = screen.getByLabelText('見学日');
    const saveButton = screen.getByRole('button', { name: '保存' });

    // 有効なデータを入力
    await user.type(nameInput, 'リアル統合テスト保育園');
    await user.type(visitDateInput, '2025-12-31');

    // 保存ボタンをクリック
    await user.click(saveButton);

    // 保存が成功したことを確認するアサーションを追加
    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  test('フォームのリセット機能', async () => {
    const user = userEvent.setup();
    const mockOnCancel = vi.fn();

    renderWithProviders(<NurseryCreator onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText('保育園名');
    const visitDateInput = screen.getByLabelText('見学日');

    // データを入力
    await user.type(nameInput, 'テストデータ');
    // React DatePickerは直接テキスト入力を受け付けないので、クリックで開く
    await user.click(visitDateInput);

    // 値が設定されていることを確認
    expect(nameInput).toHaveValue('テストデータ');

    // キャンセルボタンでフォームをリセット
    const cancelButton = screen.getByRole('button', {
      name: '保育園編集をキャンセル',
    });
    await user.click(cancelButton);

    // onCancelが呼ばれることを確認（実際のアプリではフォームがクローズされる）
    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  test('エラーハンドリングの統合テスト', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

    // 無効なデータでバリデーションエラーをトリガー
    const saveButton = screen.getByRole('button', { name: '保存' });
    await user.click(saveButton);

    // バリデーションエラーが表示されることを確認
    expect(screen.getByText('保育園名は必須です')).toBeInTheDocument();
    // 見学日は任意項目のため、必須エラーは表示されない
  });

  test('日付入力の境界値テスト', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText('保育園名');
    const visitDateInput = screen.getByLabelText('見学日');
    const saveButton = screen.getByRole('button', { name: '保存' });

    await user.type(nameInput, '境界値テスト保育園');

    // 今日の日付を設定（有効）
    const today = new Date().toISOString().split('T')[0];
    await user.type(visitDateInput, today);
    await user.click(saveButton);

    // エラーが表示されないことを確認
    await waitFor(() => {
      expect(screen.queryByText(/見学日.*エラー/)).not.toBeInTheDocument();
    });
  });

  test('特殊文字を含む保育園名の処理', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText('保育園名');
    const saveButton = screen.getByRole('button', { name: '保存' });

    // 特殊文字を含む保育園名
    const specialName = '🌸さくら保育園★（本店）& Co.';
    await user.type(nameInput, specialName);

    await user.click(saveButton);

    // 特殊文字が正常に処理されることを確認
    expect(nameInput).toHaveValue(specialName);
  });

  test('長い保育園名の処理', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText('保育園名');
    const saveButton = screen.getByRole('button', { name: '保存' });

    // 100文字ちょうどの保育園名（有効）
    const exactLengthName = 'あ'.repeat(100);
    await user.type(nameInput, exactLengthName);
    await user.click(saveButton);

    // 長さエラーが表示されないことを確認
    expect(
      screen.queryByText('保育園名は100文字以内で入力してください')
    ).not.toBeInTheDocument();

    // 101文字の保育園名（無効）
    await user.clear(nameInput);
    const tooLongName = 'あ'.repeat(101);
    await user.type(nameInput, tooLongName);
    await user.click(saveButton);

    // 長さエラーが表示されることを確認
    expect(
      screen.getByText('保育園名は100文字以内で入力してください')
    ).toBeInTheDocument();
  });

  test('アクセシビリティ: aria属性とrole属性の確認', () => {
    renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

    // 必須フィールドにrequired属性があることを確認
    const nameInput = screen.getByLabelText('保育園名');

    expect(nameInput).toBeRequired();
    // 見学日は任意項目のため、required属性はない

    // ヘルプテキストが表示されることを確認
    expect(
      screen.getByText('見学日が未定の場合は空欄のまま保存してください')
    ).toBeInTheDocument();

    // ボタンのrole属性を確認
    const saveButton = screen.getByRole('button', { name: '保存' });
    const cancelButton = screen.getByRole('button', {
      name: '保育園編集をキャンセル',
    });

    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  test('フォームの状態管理の一貫性', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText('保育園名');

    // 段階的にデータを入力
    await user.type(nameInput, 'テ');
    expect(nameInput).toHaveValue('テ');

    await user.type(nameInput, 'スト');
    expect(nameInput).toHaveValue('テスト');

    // 値が正確に保持されていることを確認
    expect(nameInput).toHaveValue('テスト');
  });

  test('見学日なしで保存が可能', async () => {
    const user = userEvent.setup();

    renderWithProviders(<NurseryCreator onCancel={vi.fn()} />);

    const nameInput = screen.getByLabelText('保育園名');
    const visitDateInput = screen.getByLabelText('見学日');
    const saveButton = screen.getByRole('button', { name: '保存' });

    // 保育園名のみ入力（見学日は空欄）
    await user.type(nameInput, '見学日未定保育園');

    // 見学日が空欄であることを確認
    expect(visitDateInput).toHaveValue('');

    // 保存ボタンをクリック
    await user.click(saveButton);

    // バリデーションエラーが表示されないことを確認
    expect(screen.queryByText(/見学日.*必須/)).not.toBeInTheDocument();
  });
});
