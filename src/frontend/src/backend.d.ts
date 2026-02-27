import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
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
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    addPredictionAsAdmin(token: string, homeTeam: string, awayTeam: string, matchDate: string, league: string, predictionType: string, odds: number, confidence: bigint, analysis: string): Promise<bigint | null>;
    adminLogin(password: string): Promise<string | null>;
    adminLogout(token: string): Promise<boolean>;
    deletePredictionAsAdmin(token: string, id: bigint): Promise<boolean>;
    fetchFootballMatches(token: string): Promise<string>;
    fetchMatchesByCompetition(token: string, competitionCode: string): Promise<string>;
    getPredictions(): Promise<Array<Prediction>>;
    isAdminAuthenticated(token: string): Promise<boolean>;
    seedInitialData(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePredictionAsAdmin(token: string, id: bigint, homeTeam: string, awayTeam: string, matchDate: string, league: string, predictionType: string, odds: number, confidence: bigint, analysis: string): Promise<boolean>;
}
