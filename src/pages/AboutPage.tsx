import { Box, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { APP_CONFIG } from '../constants/app';
import { ROUTES } from '../constants/routes';

export const AboutPage = () => {
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
            <Heading as="h2" color={APP_CONFIG.COLORS.PRIMARY}>
              保活手帳について
            </Heading>

            <Text lineHeight={1.7}>
              保育園や幼稚園の見学のときに、ササっとスマホで質問管理したい！という自分のニーズから生まれました。
            </Text>
            <Text lineHeight={1.7}>
              全て無料でお使いいただけます。（今後、パートナーとの共有機能などを有料で提供する予定です）
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              個人情報について
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              入力した保育園の名前や質問、回答などの情報は、すべてあなたのブラウザ（Google
              ChromeやSafari）にのみ保存されます。どこにも送信されませんので、安心してお使いください。
            </Text>
            <Text lineHeight={1.7} mb={4}>
              インターネットにつながっていなくても使えます。Wi-Fiがない場所や圏外でも、一度開けばアプリは動作します。
              <br />
              ただし、ブラウザの設定で「閲覧履歴を削除」や「キャッシュを削除」をすると、入力したデータも一緒に消えてしまいますのでご注意ください。
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" color={APP_CONFIG.COLORS.PRIMARY} mb={3}>
              プライバシー設定
            </Heading>
            <Text lineHeight={1.7} mb={4}>
              このアプリでは、サービス向上のためにGoogle Analytics 4とMicrosoft
              Clarityを使用しています。
              これらの分析ツールは、ページの表示回数や機能の使用状況を匿名で収集し、アプリの改善に役立てています。
            </Text>
            <Text lineHeight={1.7} mb={4}>
              個人を特定する情報は一切収集しません。また、入力されたデータ（保育園名、質問、回答など）が分析ツールに送信されることはありません。
            </Text>
            <HStack gap={4} justify="center" wrap="wrap" pt={4}>
              <Button variant="outline" colorScheme="blue" size="md" asChild>
                <RouterLink to={ROUTES.PRIVACY_POLICY}>
                  プライバシーポリシーを見る
                </RouterLink>
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Layout>
  );
};
