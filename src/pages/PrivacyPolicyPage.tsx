/**
 * @description プライバシーポリシーページコンポーネント
 * 個人情報保護方針とデータ取り扱いについて詳細に説明するページ
 * Google Analytics 4とMicrosoft Clarityの使用に関する透明性を提供
 *
 * @features
 * - データ収集に関する包括的な説明
 * - 分析ツールの使用目的の明示
 * - ユーザーの権利と選択肢の説明
 * - プライバシー設定ページへの導線
 * - 他のページと統一されたデザイン
 */

import { Box, Heading, Text, VStack, HStack, Switch } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { APP_CONFIG } from '../constants/app';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { useEffect, useState } from 'react';

interface ToggleDetails {
  readonly checked: boolean;
}

/**
 * @description プライバシーポリシーページコンポーネント
 * ユーザーの個人情報保護とデータ取り扱いについて包括的に説明し、
 * 透明性のあるプライバシー管理を提供します
 *
 * @returns プライバシーポリシーページのJSX要素
 *
 * @example
 * ```tsx
 * // Routerで使用
 * <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
 * ```
 */
export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { consent, setConsent } = useCookieConsent();
  const [lastUpdated, setLastUpdated] = useState<Readonly<Date> | null>(null);

  useEffect(() => {
    // 初回の同意状態の設定時刻を取得（初期化時のみ実行）
    if (consent !== null && lastUpdated === null) {
      setLastUpdated(new Date());
    }
  }, [consent, lastUpdated]);

  const handleBack = (): void => {
    void navigate(-1);
  };

  const handleAnalyticsToggle = (details: ToggleDetails): void => {
    setConsent(details.checked);
    setLastUpdated(new Date());
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
            <Heading as="h1" color={APP_CONFIG.COLORS.PRIMARY}>
              プライバシーポリシー
            </Heading>
          </Box>

          <Box>
            <Heading as="h2" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              個人情報の収集について
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              当アプリケーションでは、サービス向上のため以下の分析ツールを使用し、
              匿名化された使用状況データを収集しています。
              収集されるデータに個人を特定できる情報は含まれません。
            </Text>
            <Text lineHeight={1.7}>
              ユーザーが入力された保育園の情報や質問・回答などのデータは、
              すべてお使いのブラウザ内にのみ保存され、外部に送信されることはありません。
            </Text>
          </Box>

          <Box>
            <Heading as="h2" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              Google Analytics 4について
            </Heading>
            <Text lineHeight={1.7} mb={3}>
              ページビューや機能の使用状況を匿名で収集し、アプリケーションの改善に活用しています。
            </Text>
            <Text lineHeight={1.7} mb={3}>
              <strong>収集される情報：</strong>
            </Text>
            <Box as="ul" listStyleType="disc" lineHeight={1.7} ml={4}>
              <li>訪問したページと滞在時間</li>
              <li>使用されたブラウザとデバイスの種類</li>
              <li>地域情報（都道府県レベル）</li>
              <li>ボタンクリックなどの操作イベント</li>
            </Box>
          </Box>

          <Box>
            <Heading as="h2" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              Microsoft Clarityについて
            </Heading>
            <Text lineHeight={1.7} mb={3}>
              ユーザーの操作パターンとヒートマップを収集し、ユーザビリティの向上に役立てています。
            </Text>
            <Text lineHeight={1.7} mb={3}>
              <strong>収集される情報：</strong>
            </Text>
            <Box as="ul" listStyleType="disc" lineHeight={1.7} ml={4}>
              <li>マウスの動きとクリック位置</li>
              <li>スクロール位置と速度</li>
              <li>ページ内での操作の流れ</li>
              <li>エラーやフリーズの発生状況</li>
            </Box>

            <Text lineHeight={1.7} mt={3}>
              ※フォームに入力されたテキストやパスワードなどの機密情報は記録されません。
            </Text>
          </Box>

          <Box>
            <Heading as="h2" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              分析ツールの利用設定
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              以下のスイッチで分析ツールの利用を制御できます。
              設定変更は即座に反映され、いつでも変更可能です。
            </Text>

            {/* 設定スイッチ */}
            <Box
              p={4}
              borderRadius="md"
              bgColor="blue.50"
              borderWidth={1}
              borderColor="blue.200"
              _dark={{
                bgColor: 'blue.900',
                borderColor: 'blue.700',
              }}
              mb={4}
            >
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    分析ツールの利用設定
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                    mb={3}
                  >
                    Google Analytics 4とMicrosoft
                    Clarityによるデータ収集を許可します
                  </Text>
                  <HStack justify="space-between" align="center">
                    <Switch.Root
                      checked={consent === true}
                      onCheckedChange={handleAnalyticsToggle}
                      colorPalette="blue"
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label fontWeight="medium">
                        分析ツールの利用を許可する
                      </Switch.Label>
                    </Switch.Root>
                  </HStack>
                </Box>

                <Box
                  pt={3}
                  borderTop="1px solid"
                  borderColor="blue.200"
                  _dark={{ borderColor: 'blue.700' }}
                >
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                  >
                    <strong>現在の状態:</strong>{' '}
                    {consent === true
                      ? '有効'
                      : consent === false
                        ? '無効'
                        : '未設定'}
                  </Text>
                  {lastUpdated && (
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                      mt={1}
                    >
                      <strong>最終更新:</strong>{' '}
                      {lastUpdated.toLocaleString('ja-JP')}
                    </Text>
                  )}
                </Box>
              </VStack>
            </Box>
          </Box>

          <Box>
            <Heading as="h2" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              データの保存について
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              保育園の名前、質問、回答などユーザーが入力されたすべてのデータは、
              ブラウザのローカルストレージにのみ保存され、インターネット上のサーバーには送信されません。
            </Text>
            <Text lineHeight={1.7} mb={4}>
              これにより、Wi-Fiがない環境でもアプリをご利用いただけますが、
              ブラウザの履歴やキャッシュを削除すると、保存されたデータも削除されますのでご注意ください。
            </Text>
          </Box>

          <Box>
            <Heading as="h2" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              お問い合わせ
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              プライバシーに関するご質問やご不明な点がございましたら、
              GitHubのIssueページまたは開発者のSNSアカウントまでお気軽にお問い合わせください。
            </Text>
            <Text lineHeight={1.7}>
              ユーザーの皆様のプライバシーを尊重し、透明性のあるサービス運営を心がけています。
            </Text>
          </Box>

          <Box
            textAlign="center"
            borderTop="1px solid"
            borderColor="gray.200"
            pt={4}
          >
            <Text fontSize="sm" color="gray.600">
              最終更新日: 2025年8月22日
            </Text>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};
