import * as React from 'react';
import { useToast } from '@/components/ui/toaster';
import { APOLLO_ERROR_EVENT, type ApolloErrorDetail } from '@/lib/apollo-error-link';

const DEDUPE_WINDOW_MS = 8000;

/**
 * Listens for GraphQL errors raised by the global Apollo error link and
 * surfaces them as user-friendly toasts. Mount inside <ToastProvider />.
 */
export function ApolloErrorToaster() {
  const { toast } = useToast();
  const lastShown = React.useRef<{ message: string; at: number } | null>(null);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ApolloErrorDetail>).detail;
      if (!detail?.message) return;

      const now = Date.now();
      const prev = lastShown.current;
      if (prev && prev.message === detail.message && now - prev.at < DEDUPE_WINDOW_MS) {
        return;
      }
      lastShown.current = { message: detail.message, at: now };

      toast({ title: 'Something went wrong', description: detail.message, status: 'error' });
    };

    window.addEventListener(APOLLO_ERROR_EVENT, handler);
    return () => window.removeEventListener(APOLLO_ERROR_EVENT, handler);
  }, [toast]);

  return null;
}