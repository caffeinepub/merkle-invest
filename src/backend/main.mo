import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Random "mo:core/Random";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Specify the data migration function in with-clause

actor {
  // Initialize the user system state and include authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  public type Investment = {
    id : Text;
    name : Text;
    description : Text;
    investor : Principal;
    created_at : Int;
    eProject : ?Text;
    mode : Text;
    txnIdNat : Nat;
    txnIdText : ?Text;
  };

  public type TransactionType = {
    #recharge;
    #invest;
    #returnFunds;
    #withdraw;
    #payout;
    #instantBuy;
    #instantBuyReturn;
    #arbitration;
  };

  public type Transaction = {
    id : Text;
    investor_id : Principal;
    investment_id : Text;
    amount : Nat;
    transaction_type : TransactionType;
    timestamp : Int;
    txn_hash : Text;
    nonce : Text;
    session_seq : Nat;
    mode : Text;
    txnIdNat : Nat;
    txnIdText : ?Text;
  };

  public type SessionState = {
    user_id : Principal;
    session_id : Text;
    finalRootHash : Text;
    timestamp : Int;
  };

  public type ResourcesPageContent = {
    content : Text;
  };

  public type Resource = {
    id : Nat;
    title : Text;
    content : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let investments = Map.empty<Text, Investment>();
  let transactions = Map.empty<Text, Transaction>();
  let investorSessionCounts = Map.empty<Principal, Nat>();
  let sessionBuffers = Map.empty<Principal, [Text]>();
  let sessionStates = Map.empty<Text, SessionState>();
  let sessionIdToNonce = Map.empty<Text, Text>();
  let latestSessionHashStates = Map.empty<Principal, SessionState>();

  let resources = Map.fromIter<Nat, Resource>(
    [
      (
        1370,
        {
          id = 1370;
          title = "Highlights best functionalities for resilient, democratic, scalable, sustainable, and futuristic website data";
          content = "Here we will create a list of all our functionalities that can be operated by non-admin after onboarding. Note, that the resources are already distinguished by principal. There is no need to be worried that different users would have different user profiles for example, they can only mess with their own profile. Resources that are limited to one company."
        },
      ),
    ].values()
  );

  let resourcesPageContent : ResourcesPageContent = {
    content = (
      "# Resources\n\nThis page contains various resources and documentation for using the Digital Money Secure Transaction System.\n\n## Table of Contents\n\n- [Project Overview](#project-overview)\n- [Authentication & Authorization](#authentication-authorization)\n- [Investments](#investments)\n- [Transactions](#transactions)\n- [Crypto Wallet Integration (Qenta)](#crypto-wallet-integration-qenta)\n- [Backend Services](#backend-services)\n- [Frontend Services](#frontend-services)\n- [Security](#security)\n- [Error Handling](#error-handling)\n- [FAQs](#faqs)\n- [Support](#support)\n\n## Project Overview\n\nThis system is designed to provide a secure environment for managing digital money transactions, investments, and crypto wallet integration using Qenta services.\n\n### Key Features\n\n- Secure authentication and role-based access control\n- Investment management\n- Transaction processing\n- Session management for enhanced security\n- Integration with Qenta crypto wallets\n\n---\n\n## Authentication & Authorization\n\n### User Roles\n\n- `Admin`: Full access to all system features and data\n- `User`: Can create/view investments, initiate transactions\n- `Guest`: Limited access (view-only resources)\n\n### Authentication Flow\n\n1. User logs in with credentials\n2. System verifies credentials and assigns role\n3. Role-based permissions are enforced throughout the system\n\n### Access Control\n\n- Only authenticated users can perform transactions and access investment data\n- Dashboard and resources are publicly accessible\n\n---\n\n## Investments\n\n### Investment Structure\n\n```txt\nInvestment {\n  id: Text\n  name: Text\n  description: Text\n  investor: Principal\n  created_at: Int\n  eProject: ?Text\n  mode: Text\n  txnIdNat: Nat\n  txnIdText: ?Text\n}\n```\n\n### Investment Management\n\n- Users can create new investments\n- Each user can view their own investments\n- Admins can view all investments\n\n---\n\n## Transactions\n\n### Transaction Types\n\n- `Recharge`\n- `Invest`\n- `ReturnFunds`\n- `Withdraw`\n- `Payout`\n- `InstantBuy`\n- `InstantBuyReturn`\n- `Arbitration`\n\n### Transaction Structure\n\n```txt\nTransaction {\n  id: Text\n  investor_id: Principal\n  investment_id: Text\n  amount: Nat\n  transaction_type: TransactionType\n  timestamp: Int\n  txn_hash: Text\n  nonce: Text\n  session_seq: Nat\n  mode: Text\n  txnIdNat: Nat\n  txnIdText: ?Text\n}\n```\n\n### Transaction Flow\n\n1. User initiates a transaction\n2. System verifies user authorization\n3. Transaction is processed and stored\n4. Session data is updated for security\n\n---\n\n## Crypto Wallet Integration (Qenta)\n\n### Features\n\n- Secure crypto wallet creation and management\n- Integration with investment and transaction services\n- Support for multiple cryptocurrencies\n\n### Best Practices\n\n- Always use unique session IDs for wallet operations\n- Store wallet data securely\n- Regularly update wallet software to latest version\n\n---\n\n## Backend Services\n\n### Core Services\n\n- User profile management\n- Investment management\n- Transaction processing\n- Session management\n- Role-based access control\n\n### Administration\n\n- Only admins can perform system-level operations\n- Admin dashboard provides system overview\n\n---\n\n## Frontend Services\n\n### Key Components\n\n- **Dashboard**: Public overview of system stats\n- **Investment List**: Displays user-specific investments\n- **Transaction Form**: Interface for creating transactions\n- **Resources Page**: Detailed documentation (this page)\n\n### Navigation\n\n- All public pages are accessible without login\n- Transaction pages require authentication\n- Role-based navigation options\n\n---\n\n## Security\n\n### Measures Implemented\n\n- Strict authentication and authorization checks\n- Data encryption for sensitive information\n- Regular security audits\n- Secure session management\n\n### Best Practices\n\n- Always log out after completing transactions\n- Use strong, unique passwords\n- Report any suspicious activity immediately\n\n---\n\n## Error Handling\n\n### Common Errors\n\n- **Unauthorized Access**: Attempting actions without proper authorization\n- **Session Expiry**: Sessions are invalidated after a certain period\n- **Invalid Inputs**: System validates all user inputs\n\n### Error Messages\n\n- Clear, user-friendly error messages are provided\n- System logs errors for admin review\n\n---\n\n## FAQs\n\n### How do I create an account?\n\n- Use the registration form on the homepage. Your account will be activated after admin verification.\n- Most things are currently handled by OJS and Qenta. Customer onboarding is currently not in our reach.\n\n### What cryptocurrencies are supported?\n\n- Please refer to the Qenta app.\n\n### How can I reset my password?\n\n- As of now, password resets are handled offline. Connect with admin using your personal email.\n\n---\n\n## Support\n\nFor additional support, contact our team at [support@digital-money.com](mailto:support@digital-money.com).\n\n---\n\n## System Architecture\n\n### Overview\n\nThe system is built using Motoko and leverages the Internet Computer blockchain for secure storage and processing.\n\n### Key Components\n\n- **Backend (Motoko)**: Handles core business logic, data storage, and transaction processing\n- **Frontend**: Provides user interface and interactions\n\n---\n\n## Data Structures\n\n### User Profiles\n\n```txt\nUserProfile {\n  name: Text\n  email: Text\n  role: Text\n}\n```\n\n### Session States\n\n```txt\nSessionState {\n  user_id: Principal\n  session_id: Text\n  finalRootHash: Text\n  timestamp: Int\n}\n```\n\n---\n\n## API Endpoints\n\n### Investments\n\n- **Create Investment**: `/createInvestment`\n- **Get All Investments**: `/getAllInvestments`\n- **Get User Investments**: `/getInvestmentList`\n- **Get Investment**: `/getInvestment`\n\n### Transactions\n\n- **Create Transaction**: `/createTransaction`\n- **Get User Transactions**: `/getCallerTransactions`\n- **Get Investment Transactions**: `/getInvestmentTransactions`\n- **Get Transaction**: `/getTransaction`\n\n---\n\n## Session Management\n\n### Workflow\n\n1. User initiates a session\n2. System generates and stores session ID and nonce\n3. Transactions are linked to session\n4. Session state is updated with final hash\n\n### Functions\n\n- **Generate Nonce**: Creates unique nonce for session\n- **Update Session Count**: Tracks user sessions\n- **Buffer Management**: Stores recent session data\n\n---\n\n## Security Best Practices\n\n- Use unique session IDs for EVERY transaction\n- Validate all user inputs on both frontend and backend\n- Regularly update system components\n- Monitor system logs for suspicious activity\n\nThis page will be regularly updated with new resources and documentation. Please refer back for the latest information.\n"
    );
  };

  // Public resource - no auth required
  public shared ({ caller }) func getResourcesPageContent() : async ResourcesPageContent {
    resourcesPageContent;
  };

  // User profile functions - require user role
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public resource - no auth required
  public query ({ caller }) func getResource(id : Nat) : async ?Resource {
    resources.get(id);
  };

  // Investment functions
  public shared ({ caller }) func createInvestment(
    id : Text,
    name : Text,
    description : Text,
    eProject : ?Text,
    mode : Text,
    txnIdNat : Nat,
    txnIdText : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create investments");
    };
    let investment : Investment = {
      id;
      name;
      description;
      investor = caller;
      created_at = Time.now();
      eProject;
      mode;
      txnIdNat;
      txnIdText;
    };
    investments.add(id, investment);
  };

  public query ({ caller }) func getAllInvestments() : async [Investment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all investments");
    };
    investments.values().toArray();
  };

  public query ({ caller }) func getInvestmentList(p : Principal) : async [Investment] {
    if (caller != p and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own investments");
    };
    let investmentsList = List.empty<Investment>();
    investments.entries().forEach(
      func(entry) {
        let (k, v) = entry;
        if (v.investor == p) {
          investmentsList.add(v);
        };
      }
    );
    investmentsList.toArray();
  };

  public query ({ caller }) func getInvestment(id : Text) : async ?Investment {
    switch (investments.get(id)) {
      case (?investment) {
        if (investment.investor != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own investments");
        };
        ?investment;
      };
      case (null) { null };
    };
  };

  func generateNonce(timestamp : Int) : async Text {
    let random = Random.crypto();
    let randomNumber = await* random.nat64();
    timestamp.toText() # "_" # randomNumber.toText();
  };

  func updateSessionCount(p : Principal) : Nat {
    switch (investorSessionCounts.get(p)) {
      case (?count) {
        let newCount = count + 1;
        investorSessionCounts.add(p, newCount);
        newCount;
      };
      case (null) {
        investorSessionCounts.add(p, 1);
        1;
      };
    };
  };

  func updateSessionBuffer(investor : Principal, newHash : Text) {
    let newBuffer : [Text] = switch (sessionBuffers.get(investor)) {
      case (?existingBuffer) {
        if (existingBuffer.size() >= 6) {
          let trimmed = Array.tabulate(5, func(i) { existingBuffer[i + 1] });
          trimmed.concat([newHash]);
        } else {
          existingBuffer.concat([newHash]);
        };
      };
      case (null) { [newHash] };
    };
    sessionBuffers.add(investor, newBuffer);
  };

  public query ({ caller }) func getSessionTxnHashes() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view session hashes");
    };
    switch (sessionBuffers.get(caller)) {
      case (?buffer) { buffer };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getSessionIdReturn(_ : ()) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view session IDs");
    };
    let nonce = switch (sessionIdToNonce.get("test")) {
      case (?n) { n };
      case (null) { "" };
    };
    ?nonce;
  };

  public shared ({ caller }) func setSessionIdReturn(id : Text, nonce : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set session IDs");
    };
    sessionIdToNonce.add(id, nonce);
  };

  // Transaction functions
  public shared ({ caller }) func createTransaction(
    id : Text,
    investment_id : Text,
    amount : Nat,
    transaction_type : TransactionType,
    txn_hash : Text,
    sessionId : Text,
    mode : Text,
    txnIdNat : Nat,
    txnIdText : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };
    let timestamp = Time.now();
    var storedNonce = switch (sessionIdToNonce.get(sessionId)) {
      case (?nonce) { nonce };
      case (null) { "" };
    };
    var session_seq = updateSessionCount(caller);
    let transaction : Transaction = {
      id;
      investor_id = caller;
      investment_id;
      amount;
      transaction_type;
      timestamp;
      txn_hash;
      nonce = storedNonce;
      session_seq;
      mode;
      txnIdNat;
      txnIdText;
    };
    transactions.add(id, transaction);
    updateSessionBuffer(caller, txn_hash);
  };

  public query ({ caller }) func getTransaction(id : Text) : async ?Transaction {
    switch (transactions.get(id)) {
      case (?transaction) {
        if (transaction.investor_id != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own transactions");
        };
        ?transaction;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getInvestmentTransactions(investment_id : Text) : async [Transaction] {
    // Verify ownership of investment or admin
    switch (investments.get(investment_id)) {
      case (?investment) {
        if (investment.investor != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view transactions for your own investments");
        };
      };
      case (null) {
        Runtime.trap("Investment not found");
      };
    };
    transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool { transaction.investment_id == investment_id }
    );
  };

  public query ({ caller }) func getCallerTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool { transaction.investor_id == caller }
    );
  };

  public query ({ caller }) func getInvestorTransactions(investor_id : Principal) : async [Transaction] {
    if (caller != investor_id and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };
    transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool { transaction.investor_id == investor_id }
    );
  };

  // Session state functions
  public query ({ caller }) func getSessionState(session_id : Text) : async ?SessionState {
    switch (sessionStates.get(session_id)) {
      case (?sessionState) {
        if (sessionState.user_id != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own session states");
        };
        ?sessionState;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getLatestSessionHashes() : async ?SessionState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view session hashes");
    };
    latestSessionHashStates.get(caller);
  };

  public shared ({ caller }) func updateLatestSessionHashes(sessionState : SessionState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update session hashes");
    };
    if (sessionState.user_id != caller) {
      Runtime.trap("Unauthorized: Can only update your own session state");
    };
    latestSessionHashStates.add(caller, sessionState);
  };

  public query ({ caller }) func getAllSessionStates() : async [SessionState] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all session states");
    };
    sessionStates.values().toArray();
  };
};
