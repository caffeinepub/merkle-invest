# Specification

## Summary
**Goal:** Expand the investment creation form with e-project selection, payment mode, transaction IDs, and payment notice to enable all users to submit investment details.

**Planned changes:**
- Add e-project dropdown (with 38 secoinfi-apps options) after Description field
- Add Mode dropdown (GPay, Crypto, CBDC, Wallets) after e-project field
- Add Txn ID (Nat) required numeric input and Txn ID (String) optional text input after Mode field
- Add payment notice displaying UPI ID (secoin@uboi), WhatsApp link (https://wa.me/919620058644), and Ethereum address (0x4a100E184ac1f17491Fbbcf549CeBfB676694eF7)
- Make InvestmentForm visible to all authenticated users (remove admin-only restrictions)
- Update backend Investment type and createInvestment function to accept and store new fields (eProject, mode, txnIdNat, txnIdString)

**User-visible outcome:** All authenticated users can create investments by selecting an e-project, choosing a payment mode, entering transaction IDs, and viewing payment information directly in the Dashboard.
