import { onError } from '@apollo/client/link/error';

export const APOLLO_ERROR_EVENT = 'apollo:error';
export const APOLLO_UNAUTHORIZED_EVENT = 'apollo:unauthorized';

/**
 * Operations that are allowed to fail with an auth error without forcing a
 * full session reset — the auth provider already handles those flows
 * (bootstrap `me`, token refresh, login, and explicit logout).
 */
const SESSION_RESET_EXEMPT_OPERATIONS = new Set([
  'Login',
  'RefreshToken',
  'Me',
  'Logout',
  'LogoutAll',
]);

export interface ApolloErrorDetail {
  message: string;
}

export function friendlyGraphQlError(raw: string | undefined): string {
  const msg = raw || '';
  if (/Cannot query field/.test(msg)) {
    return 'This feature is not available on the server yet. Please try again later.';
  }
  if (/not authenticated|unauthori[zs]ed|authentication required/i.test(msg)) {
    return 'Your session has expired. Please sign in again.';
  }
  if (/failed to fetch|network error|fetch failed|ECONNREFUSED/i.test(msg)) {
    return 'We couldn’t reach the server. Check your connection and try again.';
  }
  if (/rate limit|too many requests/i.test(msg)) {
    return 'You’re doing that too often. Please wait a moment and try again.';
  }
  return msg || 'Something went wrong. Please try again.';
}

interface ErrorPayload {
  graphQLErrors?: readonly { message?: string; extensions?: { code?: string } }[] | null;
  networkError?: { message?: string; statusCode?: number } | null;
  operation?: { operationName: string | null };
}

function isAuthenticationError(opts: ErrorPayload): boolean {
  const { graphQLErrors, networkError } = opts;
  if (graphQLErrors?.some((e) => e?.extensions?.code === 'UNAUTHORIZED')) return true;
  if (graphQLErrors?.some((e) => /not authenticated|unauthori[zs]ed|authentication required/i.test(e?.message ?? ''))) return true;
  if (networkError?.statusCode === 401) return true;
  return false;
}

export const apolloErrorLink = onError((opts) => {
  const { graphQLErrors, networkError, operation } = opts as ErrorPayload;
  const firstError = graphQLErrors?.[0];
  const raw = firstError?.message || networkError?.message;
  const detail: ApolloErrorDetail = { message: friendlyGraphQlError(raw) };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<ApolloErrorDetail>(APOLLO_ERROR_EVENT, { detail }));
  }

  const opName = operation?.operationName ?? null;
  if (opName && SESSION_RESET_EXEMPT_OPERATIONS.has(opName)) return;

  if (isAuthenticationError(opts as unknown as ErrorPayload) && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(APOLLO_UNAUTHORIZED_EVENT));
  }
});