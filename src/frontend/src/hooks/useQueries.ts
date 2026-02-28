import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Prediction as BasePrediction } from "../backend.d.ts";
import { useActor } from "./useActor";

// Extend the base Prediction type to include the category field
// (category is stored in localStorage since the backend doesn't have a category field)
export type Prediction = BasePrediction & { category?: string };

// --- localStorage category helpers ---
const CATEGORY_STORAGE_KEY = "markusbet_categories";

type CategoryMap = Record<string, "single" | "parlay">;

export function getCategoryMap(): CategoryMap {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CategoryMap;
  } catch {
    return {};
  }
}

export function getCategoryFromStorage(id: bigint): string {
  const map = getCategoryMap();
  return map[id.toString()] ?? "single";
}

export function setCategoryInStorage(
  id: bigint,
  category: "single" | "parlay",
): void {
  const map = getCategoryMap();
  map[id.toString()] = category;
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(map));
}

export function removeCategoryFromStorage(id: bigint): void {
  const map = getCategoryMap();
  delete map[id.toString()];
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(map));
}

function mergeCategoriesFromStorage(
  predictions: BasePrediction[],
): Prediction[] {
  const map = getCategoryMap();
  return predictions.map((p) => ({
    ...p,
    category: map[p.id.toString()] ?? "single",
  }));
}

// ---

export function usePredictions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[]>({
    queryKey: ["predictions"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getPredictions();
      return mergeCategoriesFromStorage(raw);
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (password: string): Promise<string | null> => {
      if (!actor) throw new Error("No actor");
      return actor.adminLogin(password);
    },
  });
}

export function useAdminLogout() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (token: string): Promise<boolean> => {
      if (!actor) throw new Error("No actor");
      return actor.adminLogout(token);
    },
  });
}

export function useIsAdminAuthenticated(token: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["adminAuth", token],
    queryFn: async () => {
      if (!actor || !token) return false;
      return actor.isAdminAuthenticated(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useAddPrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      homeTeam: string;
      awayTeam: string;
      matchDate: string;
      league: string;
      prediction: string;
      odds: number;
      confidence: bigint;
      analysis: string;
      category?: "single" | "parlay";
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.addPredictionAsAdmin(
        params.token,
        params.homeTeam,
        params.awayTeam,
        params.matchDate,
        params.league,
        params.prediction,
        params.odds,
        params.confidence,
        params.analysis,
      );
      // Store category in localStorage if we got a valid id back
      if (result !== null && result !== undefined) {
        const id = typeof result === "bigint" ? result : BigInt(String(result));
        setCategoryInStorage(id, params.category ?? "single");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });
}

export function useUpdatePrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      token: string;
      id: bigint;
      homeTeam: string;
      awayTeam: string;
      matchDate: string;
      league: string;
      prediction: string;
      odds: number;
      confidence: bigint;
      analysis: string;
      category?: "single" | "parlay";
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.updatePredictionAsAdmin(
        params.token,
        params.id,
        params.homeTeam,
        params.awayTeam,
        params.matchDate,
        params.league,
        params.prediction,
        params.odds,
        params.confidence,
        params.analysis,
      );
      // Update category in localStorage
      setCategoryInStorage(params.id, params.category ?? "single");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });
}

export function useGetSinglePredictions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[]>({
    queryKey: ["singlePredictions"],
    queryFn: async () => {
      if (!actor) return [];
      const all = await actor.getPredictions();
      const merged = mergeCategoriesFromStorage(all);
      return merged.filter((p) => !p.category || p.category === "single");
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetParlayPredictions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[]>({
    queryKey: ["parlayPredictions"],
    queryFn: async () => {
      if (!actor) return [];
      const all = await actor.getPredictions();
      const merged = mergeCategoriesFromStorage(all);
      return merged.filter((p) => p.category === "parlay");
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeletePrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { token: string; id: bigint }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.deletePredictionAsAdmin(
        params.token,
        params.id,
      );
      // Remove from localStorage on success
      removeCategoryFromStorage(params.id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["singlePredictions"] });
      queryClient.invalidateQueries({ queryKey: ["parlayPredictions"] });
    },
  });
}

export function useFetchFootballMatches() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (token: string): Promise<string> => {
      if (!actor) throw new Error("No actor");
      return actor.fetchFootballMatches(token);
    },
  });
}

export function useFetchMatchesByCompetition() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      token,
      competitionCode,
    }: {
      token: string;
      competitionCode: string;
    }): Promise<string> => {
      if (!actor) throw new Error("No actor");
      return actor.fetchMatchesByCompetition(token, competitionCode);
    },
  });
}
