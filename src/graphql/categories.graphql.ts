import { gql } from '@apollo/client';

export const GET_CATEGORIES_QUERY = gql`
  query GetCategories($organizationId: ID!) {
    categories(organizationId: $organizationId) {
      id
      key
      name
      icon
      iconFamily
      color
      enabled
    }
  }
`;