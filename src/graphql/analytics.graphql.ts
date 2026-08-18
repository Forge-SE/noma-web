import { gql } from '@apollo/client';

export const GET_ANALYTICS = gql`
  query GetAnalytics {
    analytics {
      scope
      organizationId
      asOf
      requests {
        total
        pending
        approved
        rejected
        totalSpend
        approvedSpend
        disbursedSpend
        averageRequestSize
        approvalRate
        byCategory {
          category
          amount
          count
        }
        byDepartment {
          departmentId
          name
          amount
          count
        }
        monthlyTrend {
          month
          amount
          count
          approved
          pending
          rejected
        }
      }
      budgets {
        totalBudget
        totalSpent
        utilization
        budgetCount
        atRiskCount
        exceededCount
        byDepartment {
          departmentId
          name
          total
          spent
          utilization
        }
      }
      wallets {
        totalBalance
        totalWallets
        activeCount
        frozenCount
      }
      payments {
        totalTransactions
        successful
        failed
        pending
        totalDisbursed
        failedAmount
      }
    }
  }
`;