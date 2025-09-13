/**
 * InsightsSection コンポーネントのテスト
 * 気づきタグの追加・表示・削除機能の包括的なテストスイート
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { InsightsSection } from './InsightsSection';
import { renderWithProviders } from '../../../test/test-utils';

describe('InsightsSection', () => {
  const mockOnInsightsChange = vi.fn();

  beforeEach(() => {
    mockOnInsightsChange.mockClear();
  });

  describe('基本表示', () => {
    test('セクション見出しが「気づいたこと」で表示される', () => {
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const heading = screen.getByRole('heading', { name: '気づいたこと' });
      expect(heading).toBeInTheDocument();
    });

    test('タグ入力フィールドが表示される', () => {
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      expect(input).toBeInTheDocument();
    });

    test('追加ボタンが表示される', () => {
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const addButton = screen.getByRole('button', { name: '追加' });
      expect(addButton).toBeInTheDocument();
    });

    test('プレースホルダーテキストが正しく表示される', () => {
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByPlaceholderText('見学中に気づいたことを入力');
      expect(input).toBeInTheDocument();
    });
  });

  describe('既存タグの表示', () => {
    test('初期のinsightsが正しく表示される', () => {
      const insights = ['広い遊び場', '先生が親切', '給食が美味しそう'];
      renderWithProviders(
        <InsightsSection
          insights={insights}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      insights.forEach((insight) => {
        expect(screen.getByText(insight)).toBeInTheDocument();
      });
    });

    test('各タグに削除ボタンが表示される', () => {
      const insights = ['広い遊び場', '先生が親切'];
      renderWithProviders(
        <InsightsSection
          insights={insights}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
      expect(deleteButtons).toHaveLength(2);
    });

    test('タグが横並びで表示される', () => {
      const insights = ['広い遊び場', '先生が親切', '給食が美味しそう'];
      renderWithProviders(
        <InsightsSection
          insights={insights}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      // タグコンテナが flex レイアウトで表示されることを確認
      const tagsContainer = screen.getByRole('list');
      expect(tagsContainer).toBeInTheDocument();
    });
  });

  describe('タグ追加機能', () => {
    test('入力フィールドに文字を入力できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      const testText = '新しい気づき';

      await user.type(input, testText);

      expect(input).toHaveValue(testText);
    });

    test('追加ボタンをクリックするとonInsightsChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      const addButton = screen.getByRole('button', { name: '追加' });
      const testText = '新しい気づき';

      await user.type(input, testText);
      await user.click(addButton);

      expect(mockOnInsightsChange).toHaveBeenCalledWith([testText]);
    });

    test('Enterキーでタグを追加できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      const testText = '新しい気づき';

      await user.type(input, testText);
      await user.keyboard('{Enter}');

      expect(mockOnInsightsChange).toHaveBeenCalledWith([testText]);
    });

    test('空文字のタグは追加できない', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const addButton = screen.getByRole('button', { name: '追加' });

      await user.click(addButton);

      expect(mockOnInsightsChange).not.toHaveBeenCalled();
    });

    test('空白文字のみのタグは追加できない', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      const addButton = screen.getByRole('button', { name: '追加' });

      await user.type(input, '   ');
      await user.click(addButton);

      expect(mockOnInsightsChange).not.toHaveBeenCalled();
    });

    test('タグ追加後に入力フィールドがクリアされる', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      const addButton = screen.getByRole('button', { name: '追加' });
      const testText = '新しい気づき';

      await user.type(input, testText);
      await user.click(addButton);

      expect(input).toHaveValue('');
    });

    test('既存のタグに新しいタグが追加される', async () => {
      const user = userEvent.setup();
      const existingInsights = ['既存の気づき'];
      renderWithProviders(
        <InsightsSection
          insights={existingInsights}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      const addButton = screen.getByRole('button', { name: '追加' });
      const newInsight = '新しい気づき';

      await user.type(input, newInsight);
      await user.click(addButton);

      expect(mockOnInsightsChange).toHaveBeenCalledWith([
        ...existingInsights,
        newInsight,
      ]);
    });
  });

  describe('タグ削除機能', () => {
    test('削除ボタンをクリックするとタグが削除される', async () => {
      const user = userEvent.setup();
      const insights = ['広い遊び場', '先生が親切', '給食が美味しそう'];
      renderWithProviders(
        <InsightsSection
          insights={insights}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
      await user.click(deleteButtons[1]); // 2番目のタグを削除

      const expectedInsights = ['広い遊び場', '給食が美味しそう'];
      expect(mockOnInsightsChange).toHaveBeenCalledWith(expectedInsights);
    });

    test('最後のタグを削除すると空配列になる', async () => {
      const user = userEvent.setup();
      const insights = ['唯一のタグ'];
      renderWithProviders(
        <InsightsSection
          insights={insights}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /削除/i });
      await user.click(deleteButton);

      expect(mockOnInsightsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('アクセシビリティ', () => {
    test('入力フィールドに適切なaria-labelが設定されている', () => {
      renderWithProviders(
        <InsightsSection
          insights={[]}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      const input = screen.getByLabelText(
        '見学中に気づいたことを入力してください'
      );
      expect(input).toBeInTheDocument();
    });

    test('キーボードナビゲーションが可能', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <InsightsSection
          insights={['テストタグ']}
          onInsightsChange={mockOnInsightsChange}
        />
      );

      // Tab移動でフォーカス可能な要素を順番に確認
      // 入力フィールドにフォーカス（レスポンシブ対応により表示される要素）
      await user.tab();
      const visibleInput = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      expect(visibleInput).toHaveFocus();

      // 削除ボタンにフォーカス（タグが存在する場合に表示）
      await user.tab();
      const deleteButton = screen.getByRole('button', { name: /削除/i });
      expect(deleteButton).toHaveFocus();
    });
  });

  describe('読み取り専用モード', () => {
    test('isReadOnlyがtrueの場合は入力フィールドと追加ボタンが無効化される', () => {
      renderWithProviders(
        <InsightsSection
          insights={['既存タグ']}
          onInsightsChange={mockOnInsightsChange}
          isReadOnly={true}
        />
      );

      const input = screen.getByRole('textbox', {
        name: /見学中に気づいたことを入力してください/i,
      });
      const addButton = screen.getByRole('button', { name: '追加' });

      expect(input).toBeDisabled();
      expect(addButton).toBeDisabled();
    });

    test('isReadOnlyがtrueの場合でもタグは表示される', () => {
      const insights = ['広い遊び場', '先生が親切'];
      renderWithProviders(
        <InsightsSection
          insights={insights}
          onInsightsChange={mockOnInsightsChange}
          isReadOnly={true}
        />
      );

      insights.forEach((insight) => {
        expect(screen.getByText(insight)).toBeInTheDocument();
      });
    });

    test('isReadOnlyがtrueの場合は削除ボタンが表示されない', () => {
      renderWithProviders(
        <InsightsSection
          insights={['テストタグ']}
          onInsightsChange={mockOnInsightsChange}
          isReadOnly={true}
        />
      );

      const deleteButtons = screen.queryAllByRole('button', { name: /削除/i });
      expect(deleteButtons).toHaveLength(0);
    });
  });
});
