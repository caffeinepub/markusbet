import Float "mo:core/Float";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

actor {
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

  module Prediction {
    public func compare(a : Prediction, b : Prediction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  let predictions = Map.empty<Nat, Prediction>();
  var nextId = 1 : Nat;

  let adminSessions = Map.empty<Text, Int>();
  let adminPassword = "MarkusBet2024!";

  public shared ({ caller }) func adminLogin(password : Text) : async ?Text {
    if (password != adminPassword) { Runtime.trap("Invalid admin password") };
    let sessionId = Time.now().toText();
    adminSessions.add(sessionId, 1);
    ?sessionId;
  };

  public shared ({ caller }) func adminLogout(token : Text) : async Bool {
    switch (adminSessions.get(token)) {
      case (null) { false };
      case (?_) {
        adminSessions.remove(token);
        true;
      };
    };
  };

  public query ({ caller }) func isAdminAuthenticated(token : Text) : async Bool {
    adminSessions.containsKey(token);
  };

  public query ({ caller }) func getPredictions() : async [Prediction] {
    predictions.values().toArray().sort();
  };

  public shared ({ caller }) func addPredictionAsAdmin(token : Text, homeTeam : Text, awayTeam : Text, matchDate : Text, league : Text, predictionType : Text, odds : Float, confidence : Nat, analysis : Text) : async ?Nat {
    if (not adminSessions.containsKey(token)) { Runtime.trap("Admin access required") };
    let newPrediction : Prediction = {
      id = nextId;
      homeTeam;
      awayTeam;
      matchDate;
      league;
      prediction = predictionType;
      odds;
      confidence;
      analysis;
    };
    predictions.add(nextId, newPrediction);
    nextId += 1;
    ?(nextId - 1);
  };

  public shared ({ caller }) func updatePredictionAsAdmin(token : Text, id : Nat, homeTeam : Text, awayTeam : Text, matchDate : Text, league : Text, predictionType : Text, odds : Float, confidence : Nat, analysis : Text) : async Bool {
    if (not adminSessions.containsKey(token)) { Runtime.trap("Admin access required") };
    switch (predictions.get(id)) {
      case (null) { false };
      case (?_) {
        let updatedPrediction : Prediction = {
          id;
          homeTeam;
          awayTeam;
          matchDate;
          league;
          prediction = predictionType;
          odds;
          confidence;
          analysis;
        };
        predictions.add(id, updatedPrediction);
        true;
      };
    };
  };

  public shared ({ caller }) func deletePredictionAsAdmin(token : Text, id : Nat) : async Bool {
    if (not adminSessions.containsKey(token)) { Runtime.trap("Admin access required") };
    switch (predictions.containsKey(id)) {
      case (false) { false };
      case (true) {
        predictions.remove(id);
        true;
      };
    };
  };

  public shared ({ caller }) func seedInitialData() : async () {
    if (predictions.size() > 0) {
      Runtime.trap("Data already seeded");
    };
    let initialPredictions : [Prediction] = [
      {
        id = 1;
        homeTeam = "Manchester City";
        awayTeam = "Liverpool";
        matchDate = "2024-03-15";
        league = "Premier League";
        prediction = "Home Win";
        odds = 1.8;
        confidence = 75;
        analysis = "City are strong at home, having won 12 of their last 13 matches at Etihad. Liverpool missing key defender Van Dijk.";
      },
      {
        id = 2;
        homeTeam = "Real Madrid";
        awayTeam = "Atletico Madrid";
        matchDate = "2024-03-18";
        league = "La Liga";
        prediction = "Draw";
        odds = 3.2;
        confidence = 60;
        analysis = "Madrid derbies are often tight affairs, with 3 of last 5 ending in draws. Both teams have solid defenses.";
      },
      {
        id = 3;
        homeTeam = "Bayern Munich";
        awayTeam = "Borussia Dortmund";
        matchDate = "2024-03-20";
        league = "Bundesliga";
        prediction = "Home Win";
        odds = 1.6;
        confidence = 80;
        analysis = "Bayern unbeaten in last 10 home games against Dortmund. Dortmund struggling with injuries to key midfielders.";
      },
      {
        id = 4;
        homeTeam = "Juventus";
        awayTeam = "Inter Milan";
        matchDate = "2024-03-22";
        league = "Serie A";
        prediction = "Away Win";
        odds = 2.5;
        confidence = 65;
        analysis = "Inter Milan on a 7-game winning streak, Juventus have lost 3 of their last 4. Lukaku and Martinez in great form.";
      },
      {
        id = 5;
        homeTeam = "Paris Saint-Germain";
        awayTeam = "Monaco";
        matchDate = "2024-03-25";
        league = "Ligue 1";
        prediction = "Home Win";
        odds = 1.4;
        confidence = 85;
        analysis = "PSG have scored most goals in Ligue 1 this season. Monaco without top scorer Ben Yedder due to injury.";
      },
    ];
    for (prediction in initialPredictions.values()) {
      predictions.add(prediction.id, prediction);
    };
    nextId := 6;
  };
};
