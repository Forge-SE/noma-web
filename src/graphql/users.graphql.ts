import { gql } from '@apollo/client';

export const GET_USERS_QUERY = gql`
  query GetUsers($organizationId: ID!) {
    users(organizationId: $organizationId) {
      id
      name
      email
      status
      roles
      department {
        id
        name
      }
      lastActive
      createdAt
      updatedAt
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

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      status
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      status
    }
  }
`;

export const TOGGLE_USER_STATUS_MUTATION = gql`
  mutation ToggleUserStatus($id: ID!, $status: String!) {
    toggleUserStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const ASSIGN_ROLE_MUTATION = gql`
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input)
  }
`;
