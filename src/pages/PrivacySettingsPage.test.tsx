/**
 * プライバシー設定ページのテスト
 *
 * TDD Red Phase: 失敗するテストを先に作成
 * ユーザーがプライバシー設定を管理できるページのテスト
 */

import { screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { PrivacySettingsPage } from './PrivacySettingsPage';

// usePrivacySettingsフックをモック
let mockSettings = {
  googleAnalytics: false,
  microsoftClarity: false,
  consentTimestamp: new Date('2024-01-01T00:00:00Z'),
  consentVersion: '1.0' as const,
};

const mockUsePrivacySettings = {
  get settings() {
    return mockSettings;
  },
  setGoogleAnalyticsConsent: vi.fn((granted: boolean) => {
    mockSettings = { ...mockSettings, googleAnalytics: granted };
  }),
  setMicrosoftClarityConsent: vi.fn((granted: boolean) => {
    mockSettings = { ...mockSettings, microsoftClarity: granted };
  }),
  setAllConsent: vi.fn(),
  updateSettings: vi.fn(),
  isConsentValid: vi.fn(() => true),
};

vi.mock('../hooks/usePrivacySettings', () => ({
  usePrivacySettings: () => mockUsePrivacySettings,
}));

describe('PrivacySettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // モック状態をリセット
    mockSettings = {
      googleAnalytics: false,
      microsoftClarity: false,
      consentTimestamp: new Date('2024-01-01T00:00:00Z'),
      consentVersion: '1.0' as const,
    };
  });

  test('プライバシー設定ページが表示される', () => {
    renderWithProviders(<PrivacySettingsPage />);

    // ページタイトルが表示される
    expect(
      screen.getByRole('heading', { name: 'プライバシー設定' })
    ).toBeInTheDocument();
  });

  test('Google Analytics設定セクションが表示される', () => {
    renderWithProviders(<PrivacySettingsPage />);

    // Google Analytics設定のラベルが表示される
    expect(
      screen.getByRole('heading', { name: 'Google Analytics' })
    ).toBeInTheDocument();
    // 説明文が表示される（新しい説明文の一部を確認）
    expect(
      screen.getByText(/ページビューと機能使用状況を分析/)
    ).toBeInTheDocument();
    // スイッチが表示される
    const gaSwitch = screen.getByRole('checkbox', {
      name: 'Google Analyticsを有効にする',
    });
    expect(gaSwitch).toBeInTheDocument();
  });

  test('Microsoft Clarity設定セクションが表示される', () => {
    renderWithProviders(<PrivacySettingsPage />);

    // Microsoft Clarity設定のラベルが表示される
    expect(
      screen.getByRole('heading', { name: 'Microsoft Clarity' })
    ).toBeInTheDocument();
    // 説明文が表示される（新しい説明文の一部を確認）
    expect(
      screen.getByText(/ユーザー操作の録画とヒートマップを収集/)
    ).toBeInTheDocument();
    // スイッチが表示される
    const switches = screen.getAllByRole('checkbox');
    expect(switches).toHaveLength(2);
  });

  test('設定情報セクションが表示される', () => {
    renderWithProviders(<PrivacySettingsPage />);

    // 最終更新日時が表示される
    expect(screen.getByText(/最終更新:/)).toBeInTheDocument();
    // 変更可能説明文が表示される
    expect(screen.getByText(/設定はいつでも変更できます/)).toBeInTheDocument();
  });

  test('プライバシーポリシーへのリンクが表示される', () => {
    renderWithProviders(<PrivacySettingsPage />);

    // プライバシーポリシーリンクが表示される
    expect(
      screen.getByRole('link', { name: 'プライバシーポリシー' })
    ).toBeInTheDocument();
  });

  test('Google Analytics設定スイッチをクリックできる', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivacySettingsPage />);

    const gaSwitch = screen.getByRole('checkbox', {
      name: /Google Analyticsを有効にする/,
    });

    // 初期状態は無効（false）
    expect(gaSwitch).not.toBeChecked();

    // スイッチをクリック
    await user.click(gaSwitch);

    // 関数が呼ばれることを確認
    expect(
      mockUsePrivacySettings.setGoogleAnalyticsConsent
    ).toHaveBeenCalledWith(true);
  });

  test('Microsoft Clarity設定スイッチをクリックできる', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivacySettingsPage />);

    const claritySwitch = screen.getByRole('checkbox', {
      name: /Microsoft Clarityを有効にする/,
    });

    // 初期状態は無効（false）
    expect(claritySwitch).not.toBeChecked();

    // スイッチをクリック
    await user.click(claritySwitch);

    // 関数が呼ばれることを確認
    expect(
      mockUsePrivacySettings.setMicrosoftClarityConsent
    ).toHaveBeenCalledWith(true);
  });

  test('Google Analytics設定変更が即座に反映される', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivacySettingsPage />);

    const gaSwitch = screen.getByRole('checkbox', {
      name: /Google Analyticsを有効にする/,
    });

    // スイッチをクリック
    await user.click(gaSwitch);

    // setGoogleAnalyticsConsentが呼ばれることを確認
    expect(
      mockUsePrivacySettings.setGoogleAnalyticsConsent
    ).toHaveBeenCalledWith(true);
  });

  test('Microsoft Clarity設定変更が即座に反映される', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivacySettingsPage />);

    const claritySwitch = screen.getByRole('checkbox', {
      name: /Microsoft Clarityを有効にする/,
    });

    // スイッチをクリック
    await user.click(claritySwitch);

    // setMicrosoftClarityConsentが呼ばれることを確認
    expect(
      mockUsePrivacySettings.setMicrosoftClarityConsent
    ).toHaveBeenCalledWith(true);
  });

  test('プライバシーポリシーリンクが正しいパスを指している', () => {
    renderWithProviders(<PrivacySettingsPage />);

    const privacyLink = screen.getByRole('link', {
      name: 'プライバシーポリシー',
    });
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
  });

  test('最終更新日時が正しく表示される', () => {
    renderWithProviders(<PrivacySettingsPage />);

    // 日付形式をチェック（2024/1/1 形式で表示される想定）
    expect(screen.getByText(/最終更新: 2024\/1\/1/)).toBeInTheDocument();
  });
});
