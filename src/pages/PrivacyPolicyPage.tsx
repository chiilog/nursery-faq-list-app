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

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Switch,
  Link,
} from '@chakra-ui/react';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
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
            <Heading as="h1" color="brand.500">
              プライバシーポリシー
            </Heading>
          </Box>

          <Box>
            <Heading as="h2" size="md" color="brand.500" mb={3}>
              法的根拠と準拠法
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              当アプリケーションは、日本国の個人情報保護法（個人情報の保護に関する法律）に準拠して運営されています。
              <br />
              収集するデータは匿名化されており、個人を特定できる情報は含まれませんが、以下の法的根拠に基づいて処理を行っています。
            </Text>
            <Box as="ul" listStyleType="disc" lineHeight={1.7} ml={4} mb={4}>
              <li>正当な利益：サービスの改善と利用者体験の向上</li>
              <li>同意：分析ツール利用に関するユーザーの明示的な同意</li>
              <li>
                契約の履行：安定したサービス提供のための必要最小限のデータ処理
              </li>
            </Box>
          </Box>

          <Box>
            <Heading as="h2" size="md" color="brand.500" mb={3}>
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
            <Heading as="h2" size="md" color="brand.500" mb={3}>
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
            <Heading as="h2" size="md" color="brand.500" mb={3}>
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
            <Heading as="h2" size="md" color="brand.500" mb={3}>
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
            <Heading as="h2" size="md" color="brand.500" mb={3}>
              国際データ転送について
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              Google Analytics 4およびMicrosoft
              Clarityは米国に本社を置く企業が提供するサービスです。
              <br />
              これらのサービスを通じて収集された匿名化データは、以下の保護措置のもとで処理されます。
            </Text>
            <Box as="ul" listStyleType="disc" lineHeight={1.7} ml={4} mb={4}>
              <li>データは暗号化された通信（HTTPS）で送信されます</li>
              <li>
                各サービスプロバイダーは独自のプライバシーポリシーに基づいてデータを管理します
              </li>
              <li>
                収集されるデータは統計的な分析にのみ使用され、第三者への販売は行われません
              </li>
              <li>EU一般データ保護規則（GDPR）に準拠した処理が行われます</li>
            </Box>
            <Text lineHeight={1.7}>
              詳細については、
              <Link
                variant="underline"
                color="blue.500"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Googleのプライバシーポリシー
              </Link>
              および
              <Link
                variant="underline"
                color="blue.500"
                href="https://privacy.microsoft.com/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoftのプライバシーステートメント
              </Link>
              をご確認ください。
            </Text>
          </Box>

          <Box>
            <Heading as="h2" size="md" color="brand.500" mb={3}>
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
            <Heading as="h2" size="md" color="brand.500" mb={3}>
              データ保持期間
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              当アプリケーションで収集・保存されるデータの保持期間は以下の通りです。
            </Text>
            <Box as="ul" listStyleType="disc" lineHeight={1.7} ml={4} mb={4}>
              <li>
                <strong>ローカルストレージデータ：</strong>
                ユーザーが明示的に削除するまで、またはブラウザのキャッシュをクリアするまで保持されます
              </li>
              <li>
                <strong>Google Analytics 4：</strong>
                <Box as="ul" listStyleType="circle" lineHeight={1.7} ml={4}>
                  <li>標準レポート：長期間のデータ表示が可能</li>
                  <li>
                    詳細分析レポート：デフォルト設定により2ヶ月間のデータのみ利用可能
                  </li>
                </Box>
              </li>
              <li>
                <strong>Microsoft Clarity：</strong>
                <Box as="ul" listStyleType="circle" lineHeight={1.7} ml={4}>
                  <li>セッション記録：30日間保持</li>
                  <li>ヒートマップデータ：13ヶ月間保持</li>
                  <li>お気に入り登録されたセッション：13ヶ月間保持</li>
                </Box>
              </li>
              <li>
                <strong>Cookie（同意情報）：</strong>
                1年間保持され、その後再度同意を求めます
              </li>
            </Box>
          </Box>

          <Box>
            <Heading as="h2" size="md" color="brand.500" mb={3}>
              ユーザーの権利
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              ユーザーは、ご自身のデータに関して以下の権利を有しています。
            </Text>
            <Box as="ul" listStyleType="disc" lineHeight={1.7} ml={4} mb={4}>
              <li>
                <strong>アクセス権：</strong>
                収集されているデータの種類と利用目的について確認する権利
              </li>
              <li>
                <strong>訂正・削除権：</strong>
                ローカルストレージに保存されたデータを編集・削除する権利
                （ブラウザの設定から実行可能）
              </li>
              <li>
                <strong>処理の制限・異議申し立て権：</strong>
                分析ツールの利用を拒否し、データ収集を停止する権利
                （本ページの設定スイッチから変更可能）
              </li>
              <li>
                <strong>データポータビリティ権：</strong>
                ローカルストレージのデータをエクスポートする権利
                （ブラウザの開発者ツールから実行可能）
              </li>
              <li>
                <strong>同意の撤回権：</strong>
                一度与えた分析ツール利用の同意をいつでも撤回する権利
              </li>
            </Box>
            <Text lineHeight={1.7}>
              これらの権利行使に関するご質問は、下記のお問い合わせ先までご連絡ください。
            </Text>
          </Box>

          <Box>
            <Heading as="h2" size="md" color="brand.500" mb={3}>
              お問い合わせ
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              プライバシーに関するご質問やご不明な点がございましたら、
              <Link
                variant="underline"
                color="blue.500"
                href="https://github.com/chiilog/nursery-faq-list-app/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHubのIssueページ
              </Link>
              または
              <Link
                variant="underline"
                color="blue.500"
                href="https://x.com/chiilogweb"
                target="_blank"
                rel="noopener noreferrer"
              >
                開発者のSNSアカウント
              </Link>
              までお気軽にお問い合わせください。
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
              最終更新日: 2025年8月23日
            </Text>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};
