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
        const betOptionNames = ["Away", "Draw", "Home", "Draw4", "Even", "Odd", "Over", "Under"];
        const deltaOdds = {};
        for (const betOptionName of betOptionNames) {
            deltaOdds[`secondHalf${betOptionName}`] = this.deltaOdds(odds[`firstHalf${betOptionName}`], odds[`secondHalf${betOptionName}`]);
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
