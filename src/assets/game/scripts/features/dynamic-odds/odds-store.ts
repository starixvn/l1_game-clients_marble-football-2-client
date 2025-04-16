import inversify from "inversify";
import mobx from "mobx";
import gc from "@sg/game-client-base";

const { injectable, inject } = inversify;

export type OddsWithConfig = {
    odds: Record<string, number>;
    fractional: boolean;
    deltaOdds: Record<string, number>;
};

@injectable()
export class OddsStore {
    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _odds = {};

    get odds() {
        return this._odds;
    }

    get oddsWithConfig(): OddsWithConfig {
        const deltaOdds = this.deltaForAllBetOptions(this._odds);

        return {
            odds: this._odds,
            fractional: this.mainPlayerStore.fractionalOddsFormat,
            deltaOdds,
        };
    }

    deltaForAllBetOptions(odds: Record<string, number>) {
        const betOptionNames = ["away", "draw", "home", "draw4", "even", "odd", "over", "under"];
        const deltaOdds = {};
        for (const betOptionName of betOptionNames) {
            deltaOdds[`${betOptionName}Live`] = this.deltaOdds(odds[`${betOptionName}`] || 0, odds[`${betOptionName}Live`] || 0);
        }
        return deltaOdds;
    }

    deltaOdds(oldOdds: number, newOdds: number) {
        return newOdds - oldOdds;
    }

    set odds(odds: Record<string, number>) {
        this._odds = {
            ...this._odds,
            ...odds,
        };
    }
}
