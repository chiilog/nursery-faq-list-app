import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { NotFoundPage } from './NotFoundPage';
import { renderWithProviders } from '../test/testUtils';

describe('NotFoundPage', () => {
  it('404ヘッダーが表示される', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('エラーメッセージが表示される', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();
  });

  it('中央寄せのレイアウトになっている', () => {
    renderWithProviders(<NotFoundPage />);

    const container = screen.getByText('404').closest('div');
    expect(container).toBeInTheDocument();
  });
});
