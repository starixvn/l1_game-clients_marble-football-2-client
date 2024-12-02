export interface TournamentInfo {
    currentMatch: number;
}

export interface TournamentMatch {
    home: string;
    away: string;
    id?: number;
}

export interface TournamentGroupRound {
    [id: string]: TournamentMatch[];
}
