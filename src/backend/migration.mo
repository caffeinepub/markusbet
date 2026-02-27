import Map "mo:core/Map";
import Nat "mo:core/Nat";

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

  type Actor = {
    predictions : Map.Map<Nat, Prediction>;
    nextId : Nat;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
