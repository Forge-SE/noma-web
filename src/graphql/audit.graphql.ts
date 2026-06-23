import { gql } from '@apollo/client';

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($filter: AuditLogFilterInput) {
    auditLogs(filter: $filter) {
      items {
        id
        actorId
        actor {
          id
          name
        }
        action
        entityType
        entityId
        metadata
        createdAt
      }
      total
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($organizationId: ID!) {
    users(organizationId: $organizationId) {
      id
      name
    }
  }
`;
