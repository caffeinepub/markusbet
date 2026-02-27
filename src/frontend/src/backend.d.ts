import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Prediction {
    id: bigint;
    prediction: string;
    homeTeam: string;
    odds: number;
    league: string;
    awayTeam: string;
    confidence: bigint;
    analysis: string;
    matchDate: string;
}
export interface backendInterface {
    addPredictionAsAdmin(token: string, homeTeam: string, awayTeam: string, matchDate: string, league: string, predictionType: string, odds: number, confidence: bigint, analysis: string): Promise<bigint | null>;
    adminLogin(password: string): Promise<string | null>;
    adminLogout(token: string): Promise<boolean>;
    deletePredictionAsAdmin(token: string, id: bigint): Promise<boolean>;
    getPredictions(): Promise<Array<Prediction>>;
    isAdminAuthenticated(token: string): Promise<boolean>;
    seedInitialData(): Promise<void>;
    updatePredictionAsAdmin(token: string, id: bigint, homeTeam: string, awayTeam: string, matchDate: string, league: string, predictionType: string, odds: number, confidence: bigint, analysis: string): Promise<boolean>;
}
