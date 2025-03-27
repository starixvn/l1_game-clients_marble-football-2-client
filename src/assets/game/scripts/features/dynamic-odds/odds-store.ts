import inversify from "inversify";
import mobx from "mobx";
import gc from "@sg/game-client-base";

const { injectable, inject } = inversify;

@injectable()
export class OddsStore {
    @inject(gc.Rounds.RoundStore) private roundStore: gc.Rounds.RoundStore;
    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _odds = {};

    get odds() {
        const odds = this.roundStore.roundOdds?.odds || {};
        return {
            ...odds,
            ...this._odds,
        };
    }

    set odds(odds: Record<string, number>) {
        this._odds = {
            ...this._odds,
            ...odds,
        };
    }
}
