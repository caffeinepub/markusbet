# MarkusBet

## Current State
- Full-stack football predictions app with admin panel
- Backend (Motoko): stores `Prediction` records without `category` field; has `getPredictions`, `addPredictionAsAdmin`, `updatePredictionAsAdmin`, `deletePredictionAsAdmin`, `adminLogin/Logout`, `fetchMatchesByCompetition`
- Frontend: shows predictions in two tabs (ΠΡΟΒΛΕΨΕΙΣ / ΠΑΡΟΛΙ), but tab filtering is done client-side by checking `category` field that doesn't exist in the backend
- `main.tsx` renders `<App />` directly instead of `<RouterProvider>`, so routing is broken and the page shows nothing
- `useGetSinglePredictions` and `useGetParlayPredictions` use runtime duck-typing to call backend methods that don't exist

## Requested Changes (Diff)

### Add
- `category` field (`"single"` | `"parlay"`) to the `Prediction` type in Motoko backend
- `getSinglePredictions()` query -- returns only predictions where `category == "single"` or empty
- `getParlayPredictions()` query -- returns only predictions where `category == "parlay"`
- `addPredictionWithCategoryAsAdmin(...)` -- adds prediction with explicit category
- `updatePredictionWithCategoryAsAdmin(...)` -- updates prediction with explicit category
- Today's filter: main page shows only predictions whose `matchDate` matches today's date (YYYY-MM-DD), plus a "show all" toggle

### Modify
- `main.tsx`: use `RouterProvider` with the `router` from `router.tsx` instead of rendering `<App />` directly
- `updatePredictionAsAdmin` should preserve existing `category` when updating without category
- `preupgrade/postupgrade`: handle migration for existing records that have no `category` (default to `"single"`)

### Remove
- Nothing removed

## Implementation Plan
1. Generate updated Motoko backend with `category` field on `Prediction`, new query and mutation functions, and stable storage migration
2. Update `main.tsx` to use `RouterProvider` (already done)
3. Update `App.tsx` to filter today's predictions by default with a toggle to show all
4. Update `useQueries.ts` hooks for `getSinglePredictions` and `getParlayPredictions` to call the real backend methods
5. Update `AdminPanel.tsx` to use `addPredictionWithCategoryAsAdmin` / `updatePredictionWithCategoryAsAdmin`
6. Validate build
