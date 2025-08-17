/**
 * @description クッキー同意バナーコンポーネント
 * プライバシー設定を管理し、ユーザーの同意状況に基づいてバナーを表示します
 * @example
 * ```tsx
 * // App.tsxなどのルートコンポーネントで使用
 * <CookieConsentBanner />
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Link,
  Container,
  useBreakpointValue,
} from '@chakra-ui/react';
import { PrivacyManager } from '../services/privacyManager';

/**
 * @description PrivacyManagerエラーの型定義
 * エラータイプを明確に分類し、適切なハンドリングを実現
 */
type PrivacyManagerError =
  | { readonly type: 'INITIALIZATION_ERROR'; readonly error: Error }
  | { readonly type: 'STORAGE_ERROR'; readonly error: Error }
  | { readonly type: 'CONSENT_ACTION_ERROR'; readonly error: Error }
  | { readonly type: 'UNKNOWN_ERROR'; readonly error: unknown };

/**
 * @description エラーを型安全に分類するヘルパー関数
 * @param error - 分類するエラー
 * @returns 分類されたエラーオブジェクト
 */
const categorizePrivacyManagerError = (error: unknown): PrivacyManagerError => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('initialization') || message.includes('constructor')) {
      return { type: 'INITIALIZATION_ERROR', error };
    }

    if (
      message.includes('storage') ||
      message.includes('quota') ||
      message.includes('localstorage')
    ) {
      return { type: 'STORAGE_ERROR', error };
    }

    if (message.includes('consent') || message.includes('setting')) {
      return { type: 'CONSENT_ACTION_ERROR', error };
    }

    return { type: 'UNKNOWN_ERROR', error };
  }

  return { type: 'UNKNOWN_ERROR', error };
};

/**
 * @description レスポンシブ設定の型定義
 * ChakraUIコンポーネントで利用される値を制約
 */
interface ResponsiveConfig {
  readonly buttonSize: 'sm' | 'md';
  readonly fontSize: 'xs' | 'sm';
  readonly padding: number;
  readonly spacing: number;
  readonly buttonDirection: 'column' | 'row';
}

/**
 * @description PrivacyManagerのフォールバック用最小インターフェース
 * 型安全性を保ちながらエラー時のフォールバック機能を提供
 */
type FallbackPrivacyManager = Pick<
  PrivacyManager,
  'isConsentValid' | 'setAllConsent' | 'addChangeListener'
>;

/**
 * @description 型安全なフォールバックPrivacyManagerを作成
 * @returns エラー時の安全なフォールバック実装
 */
const createFallbackPrivacyManager = (): FallbackPrivacyManager => ({
  isConsentValid: (): boolean => true, // エラー時は表示しない（安全側）
  setAllConsent: (): void => {
    console.warn('[CookieConsentBanner] Fallback mode: setAllConsent is no-op');
  },
  addChangeListener: (): (() => void) => {
    console.warn(
      '[CookieConsentBanner] Fallback mode: addChangeListener is no-op'
    );
    return (): void => {}; // no-op unsubscribe
  },
});

/**
 * @description レスポンシブ設定のプリセット（DRY原則）
 */
const RESPONSIVE_PRESETS = {
  mobile: {
    buttonSize: 'sm' as const,
    fontSize: 'xs' as const,
    padding: 3,
    spacing: 2,
    buttonDirection: 'column' as const,
  },
  tablet: {
    buttonSize: 'sm' as const,
    fontSize: 'xs' as const,
    padding: 3,
    spacing: 2,
    buttonDirection: 'row' as const,
  },
  desktop: {
    buttonSize: 'md' as const,
    fontSize: 'sm' as const,
    padding: 4,
    spacing: 3,
    buttonDirection: 'row' as const,
  },
} as const;

/**
 * @description CookieConsentBannerコンポーネントのProps
 */
interface CookieConsentBannerProps {
  /**
   * @description プライバシー管理インスタンス（省略時は新規作成）
   */
  privacyManager?: PrivacyManager;
}

/**
 * @description クッキー同意バナーコンポーネント
 *
 * プライバシー管理機能と連携し、ユーザーが未同意または同意期限切れの場合に
 * 画面下部に固定バナーを表示します。Google Analytics や Microsoft Clarity などの
 * 分析サービスの使用同意を取得し、ユーザーの選択に基づいて適切に処理します。
 *
 * @param props - コンポーネントのプロパティ
 * @param props.privacyManager - プライバシー管理インスタンス（テスト時にモック可能）
 * @returns JSX.Element | null バナー表示時はJSX要素、非表示時はnull
 *
 * @example
 * App.tsxなどのルートコンポーネントで使用:
 * <CookieConsentBanner />
 *
 * テストでのモック使用:
 * <CookieConsentBanner privacyManager={mockPrivacyManager} />
 */
