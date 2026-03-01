import Float "mo:core/Float";
import Iter "mo:core/Iter";
import List "mo:core/List";
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
    category : Text;
  };

  module Prediction {
    public func compare(a : Prediction, b : Prediction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type MatchResult = {
    id : Nat;
    homeTeam : Text;
    awayTeam : Text;
    matchDate : Text;
    league : Text;
    prediction : Text;
    odds : Float;
    confidence : Nat;
    analysis : Text;
    category : Text;
    result : Text;
    archivedAt : Int;
  };

  module MatchResult {
    public func compareByArchivedAt(a : MatchResult, b : MatchResult) : Order.Order {
      if (a.archivedAt > b.archivedAt) { return #less };
      if (a.archivedAt < b.archivedAt) { return #greater };
      #equal;
    };
  };

  var nextId = 1 : Nat;
  var predictions = Map.empty<Nat, Prediction>();
  var matchHistory = Map.empty<Nat, MatchResult>();
  var adminSessions = Map.empty<Text, Int>();

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

  public shared ({ caller }) func addPredictionAsAdmin(token : Text, homeTeam : Text, awayTeam : Text, matchDate : Text, league : Text, predictionType : Text, odds : Float, confidence : Nat, analysis : Text, category : Text) : async ?Nat {
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
      category;
    };
    predictions.add(nextId, newPrediction);
    nextId += 1;
    ?(nextId - 1);
  };

  public shared ({ caller }) func updatePredictionAsAdmin(token : Text, id : Nat, homeTeam : Text, awayTeam : Text, matchDate : Text, league : Text, predictionType : Text, odds : Float, confidence : Nat, analysis : Text, category : Text) : async Bool {
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
          category;
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
    if (predictions.containsKey(id)) {
      predictions.remove(id);
      true;
    } else {
      Runtime.trap("Prediction not found");
    };
  };

  public shared ({ caller }) func archivePrediction(token : Text, predictionId : Nat, result : Text) : async Bool {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Admin access required");
    };
    switch (predictions.get(predictionId)) {
      case (null) { Runtime.trap("Prediction not found") };
      case (?prediction) {
        let archivedMatch : MatchResult = {
          id = prediction.id;
          homeTeam = prediction.homeTeam;
          awayTeam = prediction.awayTeam;
          matchDate = prediction.matchDate;
          league = prediction.league;
          prediction = prediction.prediction;
          odds = prediction.odds;
          confidence = prediction.confidence;
          analysis = prediction.analysis;
          category = prediction.category;
          result;
          archivedAt = Time.now();
        };
        matchHistory.add(predictionId, archivedMatch);
        predictions.remove(predictionId);
        true;
      };
    };
  };

  public query ({ caller }) func getMatchHistory() : async [MatchResult] {
    let historyList = List.empty<MatchResult>();
    for ((_, entry) in matchHistory.entries()) {
      historyList.add(entry);
    };
    let sortedHistoryVar = historyList.toVarArray();
    sortedHistoryVar.sortInPlace(MatchResult.compareByArchivedAt);
    let sortedHistory = sortedHistoryVar.toArray();
    sortedHistory;
  };

  public shared ({ caller }) func deleteHistoryEntry(token : Text, id : Nat) : async Bool {
    if (not adminSessions.containsKey(token)) {
      Runtime.trap("Admin access required");
    };
    if (matchHistory.containsKey(id)) {
      matchHistory.remove(id);
      true;
    } else {
      Runtime.trap("History entry not found");
    };
  };

  public shared ({ caller }) func seedInitialData() : async () {
    if (predictions.size() > 0) {
      Runtime.trap("Data already seeded");
    };
    let initialPrediction : Prediction = {
      id = 1;
      homeTeam = "Ντόρτμουντ";
      awayTeam = "Μπάγερν Μονάχου";
      matchDate = "2026-03-01T19:30";
      league = "Bundesliga";
      prediction = "OVER 3.5";
      odds = 2.05;
      confidence = 75;
      analysis = "Η προϊστορία και η αγωνιστική συμπεριφορά των δύο ομάδων δείχνουν ότι η μπάλα θα καταλήξει πολλές φορές στα δίχτυα. Το Over 3.5, αν και υψηλό όριο, επιβεβαιώνεται συχνά σε αυτά τα ντέρμπι και πληρώνει εξαιρετικά.";
      category = "single";
    };
    predictions.add(initialPrediction.id, initialPrediction);
    nextId := 2;
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
};
