import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

module {
  type Prediction = {
    id : Nat;
    homeTeam : Text;
    awayTeam : Text;
    matchDate : Text;
    league : Text;
    prediction : Text;
    odds : Float;
    confidence : Nat;
    analysis : Text;
  };

  type OldActor = {
    predictions : Map.Map<Nat, Prediction>;
    nextId : Nat;
  };

  type NewActor = {
    predictions : Map.Map<Nat, Prediction>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      predictions = old.predictions;
      nextId = old.nextId;
    };
  };
};
