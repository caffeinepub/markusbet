# MarkusBet

## Current State
- Public page shows football predictions stored in ICP backend (Motoko)
- Admin Panel at `/admin` allows login, add/edit/delete predictions
- Predictions are manually entered by admin
- No connection to external football data sources

## Requested Changes (Diff)

### Add
- Backend: HTTP outcall to football-data.org API to fetch upcoming matches for major leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League)
- Backend: store the API key securely and expose a `fetchUpcomingMatches(token, apiKey)` query that returns upcoming match data
- Frontend: new "Import Matches" section/tab in Admin Panel that:
  - Calls the backend to fetch upcoming matches from football-data.org using the provided API key (4324f56c98a948e0a550f0e3fa00acfd)
  - Shows a list of upcoming matches with home team, away team, date, competition
  - Each match has a "Create Prediction" button that pre-fills the Add Prediction form with the match data
  - Admin can then fill in the prediction, odds, confidence, analysis and save

### Modify
- Admin Panel: add an "Import" tab or section alongside the existing predictions table
- useQueries.ts: add hook for fetchUpcomingMatches

### Remove
- Nothing removed

## Implementation Plan
1. Add `http-outcalls` Caffeine component
2. Generate new backend with `fetchUpcomingMatches` function that calls football-data.org API (GET /v4/matches?status=SCHEDULED) with the API key, parses JSON response and returns structured match data
3. Update frontend Admin Panel to add an "Import Matches" tab that fetches and displays upcoming matches, with a button to pre-fill the prediction form
4. Wire the API key (hardcoded for now: 4324f56c98a948e0a550f0e3fa00acfd) as parameter passed from frontend to backend outcall
