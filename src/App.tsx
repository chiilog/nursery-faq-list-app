import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './components/Router';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRouter />
      <CookieConsentBanner />
    </BrowserRouter>
  );
}

export default App;
