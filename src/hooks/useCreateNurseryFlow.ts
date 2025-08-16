import { useState } from 'react';

export const useCreateNurseryFlow = () => {
  const [isCreating, setIsCreating] = useState(false);

  return {
    isCreating,
    startCreating: () => setIsCreating(true),
    stopCreating: () => setIsCreating(false),
  };
};
