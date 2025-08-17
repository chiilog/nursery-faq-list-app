import { screen, waitFor } from '@testing-library/react';
import { renderWithChakra } from './test/test-utils';
import App from './App';

describe('App', () => {
  test('アプリのタイトルが表示される', () => {
    renderWithChakra(<App />);
    expect(screen.getByText('保活手帳')).toBeInTheDocument();
  });

  test('ヘッダーが表示される', () => {
    renderWithChakra(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('保育園を追加するボタンが表示される', async () => {
    renderWithChakra(<App />);

    // ローディング完了を待つ
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /保育園を追加する/i })
      ).toBeInTheDocument();
    });
  });
});
