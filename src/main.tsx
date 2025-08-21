import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { registerSW } from 'virtual:pwa-register';
import system from './theme';
import App from './App.tsx';

// PWA Service Worker登録
registerSW({
  immediate: true,
  onNeedRefresh() {
    // 新しいバージョンが利用可能な場合の処理
    // 実際のアプリでは、ユーザーに更新を促すUI表示等を行う
    console.log('New version available, please refresh the page');
  },
  onOfflineReady() {
    // オフライン対応完了時の処理
    console.log('App is ready for offline use');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
createRoot(rootElement).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </StrictMode>
);
