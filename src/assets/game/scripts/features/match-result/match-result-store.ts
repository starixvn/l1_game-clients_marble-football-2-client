import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";

const { injectable, inject } = inversify;

export interface IMatchResult {
    roundId: number;
    miniGame: boolean;
    penalty: MarbleFootballServiceMessages.Penalty;
    scores: number[][];
    winner: string;
    isHomeWin: boolean;
    homeWinsOnDraw: boolean;
    isFinal: boolean;
}

@injectable()
export class MatchResultStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    matchResult: IMatchResult = null;
}
