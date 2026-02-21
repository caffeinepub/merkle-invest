import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  type OldInvestment = {
    id : Text;
    name : Text;
    description : Text;
    investor : Principal;
    created_at : Int;
  };

  type OldTransaction = {
    id : Text;
    investor_id : Principal;
    investment_id : Text;
    amount : Nat;
    // Transaction type has a unique textual tag for each constructor
    transaction_type : {
      #recharge;
      #invest;
      #returnFunds;
      #withdraw;
      #payout;
      #instantBuy;
      #instantBuyReturn;
      #arbitration;
    };
    timestamp : Int;
    txn_hash : Text;
    nonce : Text;
    session_seq : Nat;
  };

  type SessionState = {
    user_id : Principal;
    session_id : Text;
    finalRootHash : Text;
    timestamp : Int;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    investments : Map.Map<Text, OldInvestment>;
    transactions : Map.Map<Text, OldTransaction>;
    investorSessionCounts : Map.Map<Principal, Nat>;
    sessionBuffers : Map.Map<Principal, [Text]>;
    sessionStates : Map.Map<Text, SessionState>;
    sessionIdToNonce : Map.Map<Text, Text>;
    latestSessionHashStates : Map.Map<Principal, SessionState>;
  };

  type NewInvestment = {
    id : Text;
    name : Text;
    description : Text;
    investor : Principal;
    created_at : Int;
    eProject : ?Text;
  };

  type NewTransaction = {
    id : Text;
    investor_id : Principal;
    investment_id : Text;
    amount : Nat;
    transaction_type : {
      #recharge;
      #invest;
      #returnFunds;
      #withdraw;
      #payout;
      #instantBuy;
      #instantBuyReturn;
      #arbitration;
    };
    timestamp : Int;
    txn_hash : Text;
    nonce : Text;
    session_seq : Nat;
    mode : Text;
    txnIdNat : Nat;
    txnIdText : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    investments : Map.Map<Text, NewInvestment>;
    transactions : Map.Map<Text, NewTransaction>;
    investorSessionCounts : Map.Map<Principal, Nat>;
    sessionBuffers : Map.Map<Principal, [Text]>;
    sessionStates : Map.Map<Text, SessionState>;
    sessionIdToNonce : Map.Map<Text, Text>;
    latestSessionHashStates : Map.Map<Principal, SessionState>;
  };

  public func run(old : OldActor) : NewActor {
    let newInvestments = old.investments.map<Text, OldInvestment, NewInvestment>(
      func(_id, oldInvestment) {
        { oldInvestment with eProject = null };
      }
    );

    let newTransactions = old.transactions.map<Text, OldTransaction, NewTransaction>(
      func(_id, oldTransaction) {
        { oldTransaction with mode = ""; txnIdNat = 0; txnIdText = null };
      }
    );

    { old with investments = newInvestments; transactions = newTransactions };
  };
};
