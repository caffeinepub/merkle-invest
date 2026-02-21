# Specification

## Summary
**Goal:** Extend the investment creation workflow with e-projects deposits for admins and enhance transaction verification with multiple payment modes and transaction ID fields.

**Planned changes:**
- Add "Default Deposits on e-Projects" dropdown with 38 secoinfi-apps options (ADMIN only) to InvestmentForm
- Store selected e-project in Investment record with optional eProject field
- Add "Mode" dropdown to TransactionForm with options: GPay, Crypto, CBDC, Wallets
- Add two transaction ID fields: required numeric "Txn ID" and optional "Txn ID (Text)"
- Update Transaction type to include mode, txnIdNat, and txnIdText fields
- Display prominent payment verification notice with UPI account (secoin@uboi), WhatsApp link, and Ethereum address in TransactionForm
- Add confirmation dialog in TransactionForm to review all details before submission
- Update TransactionList and TransactionsList to display new transaction fields (mode and both transaction IDs)

**User-visible outcome:** Admins can assign e-projects to investments during creation. All users must specify payment mode and transaction IDs when creating transactions, with clear instructions for verifying deposits via UPI or crypto, and can review all details before final submission. Transaction lists display the new payment mode and transaction ID information.
