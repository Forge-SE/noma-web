import { gql } from '@apollo/client';

export const GET_REPORT_SUMMARY = gql`
  query GetReportSummary($organizationId: ID!, $dateFrom: String!, $dateTo: String!, $departmentId: ID, $category: String) {
    reportSummary(organizationId: $organizationId, dateFrom: $dateFrom, dateTo: $dateTo, departmentId: $departmentId, category: $category) {
      totalSpend
      totalDisbursed
      averageRequestSize
      approvalRate
      requestCount
      disbursedCount
    }
  }
`;

export const GET_REPORT_DATA = gql`
  query GetReportData($organizationId: ID!, $dateFrom: String!, $dateTo: String!, $departmentId: ID, $category: String, $limit: Int, $offset: Int) {
    reportData(organizationId: $organizationId, dateFrom: $dateFrom, dateTo: $dateTo, departmentId: $departmentId, category: $category, limit: $limit, offset: $offset) {
      items {
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
        paymentTransaction {
          id
          provider
          status
          providerReference
        }
      }
      total
    }
  }
`;

export const EXPORT_REPORT_MUTATION = gql`
  mutation ExportReport($organizationId: ID!, $dateFrom: String!, $dateTo: String!, $departmentId: ID, $category: String, $format: String!) {
    exportReport(organizationId: $organizationId, dateFrom: $dateFrom, dateTo: $dateTo, departmentId: $departmentId, category: $category, format: $format) {
      jobId
      status
    }
  }
`;
