import inversify from "inversify";
import mobx from "mobx";

const { injectable, inject } = inversify;

export interface IMatchResult {
    roundId: number;

    miniGame: boolean;

    scores: number[][];

    winner: string;
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
