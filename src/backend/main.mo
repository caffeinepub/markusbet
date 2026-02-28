import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Outcall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

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

  stable var predictionsStable : [(Nat, Prediction)] = [];
  let predictions = Map.empty<Nat, Prediction>();
  stable var nextId = 1 : Nat;

  let adminSessions = Map.empty<Text, Int>();
  let adminPassword = "MarkusBet2024!";

  public shared ({ caller }) func adminLogin(password : Text) : async ?Text {
    if (password != adminPassword) { return null };

    let sessionId = Time.now().toText();
    adminSessions.add(sessionId, 1);
    ?sessionId;
  };

  public shared ({ caller }) func adminLogout(token : Text) : async Bool {
    switch (adminSessions.get(token)) {
      case (null) { Runtime.trap("Invalid session token") };
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
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Admin access required");
    };
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
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Admin access required");
    };
    switch (predictions.get(id)) {
      case (null) { Runtime.trap("Prediction not found") };
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
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Admin access required");
    };
    if (not predictions.containsKey(id)) {
      Runtime.trap("Prediction not found");
    };
    predictions.remove(id);
    true;
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

  public query ({ caller }) func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public shared ({ caller }) func fetchFootballMatches(token : Text) : async Text {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Admin access required");
    };
    let url = "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED&dateFrom=2025-01-01&dateTo=2026-12-31";
    let headers : [Outcall.Header] = [{ name = "X-Auth-Token"; value = "4324f56c98a948e0a550f0e3fa00acfd" }];
    await Outcall.httpGetRequest(url, headers, transform);
  };

  public shared ({ caller }) func fetchMatchesByCompetition(token : Text, competitionCode : Text) : async Text {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Admin access required");
    };
    let url = "https://api.football-data.org/v4/competitions/" # competitionCode # "/matches?status=SCHEDULED&dateFrom=2025-01-01&dateTo=2026-12-31";
    let headers : [Outcall.Header] = [{ name = "X-Auth-Token"; value = "4324f56c98a948e0a550f0e3fa00acfd" }];
    await Outcall.httpGetRequest(url, headers, transform);
  };

  system func preupgrade() {
    predictionsStable := predictions.entries().toArray();
  };

  system func postupgrade() {
    for ((k, v) in predictionsStable.values()) {
      predictions.add(k, v);
    };
    predictionsStable := [];
  };
};
