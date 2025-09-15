import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './components/routing/Router';
import { CookieConsentBanner } from './components/features/cookie-consent/CookieConsentBanner';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { AnalyticsProvider } from './providers/AnalyticsProvider';
import { AnalyticsRouter } from './components/routing/AnalyticsRouter';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        <ScrollToTop />
        <AnalyticsRouter>
          <AppRouter />
        </AnalyticsRouter>
        <CookieConsentBanner />
        <Toaster />
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
