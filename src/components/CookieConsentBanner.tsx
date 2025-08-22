/**
 * @description クッキー同意バナーコンポーネント
 * プライバシー設定を管理し、ユーザーの同意状況に基づいてバナーを表示します
 * @example
 * ```tsx
 * // App.tsxなどのルートコンポーネントで使用
 * <CookieConsentBanner />
 * ```
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Container,
  useBreakpointValue,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

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
 * @description クッキー同意バナーコンポーネント
 *
 * AnalyticsProviderと連携し、ユーザーが未同意の場合に
 * 画面下部に固定バナーを表示します。Google Analytics や Microsoft Clarity などの
 * 分析サービスの使用同意を取得し、ユーザーの選択に基づいて適切に処理します。
 *
 * @returns JSX.Element | null バナー表示時はJSX要素、非表示時はnull
 *
 * @example
 * App.tsxなどのルートコンポーネントで使用:
 * <CookieConsentBanner />
 */
export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { hasAnalyticsConsent, setAnalyticsConsent } = useAnalytics();

  // レスポンシブデザインの設定
  const responsiveConfig: ResponsiveConfig =
    useBreakpointValue({
      base: RESPONSIVE_PRESETS.mobile,
      sm: RESPONSIVE_PRESETS.tablet,
      md: RESPONSIVE_PRESETS.desktop,
    }) ?? RESPONSIVE_PRESETS.mobile;

  useEffect(() => {
    // 初回マウント時に同意状態をチェック
    // 同意がない場合にバナーを表示
    setIsVisible(!hasAnalyticsConsent);
  }, [hasAnalyticsConsent]);

  /**
   * @description 「同意する」ボタンクリック時の処理
   */
  const handleAccept = (): void => {
    setAnalyticsConsent(true);
    setIsVisible(false);
  };

  /**
   * @description 「拒否する」ボタンクリック時の処理
   */
  const handleReject = (): void => {
    setAnalyticsConsent(false);
    setIsVisible(false);
  };

  // 非表示状態では要素を完全に削除
  if (!isVisible) {
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
            クッキーの使用について
          </Text>
          <Text
            fontSize={responsiveConfig.fontSize}
            lineHeight="tall"
            textAlign={{ base: 'center', md: 'left' }}
          >
            このサイトではサービス向上のためクッキーを使用しています。詳細については
            <Link asChild color="blue.500" textDecoration="underline" mx={1}>
              <RouterLink to="/privacy-policy">プライバシーポリシー</RouterLink>
            </Link>
            をご確認ください。
            <Link asChild color="blue.500" textDecoration="underline" ml={2}>
              <RouterLink to="/privacy-settings">設定を変更</RouterLink>
            </Link>
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
