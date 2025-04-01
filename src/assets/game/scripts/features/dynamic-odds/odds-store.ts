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

    get oddsWithConfig(): OddsWithConfig {
        const odds = this.roundStore.roundOdds?.odds || {};
        const newOdds: Record<string, number> = {
            ...odds,
            ...this._odds,
        };

        const deltaOdds = this.deltaForAllBetOptions(newOdds);

        return {
            odds: {
                ...odds,
                ...this._odds,
            },
            fractional: this.roundStore.roundOdds?.fractional || false,
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
