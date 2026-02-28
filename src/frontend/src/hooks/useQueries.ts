import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Prediction } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { Prediction };

// ---

export function usePredictions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[]>({
    queryKey: ["predictions"],
    queryFn: () => fetchAndSeedPredictions(actor),
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
      return actor.addPredictionAsAdmin(
        params.token,
        params.homeTeam,
        params.awayTeam,
        params.matchDate,
        params.league,
        params.prediction,
        params.odds,
        params.confidence,
        params.analysis,
        params.category ?? "single",
      );
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
      return actor.updatePredictionAsAdmin(
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
        params.category ?? "single",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });
}

async function fetchAndSeedPredictions(
  actor: import("../backend.d.ts").backendInterface | null,
): Promise<Prediction[]> {
  if (!actor) return [];
  const raw = await actor.getPredictions();
  if (raw.length === 0) {
    try {
      await actor.seedInitialData();
      return await actor.getPredictions();
    } catch {
      return [];
    }
  }
  return raw;
}

export function useGetSinglePredictions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[], Error, Prediction[]>({
    queryKey: ["predictions"],
    queryFn: () => fetchAndSeedPredictions(actor),
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
    select: (data) =>
      data.filter((p) => !p.category || p.category === "single"),
  });
}

export function useGetParlayPredictions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[], Error, Prediction[]>({
    queryKey: ["predictions"],
    queryFn: () => fetchAndSeedPredictions(actor),
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
    select: (data) => data.filter((p) => p.category === "parlay"),
  });
}

export function useDeletePrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { token: string; id: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePredictionAsAdmin(params.token, params.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
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
