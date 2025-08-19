/**
 * @description プライバシーポリシーページのテスト
 * プライバシーポリシーページの表示、各セクションの内容、
 * プライバシー設定ページへのリンクなどの機能をテストします
 */

import { screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';

describe('PrivacyPolicyPage', () => {
  test('プライバシーポリシーページが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // メインタイトルが表示される
    expect(
      screen.getByRole('heading', { name: 'プライバシーポリシー' })
    ).toBeInTheDocument();
  });

  test('データ収集に関する説明セクションが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // データ収集セクションのタイトルが表示される
    expect(
      screen.getByRole('heading', { name: '個人情報の収集について' })
    ).toBeInTheDocument();
    // データ収集の説明文が表示される
    expect(
      screen.getByText(/当アプリケーションでは、サービス向上のため/)
    ).toBeInTheDocument();
  });

  test('Google Analytics説明セクションが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // Google Analyticsセクションのタイトルが表示される
    expect(
      screen.getByRole('heading', { name: 'Google Analytics 4について' })
    ).toBeInTheDocument();
    // Google Analyticsの説明文が表示される
    expect(
      screen.getByText(/ページビューや機能の使用状況を匿名で収集/)
    ).toBeInTheDocument();
  });

  test('Microsoft Clarity説明セクションが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // Microsoft Clarityセクションのタイトルが表示される
    expect(
      screen.getByRole('heading', { name: 'Microsoft Clarityについて' })
    ).toBeInTheDocument();
    // Microsoft Clarityの説明文が表示される
    expect(
      screen.getByText(/ユーザーの操作パターンとヒートマップを収集/)
    ).toBeInTheDocument();
  });

  test('データ保存場所説明セクションが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // データ保存セクションのタイトルが表示される
    expect(
      screen.getByRole('heading', { name: 'データの保存について' })
    ).toBeInTheDocument();
    // データ保存の説明文が表示される
    expect(
      screen.getByText(/ブラウザのローカルストレージにのみ保存され/)
    ).toBeInTheDocument();
  });

  test('ユーザーの権利セクションが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // ユーザーの権利セクションのタイトルが表示される
    expect(
      screen.getByRole('heading', { name: 'ユーザーの権利と選択' })
    ).toBeInTheDocument();
    // ユーザーの権利の説明文が表示される
    expect(
      screen.getByText(/分析ツールの使用はプライバシー設定ページ/)
    ).toBeInTheDocument();
  });

  test('お問い合わせセクションが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // お問い合わせセクションのタイトルが表示される
    expect(
      screen.getByRole('heading', { name: 'お問い合わせ' })
    ).toBeInTheDocument();
    // お問い合わせの説明文が表示される
    expect(
      screen.getByText(/プライバシーに関するご質問やご不明な点/)
    ).toBeInTheDocument();
  });

  test('プライバシー設定ページへのリンクが表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // プライバシー設定ページへのリンクが表示される
    expect(
      screen.getByRole('link', { name: 'プライバシー設定を変更する' })
    ).toBeInTheDocument();
  });

  test('プライバシー設定リンクが正しいパスを指している', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    const settingsLink = screen.getByRole('link', {
      name: 'プライバシー設定を変更する',
    });
    expect(settingsLink).toHaveAttribute('href', '/privacy-settings');
  });

  test('最終更新日が表示される', () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // 最終更新日が表示される
    expect(screen.getByText(/最終更新日:/)).toBeInTheDocument();
  });
});
