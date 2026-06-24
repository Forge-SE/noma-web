import { gql } from '@apollo/client';

export const GET_WALLETS = gql`
  query GetWallets($organizationId: ID!) {
    wallets(organizationId: $organizationId) {
      id
      name
      type
      status
      balance
      departmentId
      createdAt
    }
  }
`;

export const GET_WALLET_DETAIL = gql`
  query GetWalletDetail($id: ID!) {
    wallet(id: $id) {
      id
      organizationId
      departmentId
      name
      type
      status
      balance
      createdAt
    }
  }
`;

export const GET_LEDGER_ENTRIES = gql`
  query GetLedgerEntries($walletId: ID!) {
    ledgerEntries(walletId: $walletId) {
      id
      walletId
      entryType
      amount
      direction
      referenceId
      referenceType
      description
      createdAt
    }
  }
`;

export const UPDATE_WALLET_STATUS_MUTATION = gql`
  mutation UpdateWalletStatus($id: ID!, $status: WalletStatus!) {
    updateWalletStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CREATE_WALLET_MUTATION = gql`
  mutation CreateWallet($input: CreateWalletInput!) {
    createWallet(input: $input) {
      id
      name
      type
      status
    }
  }
`;

export const CREATE_LEDGER_ENTRY_MUTATION = gql`
  mutation CreateLedgerEntry($input: CreateLedgerEntryInput!) {
    createLedgerEntry(input: $input) {
      id
      walletId
      entryType
      amount
      direction
      description
      createdAt
    }
  }
`;
