# MarkusBet

## Current State
The app has a public predictions page and an admin panel. The admin panel includes two tabs: "Predictions" (manage existing predictions) and "Import Matches" (fetch upcoming matches from football-data.org API and auto-fill the prediction form). The import tab fetches up to 20 scheduled matches from all available competitions and displays them in a list.

## Requested Changes (Diff)

### Add
- League/competition filter in the Import Matches tab: a set of filter buttons (or a dropdown) that lets the admin filter fetched matches by competition name, so they can quickly find only Premier League, Champions League, etc.

### Modify
- ImportMatchesTab component: after fetching matches, show unique competition names as filter chips/buttons. Selecting a filter shows only matches from that competition. An "All" option shows everything.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `selectedLeague` state (string | "ALL") to `ImportMatchesTab`
2. After fetching, derive unique competition names from fetched matches
3. Render filter chips row (All + each unique competition) below the fetch button
4. Filter displayed matches based on `selectedLeague`
5. Reset `selectedLeague` to "ALL" when a new fetch is triggered
