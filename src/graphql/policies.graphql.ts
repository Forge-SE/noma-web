import { gql } from '@apollo/client';

export const GET_POLICIES_QUERY = gql`
  query GetPolicies($organizationId: ID!) {
    policies(organizationId: $organizationId) {
      id
      name
      priority
      conditions
      actions
      enabled
      createdAt
    }
  }
`;

export const CREATE_POLICY_MUTATION = gql`
  mutation CreatePolicy($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      id
      name
      priority
      conditions
      actions
      enabled
      createdAt
    }
  }
`;

export const UPDATE_POLICY_MUTATION = gql`
  mutation UpdatePolicy($id: ID!, $input: UpdatePolicyInput!) {
    updatePolicy(id: $id, input: $input) {
      id
      name
      priority
      conditions
      actions
      enabled
      createdAt
    }
  }
`;

export const DELETE_POLICY_MUTATION = gql`
  mutation DeletePolicy($id: ID!) {
    deletePolicy(id: $id)
  }
`;
