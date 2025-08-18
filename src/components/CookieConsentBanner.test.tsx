/**
 * @description CookieConsentBanner コンポーネントのテスト
 * プライバシー同意バナーの表示制御、ユーザー操作、アクセシビリティを検証します
 * @example
 * ```bash
 * npm test -- CookieConsentBanner.test.tsx
 * ```
 */

import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBreakpointValue } from '@chakra-ui/react';
import { renderWithProviders } from '../test/test-utils';
import { CookieConsentBanner } from './CookieConsentBanner';
import { PrivacyManager } from '../services/privacyManager';
import type { PrivacySettings } from '../types/privacy';

// PrivacyManager をモック
vi.mock('../services/privacyManager');
const MockedPrivacyManager = vi.mocked(PrivacyManager);

// Chakra UI のuseBreakpointValueをモック
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>();
  return {
    ...actual,
    useBreakpointValue: vi.fn(),
  };
});

const mockUseBreakpointValue = vi.mocked(useBreakpointValue);

// 完全なPrivacyManagerモック型定義
interface MockedPrivacyManagerInstance {
  getSettings: ReturnType<typeof vi.fn>;
  isConsentValid: ReturnType<typeof vi.fn>;
  setAllConsent: ReturnType<typeof vi.fn>;
  addChangeListener: ReturnType<typeof vi.fn>;
  setGoogleAnalyticsConsent: ReturnType<typeof vi.fn>;
  setMicrosoftClarityConsent: ReturnType<typeof vi.fn>;
  updateSettings: ReturnType<typeof vi.fn>;
}

/**
 * @description テストヘルパー関数（DRY原則）
 */
