import { settings } from "../../game-settings";

export interface GamePhase {
    id: string;
    visible?: boolean;
    progress?: number;
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
    Halftime = "halftime",
}

export const TimePointTournament = settings.durations.placingBet + settings.durations.tournament;
export const TimePointShowMatchWinner = TimePointTournament + settings.durations.matchWinner;
export const TimePointHalftime = settings.durations.streamingVideo - settings.durations.videoDuration;
