/**
 * 保育園追加ページコンポーネント
 * ヘッダーとレイアウトを含む完全なページコンポーネント
 */

import { IoClose } from 'react-icons/io5';
import { Layout } from '../components/layout/Layout';
import { NurseryCreator } from '../components/features/nursery-creator/NurseryCreator';

interface NurseryCreatorPageProps {
  onCancel: () => void;
}

export const NurseryCreatorPage = ({ onCancel }: NurseryCreatorPageProps) => {
  return (
    <Layout
      headerVariant="with-buttons"
      leftButton={{
        icon: <IoClose />,
        onClick: onCancel,
        variant: 'ghost',
        'aria-label': '閉じる',
      }}
    >
      <NurseryCreator onCancel={onCancel} />
    </Layout>
  );
};
