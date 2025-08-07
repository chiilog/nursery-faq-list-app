/**
 * 保育園追加ページコンポーネント
 * ヘッダーとレイアウトを含む完全なページコンポーネント
 */

import { IoClose } from 'react-icons/io5';
import { Layout } from './Layout';
import { NurseryCreator } from './NurseryCreator/NurseryCreator';

interface NurseryCreatorPageProps {
  onCancel: () => void;
}

export const NurseryCreatorPage = ({ onCancel }: NurseryCreatorPageProps) => {
  return (
    <Layout
      headerTitle="新しい保育園を追加"
      headerVariant="with-buttons"
      leftButton={{
        icon: <IoClose />,
        onClick: onCancel,
        variant: 'ghost',
        'aria-label': '閉じる',
      }}
      showDefaultTitle={false}
    >
      <NurseryCreator onCancel={onCancel} />
    </Layout>
  );
};
