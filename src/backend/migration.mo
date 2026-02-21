import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  public type OldInvestment = {
    id : Text;
    name : Text;
    description : Text;
    investor : Principal;
    created_at : Int;
    eProject : ?Text;
  };

  type OldActor = {
    investments : Map.Map<Text, OldInvestment>;
  };

  public type NewInvestment = {
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

  type NewActor = {
    investments : Map.Map<Text, NewInvestment>;
  };

  public func run(old : OldActor) : NewActor {
    let newInvestments = old.investments.map<Text, OldInvestment, NewInvestment>(
      func(_id, oldInvestment) {
        {
          oldInvestment with
          mode = "";
          txnIdNat = 0;
          txnIdText = null;
        };
      }
    );
    { old with investments = newInvestments };
  };
};
