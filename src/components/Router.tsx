import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { NurseryCreatorPage } from '../pages/NurseryCreatorPage';
import { NurseryDetailPage } from '../pages/NurseryDetailPage';
import { AboutPage } from '../pages/AboutPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useCreateNurseryFlow } from '../hooks/useCreateNurseryFlow';

export const AppRouter = () => {
  const { isCreating, startCreating, stopCreating } = useCreateNurseryFlow();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isCreating ? (
            <NurseryCreatorPage onCancel={stopCreating} />
          ) : (
            <HomePage onCreateNew={startCreating} />
          )
        }
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/nursery/:nurseryId" element={<NurseryDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
