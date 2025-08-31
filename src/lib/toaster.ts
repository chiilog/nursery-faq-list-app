import { createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'bottom-end',
  max: 3,
  pauseOnPageIdle: true,
  overlap: false,
  offsets: '20px',
});
