import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { NurseryCreatorPage } from '../pages/NurseryCreatorPage';
import { NurseryDetailPage } from '../pages/NurseryDetailPage';
import { AboutPage } from '../pages/AboutPage';
import { PrivacySettingsPage } from '../pages/PrivacySettingsPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useCreateNurseryFlow } from '../hooks/useCreateNurseryFlow';
import { ROUTES } from '../constants/routes';

export const AppRouter = () => {
  const { isCreating, startCreating, stopCreating } = useCreateNurseryFlow();

  return (
    <Routes>
      <Route
        path={ROUTES.HOME}
        element={
          isCreating ? (
            <NurseryCreatorPage onCancel={stopCreating} />
          ) : (
            <HomePage onCreateNew={startCreating} />
          )
        }
      />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      <Route path={ROUTES.PRIVACY_SETTINGS} element={<PrivacySettingsPage />} />
      <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
      <Route path={ROUTES.NURSERY_DETAIL} element={<NurseryDetailPage />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
};
