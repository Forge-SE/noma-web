import { gql } from '@apollo/client';

export const GET_SPEND_REQUESTS = gql`
  query GetSpendRequests($userId: ID!) {
    spendRequests(userId: $userId) {
      id
      amount
      currency
      category
      purpose
      status
      submittedAt
      createdAt
      department {
        id
        name
      }
      wallet {
        id
        name
        type
      }
    }
  }
`;

export const GET_ORG_SPEND_REQUESTS = gql`
  query GetOrgSpendRequests($organizationId: ID!) {
    spendRequestsByOrganization(organizationId: $organizationId) {
      id
      amount
      currency
      category
      purpose
      status
      submittedAt
      createdAt
      department {
        id
        name
      }
      wallet {
        id
        name
        type
      }
    }
  }
`;

export const GET_SPEND_REQUEST_DETAIL = gql`
  query GetSpendRequestDetail($id: ID!) {
    spendRequest(id: $id) {
      id
      amount
      currency
      category
      purpose
      status
      submittedAt
      reviewedAt
      createdAt
      requester {
        id
        name
        email
      }
      department {
        id
        name
      }
      wallet {
        id
        name
        type
      }
      workflowInstance {
        id
        status
        currentStep
        pendingApproverId
        escalatedAt
        timePending
        template {
          id
          name
          steps {
            id
            stepOrder
            assigneeRole
            action
          }
        }
        approvals {
          id
          stepId
          approverId
          action
          comment
          createdAt
        }
      }
      budgetImpact {
        totalBudget
        spent
        requestAmount
        currency
      }
      paymentTransaction {
        id
        provider
        status
        providerReference
        failureReason
      }
    }
  }
`;

export const PENDING_APPROVALS = gql`
  query PendingApprovals($approverId: ID!) {
    pendingApprovals(approverId: $approverId) {
      id
      amount
      currency
      category
      purpose
      status
      submittedAt
      createdAt
      requester {
        id
        name
      }
      department {
        id
        name
      }
      workflowInstance {
        id
        status
        currentStep
        template {
          steps {
            stepOrder
            assigneeRole
          }
        }
      }
    }
  }
`;

export const PENDING_APPROVALS_BY_ORG = gql`
  query PendingApprovalsByOrg($organizationId: ID!) {
    pendingApprovalsByOrganization(organizationId: $organizationId) {
      id
      amount
      currency
      category
      purpose
      status
      submittedAt
      createdAt
      requester {
        id
        name
      }
      department {
        id
        name
      }
      workflowInstance {
        id
        status
        currentStep
        template {
          steps {
            stepOrder
            assigneeRole
          }
        }
      }
    }
  }
`;

export const APPROVE_SPEND_REQUEST = gql`
  mutation ApproveSpendRequest($instanceId: ID!, $comment: String) {
    processWorkflowApproval(instanceId: $instanceId, action: APPROVED, comment: $comment)
  }
`;

export const REJECT_SPEND_REQUEST = gql`
  mutation RejectSpendRequest($instanceId: ID!, $comment: String!) {
    processWorkflowApproval(instanceId: $instanceId, action: REJECTED, comment: $comment)
  }
`;

export const ESCALATE_WORKFLOW_INSTANCE = gql`
  mutation EscalateWorkflowInstance($instanceId: ID!, $newApproverId: ID!) {
    escalateWorkflowInstance(instanceId: $instanceId, newApproverId: $newApproverId) {
      id
      pendingApproverId
      escalatedAt
    }
  }
`;

export const RETRY_DISBURSEMENT = gql`
  mutation RetryDisbursement($input: RetryDisbursementInput!) {
    retryDisbursement(input: $input) {
      id
      status
      providerReference
      failureReason
    }
  }
`;
