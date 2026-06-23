import * as React from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useSetAtom } from 'jotai';

import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  ME_QUERY,
  GET_USER_QUERY,
  GET_ORGANIZATION_QUERY,
} from '@/graphql/auth.graphql';
import {
  sessionAtom,
  currentUserAtom,
  currentOrganizationAtom,
  authLoadingAtom,
  type SessionInfo,
} from '@/store/auth.store';

// ── Context ─────────────────────────────────────────────────────

interface AuthContextValue {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isBootstrapping: boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const setSession = useSetAtom(sessionAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setCurrentOrg = useSetAtom(currentOrganizationAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);

  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [refreshMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  // Fetch user profile + org after session is established
  const hydrateProfile = React.useCallback(
    async (session: SessionInfo) => {
      try {
        const [userRes, orgRes] = await Promise.all([
          client.query({ query: GET_USER_QUERY, variables: { id: session.userId }, fetchPolicy: 'network-only' }),
          client.query({ query: GET_ORGANIZATION_QUERY, variables: { id: session.organizationId }, fetchPolicy: 'network-only' }),
        ]);
        setCurrentUser(userRes.data.user);
        setCurrentOrg(orgRes.data.organization);
      } catch {
        // Profile fetch failed — session is still valid
        console.warn('Failed to hydrate user profile or organization');
      }
    },
    [client, setCurrentUser, setCurrentOrg],
  );

  // Bootstrap: check if we have a valid session via cookies
  React.useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        // Try the `me` query — cookie will be sent automatically
        const { data } = await client.query({ query: ME_QUERY, fetchPolicy: 'network-only' });
        if (cancelled) return;
        const session: SessionInfo = data.me;
        setSession(session);
        await hydrateProfile(session);
      } catch {
        // Not authenticated or token expired — try refresh
        try {
          const { data: refreshData } = await refreshMutation({
            variables: { refreshToken: '' }, // server reads from cookie
          });
          if (cancelled) return;
          // After refresh, try `me` again
          const { data } = await client.query({ query: ME_QUERY, fetchPolicy: 'network-only' });
          if (cancelled) return;
          const session: SessionInfo = data.me;
          setSession(session);
          await hydrateProfile(session);
        } catch {
          // Fully unauthenticated
          if (!cancelled) {
            setSession(null);
            setCurrentUser(null);
            setCurrentOrg(null);
          }
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
          setIsBootstrapping(false);
        }
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      });
      const session: SessionInfo = data.login.session;
      setSession(session);
      await hydrateProfile(session);
    },
    [loginMutation, setSession, hydrateProfile],
  );

  const logout = React.useCallback(async () => {
    try {
      await logoutMutation();
    } catch {
      // Proceed even if server logout fails
    }
    setSession(null);
    setCurrentUser(null);
    setCurrentOrg(null);
    await client.clearStore();
  }, [logoutMutation, setSession, setCurrentUser, setCurrentOrg, client]);

  const value = React.useMemo(
    () => ({ login, logout, isBootstrapping }),
    [login, logout, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ────────────────────────────────────────────────────────

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
