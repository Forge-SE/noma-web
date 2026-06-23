import { gql } from '@apollo/client';

export const GET_BUDGET_QUERY = gql`
  query GetBudget($id: ID!) {
    budget(id: $id) {
      id
      organizationId
      departmentId
      name
      amount
      spent
      remaining
      period
      periodStart
      periodEnd
      createdAt
    }
  }
`;

export const GET_BUDGETS_QUERY = gql`
  query GetBudgets($organizationId: ID!) {
    budgets(organizationId: $organizationId) {
      id
      departmentId
      name
      amount
      spent
      remaining
      period
      periodStart
      periodEnd
      createdAt
    }
  }
`;

export const GET_DEPARTMENT_OPTIONS_QUERY = gql`
  query GetDepartmentOptions($organizationId: ID!) {
    departments(organizationId: $organizationId) {
      id
      name
    }
  }
`;

export const CREATE_BUDGET_MUTATION = gql`
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
      id
      name
      departmentId
      amount
      spent
      remaining
      period
      periodStart
      periodEnd
    }
  }
`;

export const UPDATE_BUDGET_MUTATION = gql`
  mutation UpdateBudget($id: ID!, $input: UpdateBudgetInput!) {
    updateBudget(id: $id, input: $input) {
      id
      name
      departmentId
      amount
      spent
      remaining
      period
      periodStart
      periodEnd
    }
  }
`;

export const DELETE_BUDGET_MUTATION = gql`
  mutation DeleteBudget($id: ID!) {
    deleteBudget(id: $id)
  }
`;
