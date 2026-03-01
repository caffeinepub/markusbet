import Float "mo:core/Float";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Outcall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";



actor {
  stable var nextId : Nat = 1;
  stable var predictions : [(Nat, Prediction)] = [];
  stable var matchHistory : [(Nat, MatchResult)] = [];
  stable var adminSessions : [(Text, Int)] = [];

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

  let adminPassword = "MarkusBet2024!";

  public shared ({ caller }) func adminLogin(password : Text) : async ?Text {
    if (password != adminPassword) { return null };
    let sessionId = Time.now().toText();
    adminSessions := (adminSessions : [(Text, Int)]).concat([(sessionId, 1)]);
    ?sessionId;
  };

  public shared ({ caller }) func adminLogout(token : Text) : async Bool {
    let originalLength = adminSessions.size();
    adminSessions := adminSessions.filter(func(entry) { entry.0 != token });
    if (adminSessions.size() == originalLength) { Runtime.trap("Invalid session token") };
    true;
  };

  public query ({ caller }) func isAdminAuthenticated(token : Text) : async Bool {
    adminSessions.any(func(entry) { entry.0 == token });
  };

  func checkAdminAuth(token : Text) {
    if (not adminSessions.any(func(entry) { entry.0 == token })) {
      Runtime.trap("Admin access required: " # token);
    };
  };

  public query ({ caller }) func getPredictions() : async [Prediction] {
    let iter = predictions.values();
    let values = iter.map(func(entry) { entry.1 });
    let sortedArray = values.toArray().sort();
    sortedArray;
  };

  public shared ({ caller }) func addPredictionAsAdmin(token : Text, homeTeam : Text, awayTeam : Text, matchDate : Text, league : Text, predictionType : Text, odds : Float, confidence : Nat, analysis : Text, category : Text) : async ?Nat {
    checkAdminAuth(token);
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
    predictions := (predictions : [(Nat, Prediction)]).concat([(nextId, newPrediction)]);
    nextId += 1;
    ?(nextId - 1);
  };

  public shared ({ caller }) func updatePredictionAsAdmin(token : Text, id : Nat, homeTeam : Text, awayTeam : Text, matchDate : Text, league : Text, predictionType : Text, odds : Float, confidence : Nat, analysis : Text, category : Text) : async Bool {
    checkAdminAuth(token);
    let index = predictions.findIndex(func(entry) { entry.0 == id });
    switch (index) {
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
        predictions := predictions.map(
          func((predictionId, prediction)) {
            if (predictionId == id) { (id, updatedPrediction) } else { (predictionId, prediction) };
          }
        );
        true;
      };
    };
  };

  public shared ({ caller }) func deletePredictionAsAdmin(token : Text, id : Nat) : async Bool {
    checkAdminAuth(token);
    let originalLength = predictions.size();
    predictions := predictions.filter(func(entry) { entry.0 != id });
    if (predictions.size() == originalLength) { Runtime.trap("Prediction not found") };
    true;
  };

  public shared ({ caller }) func archivePrediction(token : Text, predictionId : Nat, result : Text) : async Bool {
    checkAdminAuth(token);
    switch (predictions.find(func(entry) { entry.0 == predictionId })) {
      case (null) { Runtime.trap("Prediction not found") };
      case (?(_, prediction)) {
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
        matchHistory := (matchHistory : [(Nat, MatchResult)]).concat([(predictionId, archivedMatch)]);
        predictions := predictions.filter(func(entry) { entry.0 != predictionId });
        true;
      };
    };
  };

  public query ({ caller }) func getMatchHistory() : async [MatchResult] {
    let historyList = List.empty<MatchResult>();
    let iter = matchHistory.values();
    iter.forEach(
      func(entry) {
        historyList.add(entry.1);
      }
    );
    let sortedHistoryVar = historyList.toVarArray();
    if (sortedHistoryVar.size() > 1) {
      sortedHistoryVar.sortInPlace(MatchResult.compareByArchivedAt);
    };
    let sortedHistory = sortedHistoryVar.toArray();
    sortedHistory;
  };

  public shared ({ caller }) func deleteHistoryEntry(token : Text, id : Nat) : async Bool {
    checkAdminAuth(token);
    let originalLength = matchHistory.size();
    matchHistory := matchHistory.filter(func(entry) { entry.0 != id });
    if (matchHistory.size() == originalLength) { Runtime.trap("History entry not found") };
    true;
  };

  public shared ({ caller }) func seedInitialData() : async () {
    if (not predictions.isEmpty()) {
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
    predictions := [(initialPrediction.id, initialPrediction)];
    nextId := 2;
  };

  public query ({ caller }) func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public shared ({ caller }) func fetchFootballMatches(token : Text) : async Text {
    checkAdminAuth(token);
    let url = "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED&dateFrom=2025-01-01&dateTo=2026-12-31";
    let headers : [Outcall.Header] = [{ name = "X-Auth-Token"; value = "4324f56c98a948e0a550f0e3fa00acfd" }];
    await Outcall.httpGetRequest(url, headers, transform);
  };

  public shared ({ caller }) func fetchMatchesByCompetition(token : Text, competitionCode : Text) : async Text {
    checkAdminAuth(token);
    let url = "https://api.football-data.org/v4/competitions/" # competitionCode # "/matches?status=SCHEDULED&dateFrom=2025-01-01&dateTo=2026-12-31";
    let headers : [Outcall.Header] = [{ name = "X-Auth-Token"; value = "4324f56c98a948e0a550f0e3fa00acfd" }];
    await Outcall.httpGetRequest(url, headers, transform);
  };
};
