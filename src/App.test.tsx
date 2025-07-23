import { screen } from '@testing-library/react';
import { renderWithChakra } from './test/testUtils';
import App from './App';

describe('App', () => {
  test('アプリのタイトルが表示される', () => {
    renderWithChakra(<App />);
    expect(screen.getByText('保育園見学質問リスト')).toBeInTheDocument();
  });

  test('メインナビゲーションが表示される', () => {
    renderWithChakra(<App />);
    expect(
      screen.getByRole('navigation', { name: /メインナビゲーション/i })
    ).toBeInTheDocument();
  });

  test('質問リスト一覧ページがデフォルトで表示される', () => {
    renderWithChakra(<App />);
    expect(
      screen.getByRole('heading', { name: /質問リスト一覧/i })
    ).toBeInTheDocument();
  });
});
