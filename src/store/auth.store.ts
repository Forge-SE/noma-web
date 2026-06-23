import { atom } from 'jotai';

// ── Types ───────────────────────────────────────────────────────

export interface SessionInfo {
  userId: string;
  organizationId: string;
  role: string;
  onboarded: boolean;
}

export interface CurrentUser {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CurrentOrganization {
  id: string;
  name: string;
  slug: string;
  status: string;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Atoms ───────────────────────────────────────────────────────

/** The decoded session from the `me` query */
export const sessionAtom = atom<SessionInfo | null>(null);

/** Full user profile from `user(id)` query */
export const currentUserAtom = atom<CurrentUser | null>(null);

/** Full organization details from `organization(id)` query */
export const currentOrganizationAtom = atom<CurrentOrganization | null>(null);

/** Auth loading state — true while bootstrapping session */
export const authLoadingAtom = atom<boolean>(true);

/** Derived: is the user authenticated? */
export const isAuthenticatedAtom = atom<boolean>((get) => get(sessionAtom) !== null);
