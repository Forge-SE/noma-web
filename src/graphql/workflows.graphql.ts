import { gql } from '@apollo/client';

export const GET_WORKFLOW_TEMPLATES_QUERY = gql`
  query GetWorkflowTemplates($organizationId: ID!) {
    workflowTemplates(organizationId: $organizationId) {
      id
      organizationId
      name
      createdAt
      steps {
        id
        stepOrder
        assigneeRole
        action
      }
    }
  }
`;

export const GET_WORKFLOW_TEMPLATE_STEPS_QUERY = gql`
  query GetWorkflowTemplateSteps($templateId: ID!) {
    workflowTemplateSteps(templateId: $templateId) {
      id
      stepOrder
      assigneeRole
      action
    }
  }
`;

export const CREATE_WORKFLOW_TEMPLATE_MUTATION = gql`
  mutation CreateWorkflowTemplate($input: CreateWorkflowTemplateInput!) {
    createWorkflowTemplate(input: $input) {
      id
      name
      createdAt
    }
  }
`;

export const UPDATE_WORKFLOW_TEMPLATE_MUTATION = gql`
  mutation UpdateWorkflowTemplate($id: ID!, $input: UpdateWorkflowTemplateInput!) {
    updateWorkflowTemplate(id: $id, input: $input) {
      id
      name
      createdAt
    }
  }
`;

export const DELETE_WORKFLOW_TEMPLATE_MUTATION = gql`
  mutation DeleteWorkflowTemplate($id: ID!) {
    deleteWorkflowTemplate(id: $id)
  }
`;

export const SAVE_WORKFLOW_STEPS_MUTATION = gql`
  mutation SaveWorkflowSteps($templateId: ID!, $steps: [SaveWorkflowStepInput!]!) {
    saveWorkflowSteps(templateId: $templateId, steps: $steps) {
      id
      stepOrder
      assigneeRole
      action
    }
  }
`;
