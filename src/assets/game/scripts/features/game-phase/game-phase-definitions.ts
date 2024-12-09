export interface GamePhase {
    id: string;
    visible: boolean;
    progress: number;
}

export interface GamePhaseConfig {
    id: string;
    begin: number;
    end: number;
    duration?: number;
}
export enum PhaseId {
    MatchWinner = "match-winner",
    MatchStatistics = "match-statistics",
    Tournament = "tournament",
}
