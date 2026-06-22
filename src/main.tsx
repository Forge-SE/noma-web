import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import { initSentry } from '@/lib/sentry';
import { Providers } from '@/providers';
import { router } from '@/router';

import './index.css';

initSentry(router);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
