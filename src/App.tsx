import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './components/Router';
import { CookieConsentBanner } from './components/CookieConsentBanner';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <CookieConsentBanner />
    </BrowserRouter>
  );
}

export default App;
