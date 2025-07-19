import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import system from './theme';
import App from './App';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={system}>{ui}</ChakraProvider>);
};

describe('App', () => {
  test('アプリのタイトルが表示される', () => {
    renderWithChakra(<App />);
    expect(screen.getByText('保育園見学質問リストアプリ')).toBeInTheDocument();
  });

  test('カウントボタンが表示される', () => {
    renderWithChakra(<App />);
    expect(
      screen.getByRole('button', { name: /カウント/ })
    ).toBeInTheDocument();
  });
});
