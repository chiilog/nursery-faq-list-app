import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './components/Router';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ScrollToTop } from './components/ScrollToTop';
import { AnalyticsProvider } from './providers/AnalyticsProvider';

function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        <ScrollToTop />
        <AppRouter />
        <CookieConsentBanner />
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
