export interface TournamentInfo {
    currentMatch: number;
    matches: TournamentMatch[];
}

export interface TournamentMatch {
    home: string;
    away: string;
    id?: number;
}

export interface TournamentGroupRound {
    [id: string]: TournamentMatch[];
}