export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  privacyManager,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [managerError, setManagerError] = useState<PrivacyManagerError | null>(
    null
  );

  // Props経由で提供されない場合は新規インスタンスを作成（型安全なエラーハンドリング付き）
  const [{ manager, initError }] = useState(() => {
    try {
      return {
        manager: (privacyManager ?? new PrivacyManager()) as
          | PrivacyManager
          | FallbackPrivacyManager,
        initError: null as PrivacyManagerError | null,
      };
    } catch (error) {
      const categorizedError = categorizePrivacyManagerError(error);
      console.error(
        '[CookieConsentBanner] PrivacyManager initialization failed:',
        categorizedError.type === 'UNKNOWN_ERROR'
          ? String(categorizedError.error)
          : categorizedError.error.message
      );
      return {
        manager: createFallbackPrivacyManager(),
        initError: categorizedError,
      };
    }
  });

  // 初期化エラーはエフェクトで反映（レンダーフェーズの更新を避ける）
  useEffect(() => {
    if (initError) setManagerError(initError);
  }, [initError]);

  // レスポンシブデザインの設定（型推論を活用した簡潔化）
  const responsiveConfig: ResponsiveConfig =
    useBreakpointValue({
      base: RESPONSIVE_PRESETS.mobile,
      sm: RESPONSIVE_PRESETS.tablet,
      md: RESPONSIVE_PRESETS.desktop,
    }) ?? RESPONSIVE_PRESETS.mobile;

  useEffect(() => {
    // 初回マウント時に同意状態をチェック
    setIsVisible(!manager.isConsentValid());

    // PrivacyManagerの変更を監視（変更通知機能を使用）
    const unsubscribe = manager.addChangeListener(() => {
      setIsVisible(!manager.isConsentValid());
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列: managerはstateで管理され安定した参照

  /**
   * @description 同意アクション共通処理（DRY原則 + 型安全なエラーハンドリング）
   * @param consent - 同意状態（true: 同意, false: 拒否）
   */
  const handleConsentAction = (consent: boolean): void => {
    try {
      manager.setAllConsent(consent);
    } catch (error) {
      const categorizedError = categorizePrivacyManagerError(error);
      console.warn(
        '[CookieConsentBanner] Consent setting failed:',
        categorizedError.type === 'UNKNOWN_ERROR'
          ? String(categorizedError.error)
          : categorizedError.error.message
      );

      // エラータイプに応じた詳細ログ
      switch (categorizedError.type) {
        case 'STORAGE_ERROR':
          console.warn(
            '[CookieConsentBanner] Storage quota exceeded or access denied'
          );
          break;
        case 'CONSENT_ACTION_ERROR':
          console.warn(
            '[CookieConsentBanner] Invalid consent action parameters'
          );
          break;
        default:
          console.warn(
            '[CookieConsentBanner] Unexpected error during consent action'
          );
      }

      // エラーが発生してもバナーは非表示にする（UXを優先）
    }
    setIsVisible(false);
  };

  /**
   * @description 「同意する」ボタンクリック時の処理
   */
  const handleAccept = (): void => handleConsentAction(true);

  /**
   * @description 「拒否する」ボタンクリック時の処理
   */
  const handleReject = (): void => handleConsentAction(false);

  // エラー状態または非表示状態では要素を完全に削除
  if (managerError || !isVisible) {
    return null;
  }

  // アニメーション効果付きバナーの表示
  return (
    <Box
      role="dialog"
      aria-label="クッキー同意バナー"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
      py={responsiveConfig.padding}
      zIndex={1000}
      transform="translateY(0)"
      transition="transform 0.3s ease-in-out"
      opacity={1}
    >
      <Container maxW="container.lg">
        <VStack gap={responsiveConfig.spacing} align="stretch">
          <Text
            fontSize={responsiveConfig.fontSize}
            color="gray.600"
            fontWeight="semibold"
            textAlign={{ base: 'center', md: 'left' }}
          >
            🍪 クッキーの使用について
          </Text>
          <Text
            fontSize={responsiveConfig.fontSize}
            lineHeight="tall"
            textAlign={{ base: 'center', md: 'left' }}
          >
            このサイトではサービス向上のためクッキーを使用しています。詳細については
            <Link
              href="/privacy-policy"
              color="blue.500"
              textDecoration="underline"
              mx={1}
              _hover={{ color: 'blue.600' }}
              _focus={{
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px',
              }}
            >
              プライバシーポリシー
            </Link>
            をご確認ください。
          </Text>
          <HStack
            gap={responsiveConfig.spacing}
            justify="center"
            direction={responsiveConfig.buttonDirection}
            align="stretch"
          >
            <Button
              colorScheme="blue"
              size={responsiveConfig.buttonSize}
              onClick={handleAccept}
              flex={{ base: 1, sm: 'none' }}
              _focus={{
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px',
              }}
              tabIndex={0}
            >
              同意する
            </Button>
            <Button
              variant="outline"
              colorScheme="gray"
              size={responsiveConfig.buttonSize}
              onClick={handleReject}
              flex={{ base: 1, sm: 'none' }}
              _focus={{
                outline: '2px solid',
                outlineColor: 'gray.500',
                outlineOffset: '2px',
              }}
              tabIndex={0}
            >
              拒否する
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};