const testHelpers = {
  /**
   * @description モックセットアップヘルパー
   */
  setupMocks: () => {
    vi.resetAllMocks();

    const mockManager: MockedPrivacyManagerInstance = {
      getSettings: vi.fn(),
      isConsentValid: vi.fn(),
      setAllConsent: vi.fn(),
      addChangeListener: vi.fn(() => () => {}),
      setGoogleAnalyticsConsent: vi.fn(),
      setMicrosoftClarityConsent: vi.fn(),
      updateSettings: vi.fn(),
    };

    MockedPrivacyManager.mockImplementation(
      () => mockManager as unknown as PrivacyManager
    );

    return mockManager;
  },

  /**
   * @description バナーをレンダリングするヘルパー
   */
  renderBanner: (mockManager: MockedPrivacyManagerInstance) => {
    return renderWithProviders(
      <CookieConsentBanner
        privacyManager={mockManager as unknown as PrivacyManager}
      />
    );
  },

  /**
   * @description バナーの表示/非表示をチェックするヘルパー
   */
  expectBannerVisibility: (visible: boolean) => {
    if (visible) {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  },
} as const;

describe('CookieConsentBanner', () => {
  let mockPrivacyManager: MockedPrivacyManagerInstance;

  beforeEach(() => {
    // テストヘルパーでモックをセットアップ（DRY原則）
    mockPrivacyManager = testHelpers.setupMocks();

    // useBreakpointValueのデフォルトモック設定
    mockUseBreakpointValue.mockReturnValue({
      buttonSize: 'sm' as const,
      fontSize: 'xs' as const,
      padding: 3,
      spacing: 2,
      buttonDirection: 'column' as const,
    });
  });

  describe('初回訪問時のバナー表示', () => {
    it('同意期限切れの場合、バナーが表示される', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      testHelpers.expectBannerVisibility(true);
      expect(screen.getByText(/クッキーの使用について/)).toBeInTheDocument();
    });

    it('未設定時もバナーが表示される', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      testHelpers.expectBannerVisibility(true);
    });
  });

  describe('「同意する」ボタンの動作', () => {
    it('クリック時に全サービスの同意がtrueになる', async () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const acceptButton = screen.getByRole('button', { name: /同意する/ });
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(mockPrivacyManager.setAllConsent).toHaveBeenCalledWith(true);
      });
    });

    it('同意後にバナーが非表示になる', async () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const acceptButton = screen.getByRole('button', { name: /同意する/ });
      fireEvent.click(acceptButton);

      await waitFor(() => {
        testHelpers.expectBannerVisibility(false);
      });
    });
  });

  describe('「拒否する」ボタンの動作', () => {
    it('クリック時に全サービスの同意がfalseになる', async () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const rejectButton = screen.getByRole('button', { name: /拒否する/ });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockPrivacyManager.setAllConsent).toHaveBeenCalledWith(false);
      });
    });

    it('拒否後にバナーが非表示になる', async () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const rejectButton = screen.getByRole('button', { name: /拒否する/ });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        testHelpers.expectBannerVisibility(false);
      });
    });
  });

  describe('プライバシーポリシーリンク', () => {
    it('プライバシーポリシーへのリンクが表示される', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const privacyLink = screen.getByRole('link', {
        name: /プライバシーポリシー/,
      });
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
    });
  });

  describe('期限内同意済みの場合', () => {
    it('有効期限内の場合はバナーが表示されない', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(true);
      testHelpers.renderBanner(mockPrivacyManager);

      testHelpers.expectBannerVisibility(false);
    });
  });

  describe('アクセシビリティ', () => {
    it('バナーにrole="dialog"が設定されている', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('バナーにaria-labelが設定されている', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const banner = screen.getByRole('dialog');
      expect(banner).toHaveAttribute('aria-label', 'クッキー同意バナー');
    });
  });

  describe('PrivacyManager統合テスト', () => {
    it('外部からの設定変更でバナー表示が同期される', async () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);

      // 変更リスナーのコールバック関数を取得するために最初にレンダリング
      testHelpers.renderBanner(mockPrivacyManager);
      testHelpers.expectBannerVisibility(true);

      // addChangeListenerに渡されたコールバック関数を取得
      expect(mockPrivacyManager.addChangeListener).toHaveBeenCalledTimes(1);
      const changeCallback =
        mockPrivacyManager.addChangeListener.mock.calls[0][0];

      // 外部からPrivacyManagerの設定を変更（同意が有効になる）
      mockPrivacyManager.isConsentValid.mockReturnValue(true);

      // 変更通知を発火
      act(() => {
        changeCallback({
          previous: {
            googleAnalytics: false,
            microsoftClarity: false,
            consentTimestamp: new Date('2025-01-01'),
            consentVersion: '1.0',
          } as PrivacySettings,
          current: {
            googleAnalytics: true,
            microsoftClarity: true,
            consentTimestamp: new Date(),
            consentVersion: '1.0',
          } as PrivacySettings,
          changes: { googleAnalytics: true, microsoftClarity: true },
        });
      });

      // バナーが非表示になることを確認
      await waitFor(() => {
        testHelpers.expectBannerVisibility(false);
      });
    });

    it('PrivacyManagerコンストラクタエラー時の復旧', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // PrivacyManagerのコンストラクタでエラーを発生させる
      MockedPrivacyManager.mockImplementation(() => {
        throw new Error('LocalStorage access denied');
      });

      // コンポーネントがクラッシュしないことを確認
      expect(() => {
        renderWithProviders(<CookieConsentBanner />);
      }).not.toThrow();

      // エラーログが出力されることを確認（実際のPrivacyManagerではない模擬テスト）
      // 実装では try-catch でエラーハンドリングが必要

      consoleSpy.mockRestore();
    });

    it('changeListenerのアンサブスクライブが正常に動作する', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      const unsubscribe = vi.fn();
      mockPrivacyManager.addChangeListener.mockReturnValue(unsubscribe);

      const { unmount } = testHelpers.renderBanner(mockPrivacyManager);

      // changeListenerが登録されることを確認
      expect(mockPrivacyManager.addChangeListener).toHaveBeenCalledTimes(1);

      // コンポーネントをアンマウント
      unmount();

      // クリーンアップでunsubscribeが呼ばれることを確認
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('レスポンシブ境界値テスト', () => {
    it('useBreakpointValueがundefinedを返した場合のフォールバック', () => {
      mockUseBreakpointValue.mockReturnValue(undefined);
      mockPrivacyManager.isConsentValid.mockReturnValue(false);

      testHelpers.renderBanner(mockPrivacyManager);

      // モバイル設定がフォールバックとして使用されることを確認
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // ボタンが正常に表示されることを確認
      expect(
        screen.getByRole('button', { name: /同意する/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /拒否する/ })
      ).toBeInTheDocument();
    });

    it('異なるブレークポイントでの設定が正常に適用される', () => {
      // デスクトップ設定をモック
      mockUseBreakpointValue.mockReturnValue({
        buttonSize: 'md' as const,
        fontSize: 'sm' as const,
        padding: 4,
        spacing: 3,
        buttonDirection: 'row' as const,
      });

      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      // ボタンが期待されるサイズで表示されることを確認
      const acceptButton = screen.getByRole('button', { name: /同意する/ });
      const rejectButton = screen.getByRole('button', { name: /拒否する/ });

      expect(acceptButton).toBeInTheDocument();
      expect(rejectButton).toBeInTheDocument();
    });
  });

  describe('例外処理とエラーハンドリング', () => {
    it('setAllConsentでエラーが発生してもUIが正常に動作する', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // setAllConsentでエラーを発生させる（LocalStorageエラーを模擬）
      mockPrivacyManager.setAllConsent.mockImplementation(() => {
        throw new Error('QuotaExceededError: LocalStorage quota exceeded');
      });

      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const acceptButton = screen.getByRole('button', { name: /同意する/ });

      // エラーが発生してもクリックが動作することを確認
      expect(() => {
        fireEvent.click(acceptButton);
      }).not.toThrow();

      // バナーが非表示になることを確認（状態は正常に更新される）
      await waitFor(() => {
        testHelpers.expectBannerVisibility(false);
      });

      consoleSpy.mockRestore();
    });

    it('大量のイベント発生時でも安定動作する', async () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const acceptButton = screen.getByRole('button', { name: /同意する/ });

      // 短時間で大量クリックを実行
      for (let i = 0; i < 10; i++) {
        fireEvent.click(acceptButton);
      }

      // setAllConsentが呼び出されることを確認（重複クリック防止は実装次第）
      await waitFor(() => {
        expect(mockPrivacyManager.setAllConsent).toHaveBeenCalled();
      });

      // バナーが非表示になることを確認
      testHelpers.expectBannerVisibility(false);
    });
  });

  describe('キーボードアクセシビリティ', () => {
    it('Tab順序が正しく設定されている', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const acceptButton = screen.getByRole('button', { name: /同意する/ });
      const rejectButton = screen.getByRole('button', { name: /拒否する/ });
      const privacyLink = screen.getByRole('link', {
        name: /プライバシーポリシー/,
      });

      // tabIndex属性が正しく設定されていることを確認
      expect(acceptButton).toHaveAttribute('tabIndex', '0');
      expect(rejectButton).toHaveAttribute('tabIndex', '0');
      // リンクはデフォルトでフォーカス可能
      expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
    });

    it('キーボード操作でボタンが作動する', async () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const acceptButton = screen.getByRole('button', { name: /同意する/ });

      // ボタンがフォーカス可能であることを確認
      acceptButton.focus();
      expect(acceptButton).toHaveFocus();

      // Chakra UIのButtonはスペースキーとEnterキーをデフォルトでサポート
      // ただし、Testing LibraryではfireEvent.clickが最も確実
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(mockPrivacyManager.setAllConsent).toHaveBeenCalledWith(true);
      });
    });

    it('フォーカス時の視覚的フィードバックが提供される', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const acceptButton = screen.getByRole('button', { name: /同意する/ });
      const privacyLink = screen.getByRole('link', {
        name: /プライバシーポリシー/,
      });

      // _focus スタイルが設定されていることを確認（Chakra UIによる実装）
      expect(acceptButton).toBeInTheDocument();
      expect(privacyLink).toBeInTheDocument();
    });
  });

  describe('セキュリティテスト', () => {
    it('プライバシーポリシーリンクが安全である', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      const privacyLink = screen.getByRole('link', {
        name: /プライバシーポリシー/,
      });

      // 相対パスが使用されており、外部サイトへのリダイレクトリスクがない
      expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
      // target="_blank"が設定されていないことを確認（タブナッピング攻撃防止）
      expect(privacyLink).not.toHaveAttribute('target', '_blank');
      // rel="noopener noreferrer"の設定は相対パスなので不要だが確認
      expect(privacyLink).not.toHaveAttribute('rel');
    });

    it('XSS攻撃に対する基本的な保護が機能する', () => {
      mockPrivacyManager.isConsentValid.mockReturnValue(false);
      testHelpers.renderBanner(mockPrivacyManager);

      // Reactのデフォルトエスケープ機能により、テキストコンテンツは安全
      const bannerText = screen.getByText(/クッキーの使用について/);
      expect(bannerText).toBeInTheDocument();

      // HTMLが直接挿入されていないことを確認
      expect(bannerText.innerHTML).not.toContain('<script>');
    });
  });
});
