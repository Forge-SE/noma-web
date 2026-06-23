import { gql } from '@apollo/client';

// ── Auth Mutations ──────────────────────────────────────────────

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      session {
        userId
        organizationId
        role
        onboarded
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout($deviceId: ID) {
    logout(deviceId: $deviceId)
  }
`;

export const LOGOUT_ALL_MUTATION = gql`
  mutation LogoutAll {
    logoutAll
  }
`;

// ── Auth Queries ────────────────────────────────────────────────

export const ME_QUERY = gql`
  query Me {
    me {
      userId
      organizationId
      role
      onboarded
    }
  }
`;

// ── User Queries ────────────────────────────────────────────────

export const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      organizationId
      email
      name
      status
      roles
      createdAt
      updatedAt
    }
  }
`;

// ── Organization Queries ────────────────────────────────────────

export const GET_ORGANIZATION_QUERY = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
      id
      name
      slug
      status
      onboarded
      createdAt
      updatedAt
    }
  }
`;
