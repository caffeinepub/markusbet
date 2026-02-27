# MarkusBet

## Current State
The app has an Admin Panel with an "Import Matches" tab that fetches upcoming football matches from football-data.org. The fetch is done **directly from the browser** (frontend) using the `fetch()` API with an `X-Auth-Token` header. This fails because football-data.org blocks cross-origin requests from browsers (CORS policy). The http-outcalls component is already selected but not used for this feature.

## Requested Changes (Diff)

### Add
- New backend function `fetchFootballMatches(token: Text) : async Text` that calls football-data.org via HTTP outcall and returns the raw JSON response
- New entry in `backend.d.ts`: `fetchFootballMatches(token: string): Promise<string>`

### Modify
- `AdminPanel.tsx`: Replace direct `fetch("https://api.football-data.org/v4/matches?...")` call with a call to the backend `fetchFootballMatches(token)` function, then parse the returned JSON string
- `main.mo`: Add `fetchFootballMatches` public shared function using the `Outcall` module

### Remove
- The hardcoded `FOOTBALL_API_KEY` constant from the frontend (move to backend)

## Implementation Plan
1. Add `fetchFootballMatches` function in `main.mo` that uses `Outcall.httpGetRequest` with the API key header
2. Regenerate/update `backend.d.ts` to expose the new function
3. Update `AdminPanel.tsx` `fetchMatches()` to call `actor.fetchFootballMatches(token)` and parse JSON response
4. Remove the `FOOTBALL_API_KEY` constant from `AdminPanel.tsx`
