import { gql } from '@apollo/client';

export const GET_DEPARTMENTS_QUERY = gql`
  query GetDepartments($organizationId: ID!) {
    departments(organizationId: $organizationId) {
      id
      name
      parentId
      createdAt
    }
  }
`;

export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      id
      name
      parentId
    }
  }
`;

export const UPDATE_DEPARTMENT_MUTATION = gql`
  mutation UpdateDepartment($id: ID!, $name: String, $parentId: ID) {
    updateDepartment(id: $id, name: $name, parentId: $parentId) {
      id
      name
      parentId
    }
  }
`;

export const DELETE_DEPARTMENT_MUTATION = gql`
  mutation DeleteDepartment($id: ID!) {
    deleteDepartment(id: $id)
  }
`;
