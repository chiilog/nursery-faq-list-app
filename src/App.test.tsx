import { screen } from '@testing-library/react';
import { renderWithChakra } from './test/testUtils';
import App from './App';

describe('App', () => {
  test('アプリのタイトルが表示される', () => {
    renderWithChakra(<App />);
    expect(screen.getByText('保育園見学質問リスト')).toBeInTheDocument();
  });

  test('ヘッダーが表示される', () => {
    renderWithChakra(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('保育園を追加するボタンが表示される', () => {
    renderWithChakra(<App />);
    expect(
      screen.getByRole('button', { name: /保育園を追加する/i })
    ).toBeInTheDocument();
  });
});
