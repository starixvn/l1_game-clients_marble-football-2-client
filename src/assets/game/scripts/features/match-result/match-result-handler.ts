import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";
import { TournamentStore } from "../tournament/tournament-store";
import { MatchResultStore } from "./match-result-store";

const { injectable, inject } = inversify;

@injectable()
export class MatchResultHandler {
    @inject(gc.Settlements.SettlementStore) private readonly settlementStore: gc.Settlements.SettlementStore;
    @inject(MatchResultStore) private readonly store: MatchResultStore;
    @inject(TournamentStore) private readonly tournamentStore: TournamentStore;

    constructor() {
        mobx.makeAutoObservable(this);

        setTimeout(() => {
            mobx.reaction(
                () => this.settlementStore.currentFinish,
                (currentFinish: { roundId: number; result: MarbleFootballServiceMessages.Result }) => {
                    currentFinish && this.generateMatchResult(currentFinish);
                }
            );
        }, 0);
    }

    generateMatchResult(currentFinish: { roundId: number; result: MarbleFootballServiceMessages.Result; settlementResult }) {
        const { roundId, result, settlementResult } = currentFinish;

        const miniGame = result.homeWinsOnDraw !== undefined && settlementResult.draw;
        const scores = this.parseMatchScore(result);

        const currentMatch = this.tournamentStore.currentMatch;
        const isHomeWinner = settlementResult.home || (miniGame && result.homeWinsOnDraw);
        const winner = isHomeWinner ? currentMatch.home : currentMatch.away;

        this.store.matchResult = {
            roundId,
            scores,
            miniGame,
            winner,
            homeWinsOnDraw: !!result.homeWinsOnDraw,
            isFinal: this.tournamentStore.isFinal,
        };
    }

    parseMatchScore(result: MarbleFootballServiceMessages.Result) {
        const { firstHalf, secondHalf, firstHalfTimeline, secondHalfTimeline } = result;

        const matchHalves = [
            { goals: firstHalf, timeline: firstHalfTimeline },
            { goals: secondHalf, timeline: secondHalfTimeline },
        ];

        const halftimeScores = matchHalves.map((half) => {
            const scoreTimeline = {
                H: [], // Home team goals
                A: [], // Away team goals
            };

            for (let i = 0; i < half.goals.length; i++) {
                const scoringTeam = half.goals.charAt(i);
                if (scoringTeam !== "H" && scoringTeam !== "A") {
                    continue;
                }
                scoreTimeline[scoringTeam].push(half.timeline[i]);
            }

            return [scoreTimeline.H.length, scoreTimeline.A.length];
        });

        const finalScore = halftimeScores.reduce((total, current) => [total[0] + current[0], total[1] + current[1]], [0, 0]);

        return [...halftimeScores, finalScore];
    }
}
