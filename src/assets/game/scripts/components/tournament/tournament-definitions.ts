import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";

export interface TournamentGroupRound {
    [id: string]: MarbleFootballServiceMessages.MatchType[];
}
