import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './components/Router';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ScrollToTop } from './components/ScrollToTop';
import { AnalyticsProvider } from './providers/AnalyticsProvider';
import { AnalyticsRouter } from './components/AnalyticsRouter';
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
