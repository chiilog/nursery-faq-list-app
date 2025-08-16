import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { renderWithProviders as render } from '../test/test-utils';

describe('EmptyState', () => {
  it('タイトルが表示される', () => {
    render(<EmptyState title="空のタイトル" />);

    expect(screen.getByText('空のタイトル')).toBeInTheDocument();
  });

  it('説明が表示される', () => {
    render(<EmptyState title="空のタイトル" description="説明メッセージ" />);

    expect(screen.getByText('説明メッセージ')).toBeInTheDocument();
  });

  it('説明が指定されていない場合、説明は表示されない', () => {
    render(<EmptyState title="空のタイトル" />);

    expect(screen.queryByText('説明メッセージ')).not.toBeInTheDocument();
  });

  it('適切なスタイルが適用される', () => {
    render(<EmptyState title="空のタイトル" />);

    const container = screen.getByText('空のタイトル').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('タイトルと説明が同時に表示される', () => {
    render(<EmptyState title="テストタイトル" description="テスト説明" />);

    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    expect(screen.getByText('テスト説明')).toBeInTheDocument();
  });
});
