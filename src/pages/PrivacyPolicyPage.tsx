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

import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useNavigate, Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { APP_CONFIG } from '../constants/app';

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

  const handleBack = () => {
    void navigate(-1);
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
            <Text as="ul" lineHeight={1.7} ml={4}>
              <Text as="li">• 訪問したページと滞在時間</Text>
              <Text as="li">• 使用されたブラウザとデバイスの種類</Text>
              <Text as="li">• 地域情報（都道府県レベル）</Text>
              <Text as="li">• ボタンクリックなどの操作イベント</Text>
            </Text>
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
            <Text as="ul" lineHeight={1.7} ml={4}>
              <Text as="li">• マウスの動きとクリック位置</Text>
              <Text as="li">• スクロール位置と速度</Text>
              <Text as="li">• ページ内での操作の流れ</Text>
              <Text as="li">• エラーやフリーズの発生状況</Text>
            </Text>
            <Text lineHeight={1.7} mt={3}>
              ※フォームに入力されたテキストやパスワードなどの機密情報は記録されません。
            </Text>
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
              ユーザーの権利と選択
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              分析ツールの使用はプライバシー設定ページで個別に有効・無効を選択できます。
              いつでも設定を変更することが可能で、変更は即座に反映されます。
            </Text>
            <Box textAlign="center">
              <Link to="/privacy-settings">
                <Button colorScheme="blue" size="md">
                  プライバシー設定を変更する
                </Button>
              </Link>
            </Box>
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
              最終更新日: 2024年12月18日
            </Text>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};
