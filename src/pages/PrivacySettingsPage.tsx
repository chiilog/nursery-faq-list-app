/**
 * プライバシー設定ページ
 *
 * ユーザーが分析ツールの使用を個別に制御できるページ
 * Google Analytics 4とMicrosoft Clarityの設定を管理
 */

import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Switch,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { IoArrowBack } from 'react-icons/io5';
import { APP_CONFIG } from '../constants/app';
import { usePrivacySettings } from '../hooks/usePrivacySettings';
import { ROUTES } from '../constants/routes';

/**
 * @description プライバシー設定ページコンポーネント
 * ユーザーがGoogle Analytics 4とMicrosoft Clarityの使用を個別に制御できる設定画面
 *
 * 機能:
 * - Google Analytics 4の有効/無効切り替え
 * - Microsoft Clarityの有効/無効切り替え
 * - 設定変更の即座反映
 * - 最終更新日時の表示
 * - プライバシーポリシーへのリンク
 * - レスポンシブデザイン対応
 * - カラーモード対応
 *
 * @returns プライバシー設定ページのJSX要素
 */
export const PrivacySettingsPage = () => {
  const navigate = useNavigate();
  const { settings, setGoogleAnalyticsConsent, setMicrosoftClarityConsent } =
    usePrivacySettings();

  const handleBack = () => {
    void navigate(-1);
  };

  const handleGoogleAnalyticsToggle = (details: { checked: boolean }) => {
    setGoogleAnalyticsConsent(details.checked);
  };

  const handleMicrosoftClarityToggle = (details: { checked: boolean }) => {
    setMicrosoftClarityConsent(details.checked);
  };

  return (
    <Layout
      headerVariant="with-buttons"
      leftButton={{
        icon: <IoArrowBack />,
        onClick: handleBack,
        variant: 'ghost',
        'aria-label': '戻る',
      }}
      rightButton={{ hidden: true }}
    >
      <Box maxW="container.md" mx="auto" py={4}>
        <VStack gap={6} align="stretch">
          <Box>
            <Heading as="h2" color={APP_CONFIG.COLORS.PRIMARY}>
              プライバシー設定
            </Heading>
          </Box>

          {/* Google Analytics設定 */}
          <Box>
            <Heading as="h3" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              Google Analytics
            </Heading>
            <Text lineHeight={1.7} mb={3}>
              ページビューと機能使用状況を分析します。個人を特定する情報は収集しません。
            </Text>
            <HStack
              justify="space-between"
              alignItems="center"
              p={3}
              borderRadius="md"
              bgColor="gray.50"
              _dark={{ bgColor: 'gray.700' }}
            >
              <Switch.Root
                checked={settings.googleAnalytics}
                onCheckedChange={handleGoogleAnalyticsToggle}
                colorPalette="blue"
              >
                <Switch.HiddenInput />
                <Switch.Control />
                <Switch.Label fontWeight="medium">
                  Google Analyticsを有効にする
                </Switch.Label>
              </Switch.Root>
            </HStack>
          </Box>

          {/* Microsoft Clarity設定 */}
          <Box>
            <Heading as="h3" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              Microsoft Clarity
            </Heading>
            <Text lineHeight={1.7} mb={3}>
              ユーザー操作の録画とヒートマップを収集し、使いやすさの改善に活用します。個人情報やフォーム入力内容は収集されません。
            </Text>
            <HStack
              justify="space-between"
              alignItems="center"
              p={3}
              borderRadius="md"
              bgColor="gray.50"
              _dark={{ bgColor: 'gray.700' }}
            >
              <Switch.Root
                checked={settings.microsoftClarity}
                onCheckedChange={handleMicrosoftClarityToggle}
                colorPalette="blue"
              >
                <Switch.HiddenInput />
                <Switch.Control />
                <Switch.Label fontWeight="medium">
                  Microsoft Clarityを有効にする
                </Switch.Label>
              </Switch.Root>
            </HStack>
          </Box>

          {/* 設定情報 */}
          <Box>
            <Heading as="h3" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              設定情報
            </Heading>
            <Text lineHeight={1.7} mb={2}>
              最終更新:{' '}
              {settings.consentTimestamp?.toLocaleDateString('ja-JP') ||
                '未設定'}
            </Text>
            <Text lineHeight={1.7} mb={2}>
              設定はいつでも変更できます。変更は即座に反映されます。
            </Text>
            <Text lineHeight={1.7}>
              詳細については
              <Link color="blue.500" textDecoration="underline" ml={1} asChild>
                <RouterLink to={ROUTES.PRIVACY_POLICY}>
                  プライバシーポリシー
                </RouterLink>
              </Link>
              をご確認ください。
            </Text>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};
