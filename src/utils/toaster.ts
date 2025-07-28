/**
 * トースト通知のユーティリティ
 */

import { createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'top',
  max: 3,
  pauseOnPageIdle: true,
});

export const showToast = {
  success: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: 'success',
      duration: 3000,
    }),

  error: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: 'error',
      duration: 5000,
    }),

  warning: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: 'warning',
      duration: 4000,
    }),

  info: (title: string, description?: string) =>
    toaster.create({
      title,
      description,
      type: 'info',
      duration: 3000,
    }),
};
