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
import Blob "mo:core/Blob";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the user system state and include authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type - using AccessControl.UserRole for consistency
  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  // Investments
  public type Investment = {
    id : Text;
    name : Text;
    description : Text;
    investor : Principal;
    created_at : Int;
    eProject : ?Text;
  };

  // Transaction types
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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let investments = Map.empty<Text, Investment>();
  let transactions = Map.empty<Text, Transaction>();
  let investorSessionCounts = Map.empty<Principal, Nat>();
  let sessionBuffers = Map.empty<Principal, [Text]>();
  let sessionStates = Map.empty<Text, SessionState>();
  let sessionIdToNonce = Map.empty<Text, Text>();
  let latestSessionHashStates = Map.empty<Principal, SessionState>();

  // Profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Investment management
  public shared ({ caller }) func createInvestment(id : Text, name : Text, description : Text, eProject : ?Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create investments");
    };
    let investment : Investment = {
      id;
      name;
      description;
      investor = caller;
      created_at = Time.now();
      eProject;
    };
    investments.add(id, investment);
  };

  public query ({ caller }) func getAllInvestments() : async [Investment] {
    // Only admins can view all investments
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all investments");
    };
    investments.values().toArray();
  };

  public query ({ caller }) func getInvestmentList(p : Principal) : async [Investment] {
    // Only admins can view other users' investments, users can view their own
    if (p != caller and not AccessControl.isAdmin(accessControlState, caller)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view investments");
    };
    switch (investments.get(id)) {
      case (?investment) {
        // Users can only view their own investments unless they are admin
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

  // Process session buffer for txns: add new hash and keep only last 6 (FIFO: oldest first, newest last)
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

  // Read-only endpoint that returns the session buffer for current investor
  public query ({ caller }) func getSessionTxnHashes() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view session transaction hashes");
    };
    switch (sessionBuffers.get(caller)) {
      case (?buffer) { buffer };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getSessionIdReturn(_ : ()) : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create and get session Id");
    };

    let nonce = switch (sessionIdToNonce.get("test")) {
      case (?n) { n };
      case (null) { "" };
    };
    ?nonce;
  };

  public shared ({ caller }) func setSessionIdReturn(id : Text, nonce : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create and get session Id");
    };
    sessionIdToNonce.add(id, nonce);
  };

  // Transaction management
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };
    switch (investments.get(investment_id)) {
      case (null) { Runtime.trap("Investment does not exist") };
      // Only creator of investment can create transactions for it
      case (?investment) {
        if (investment.investor != caller) {
          Runtime.trap("Unauthorized: You do not own this investment");
        };
      };
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
    // Update in-memory session buffer with new txn hash
    updateSessionBuffer(caller, txn_hash);
  };

  public query ({ caller }) func getTransaction(id : Text) : async ?Transaction {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    switch (transactions.get(id)) {
      case (?transaction) {
        // Users can only view their own transactions unless they are admin
        if (transaction.investor_id != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own transactions");
        };
        ?transaction;
      };
      case (null) { null };
    };
  };

  // Get all transaction for a specific investment
  public query ({ caller }) func getInvestmentTransactions(investment_id : Text) : async [Transaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    // Check that caller owns the investment or is admin
    switch (investments.get(investment_id)) {
      case (?investment) {
        if (investment.investor != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view transactions for your own investments");
        };
      };
      case (null) { Runtime.trap("Investment does not exist") };
    };
    transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool { transaction.investment_id == investment_id }
    );
  };

  // Get all transactions for the calling investor
  public query ({ caller }) func getCallerTransactions() : async [Transaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool { transaction.investor_id == caller }
    );
  };

  // Get transactions for specific investor (admin only)
  public query ({ caller }) func getInvestorTransactions(investor_id : Principal) : async [Transaction] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool { transaction.investor_id == investor_id }
    );
  };

  public query ({ caller }) func getSessionState(session_id : Text) : async ?SessionState {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view session state");
    };

    switch (sessionStates.get(session_id)) {
      case (?sessionState) {
        // Users can only view their own session states unless they are admin
        if (sessionState.user_id != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own session states");
        };
        ?sessionState;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getLatestSessionHashes() : async ?SessionState {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view session hashes");
    };
    latestSessionHashStates.get(caller);
  };

  public shared ({ caller }) func updateLatestSessionHashes(sessionState : SessionState) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update session hashes");
    };
    latestSessionHashStates.add(caller, sessionState);
  };

  public query ({ caller }) func getAllSessionStates() : async [SessionState] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all session states");
    };
    sessionStates.values().toArray();
  };
};
