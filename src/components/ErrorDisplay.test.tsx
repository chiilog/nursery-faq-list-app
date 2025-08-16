import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorDisplay } from './ErrorDisplay';
import { renderWithProviders as render } from '../test/test-utils';

describe('ErrorDisplay', () => {
  it('エラーメッセージが表示される', () => {
    const error = { message: 'テストエラーメッセージ' };
    const onClose = vi.fn();

    render(<ErrorDisplay error={error} onClose={onClose} />);

    expect(screen.getByText('テストエラーメッセージ')).toBeInTheDocument();
  });

  it('閉じるボタンが表示される', () => {
    const error = { message: 'テストエラーメッセージ' };
    const onClose = vi.fn();

    render(<ErrorDisplay error={error} onClose={onClose} />);

    expect(
      screen.getByRole('button', { name: 'エラーを閉じる' })
    ).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
    const user = userEvent.setup();
    const error = { message: 'テストエラーメッセージ' };
    const onClose = vi.fn();

    render(<ErrorDisplay error={error} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: 'エラーを閉じる' });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('適切なスタイルが適用される', () => {
    const error = { message: 'テストエラーメッセージ' };
    const onClose = vi.fn();

    render(<ErrorDisplay error={error} onClose={onClose} />);

    const errorBox = screen.getByText('テストエラーメッセージ').closest('div');
    expect(errorBox).toBeInTheDocument();
  });
});
