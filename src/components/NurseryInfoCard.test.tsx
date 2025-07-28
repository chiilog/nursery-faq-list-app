/**
 * NurseryInfoCardコンポーネントのテスト
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders, testUtils } from '../test/test-utils';
import { NurseryInfoCard } from './NurseryInfoCard';

describe('NurseryInfoCard コンポーネント', () => {
  describe('基本表示', () => {
    test('保育園名が表示される', () => {
      const mockQuestion = testUtils.createMockQuestion();

      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={[mockQuestion]}
        />
      );

      expect(screen.getByText('テスト保育園')).toBeInTheDocument();
    });

    test('見学日が表示される', () => {
      const mockQuestion = testUtils.createMockQuestion();

      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={[mockQuestion]}
        />
      );

      expect(screen.getByText('見学日: 2025/2/15')).toBeInTheDocument();
    });

    test('見学日が未設定の場合「未設定」と表示される', () => {
      const mockQuestion = testUtils.createMockQuestion();

      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={null}
          questions={[mockQuestion]}
        />
      );

      expect(screen.getByText('見学日: 未設定')).toBeInTheDocument();
    });

    test('質問進捗が正しく表示される', () => {
      const questions = [
        testUtils.createMockQuestion({ id: 'q1', isAnswered: true }),
        testUtils.createMockQuestion({ id: 'q2', isAnswered: false }),
      ];

      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={questions}
        />
      );

      expect(screen.getByText('質問進捗: 1/2')).toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    test('編集モードで保育園名がInput要素として表示される', () => {
      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={[]}
          isEditing={true}
          editingName="編集中の保育園名"
        />
      );

      const input = screen.getByDisplayValue('編集中の保育園名');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute(
        'placeholder',
        '保育園名を入力してください'
      );
    });

    test('編集モードで見学日がdate input要素として表示される', () => {
      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={[]}
          isEditing={true}
          newVisitDate="2025-02-20"
        />
      );

      const dateInput = screen.getByDisplayValue('2025-02-20');
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('保育園名入力時にonNameChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnNameChange = vi.fn() as (value: string) => void;

      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={[]}
          isEditing={true}
          editingName=""
          onNameChange={mockOnNameChange}
        />
      );

      const input = screen.getByPlaceholderText('保育園名を入力してください');
      await user.type(input, '新');

      // onNameChangeが呼ばれることを確認
      expect(mockOnNameChange).toHaveBeenCalledWith('新');
    });

    test('見学日入力時にonVisitDateChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnVisitDateChange = vi.fn() as (value: string) => void;

      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={[]}
          isEditing={true}
          newVisitDate=""
          onVisitDateChange={mockOnVisitDateChange}
        />
      );

      const dateInput = screen.getByLabelText('見学日を選択してください');
      await user.type(dateInput, '2025-02-20');

      // onVisitDateChangeが呼ばれることを確認
      expect(mockOnVisitDateChange).toHaveBeenCalled();
    });
  });

  describe('バリデーション', () => {
    test('空の保育園名でもエラーが発生しない（表示のみ）', () => {
      renderWithProviders(
        <NurseryInfoCard
          nurseryName=""
          visitDate={new Date('2025-02-15')}
          questions={[]}
          isEditing={true}
          editingName=""
        />
      );

      const input = screen.getByPlaceholderText('保育園名を入力してください');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    test('空の見学日でもエラーが発生しない（表示のみ）', () => {
      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={null}
          questions={[]}
          isEditing={true}
          newVisitDate=""
        />
      );

      const dateInput = screen.getByRole('textbox');
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveValue('');
    });
  });

  describe('進捗計算', () => {
    test('質問がない場合は0/0と表示される', () => {
      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={[]}
        />
      );

      expect(screen.getByText('質問進捗: 0/0')).toBeInTheDocument();
    });

    test('すべて回答済みの場合は満点で表示される', () => {
      const questions = [
        testUtils.createMockQuestion({ id: 'q1', isAnswered: true }),
        testUtils.createMockQuestion({ id: 'q2', isAnswered: true }),
      ];

      renderWithProviders(
        <NurseryInfoCard
          nurseryName="テスト保育園"
          visitDate={new Date('2025-02-15')}
          questions={questions}
        />
      );

      expect(screen.getByText('質問進捗: 2/2')).toBeInTheDocument();
    });
  });
});
