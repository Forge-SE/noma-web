import { gql } from '@apollo/client';

export const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
      slug
      status
      onboarded
    }
  }
`;

export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      id
      name
      organizationId
      parentId
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

export const ASSIGN_ROLE_MUTATION = gql`
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input)
  }
`;

export const CREATE_WALLET_MUTATION = gql`
  mutation CreateWallet($input: CreateWalletInput!) {
    createWallet(input: $input) {
      id
      name
      type
      status
    }
  }
`;

export const COMPLETE_ONBOARDING_MUTATION = gql`
  mutation CompleteOnboarding($organizationId: ID!) {
    completeOnboarding(organizationId: $organizationId) {
      id
      onboarded
    }
  }
`;

export const GET_ROLES_QUERY = gql`
  query GetRoles($organizationId: ID!) {
    roles(organizationId: $organizationId) {
      id
      name
      description
    }
  }
`;
