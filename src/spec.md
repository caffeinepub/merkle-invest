# Specification

## Summary
**Goal:** Add per-investor session buffer to track the last 6 transaction hashes with a read-only endpoint.

**Planned changes:**
- Add an in-memory session buffer for each logged-in investor that stores exactly the last 6 txn_hash values, scoped per user session
- Implement FIFO ring buffer behavior: when a new transaction is created, append its txn_hash to the investor's buffer, removing the oldest hash if the buffer already contains 6 items
- Add a read-only backend endpoint that returns the current list of up to 6 transaction hashes for the logged-in investor, ordered from oldest to newest
- Display the implementation code for the session buffer and read-only endpoint in backend/main.mo

**User-visible outcome:** Investors can retrieve their last 6 transaction hashes via a read-only API endpoint, with each investor having their own session-isolated buffer that automatically maintains the most recent transactions in FIFO order.
