import { useState, useCallback } from 'react';

export const useCreateNurseryFlow = () => {
  const [isCreating, setIsCreating] = useState(false);

  const startCreating = useCallback(() => setIsCreating(true), []);
  const stopCreating = useCallback(() => setIsCreating(false), []);

  return {
    isCreating,
    startCreating,
    stopCreating,
  };
};
