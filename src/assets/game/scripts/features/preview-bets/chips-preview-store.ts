import inversify from "inversify";
import mobx from "mobx";
import gc from "@sg/game-client-base";
import { MarbleRoundTimeStore } from "../rounds/marble-round-time-store";

const { injectable, inject } = inversify;

@injectable()
export class ChipsPreviewStore {
    @inject(gc.Rounds.RoundTimeStore) roundTimeStore: MarbleRoundTimeStore;
    @inject(gc.Settlements.SettlementStore) settlementStore: gc.Settlements.SettlementStore;

    constructor() {
        mobx.makeAutoObservable(this);
        mobx.reaction(
            () => this.settlementStore?.settlementResult,
            () => {
                this._settlementResult = this.settlementStore?.settlementResult || {};
            }
        );
        mobx.when(
            () => this.roundTimeStore?.isPreparingBetPreMatch,
            () => {
                this._boundChipsFirstHalf = true;
                this._boundChipsSecondHalf = true;
                this._firstHalfChips = {};
                this._secondHalfChips = {};
                this._finalChips = {};
            }
        );
    }

    private _settlementResult: gc.GameServiceMessage.TSettlementResult = {};

    private _finalChips: Record<string, any> = {};
    private _boundChipsFirstHalf = false;

    private _boundChipsSecondHalf = false;
    private _firstHalfChips: Record<string, any> = {};
    private _secondHalfChips: Record<string, any> = {};

    set boundChipsFirstHalf(boundChipsFirstHalf: boolean) {
        this._boundChipsFirstHalf = boundChipsFirstHalf;
    }

    set boundChipsSecondHalf(boundChipsSecondHalf: boolean) {
        this._boundChipsSecondHalf = boundChipsSecondHalf;
    }

    get boundChipsFirstHalf() {
        return this._boundChipsFirstHalf;
    }

    get boundChipsSecondHalf() {
        return this._boundChipsSecondHalf;
    }

    set firstHalfChips(firstHalfChips: Record<string, any>) {
        this._firstHalfChips = firstHalfChips;
    }

    get firstHalfChips() {
        return this._firstHalfChips;
    }

    set secondHalfChips(secondHalfChips: Record<string, any>) {
        this._secondHalfChips = secondHalfChips;
    }

    get secondHalfChips() {
        return this._secondHalfChips;
    }

    get finalChips() {
        return this._finalChips;
    }

    set finalChips(finalChips: Record<string, any>) {
        this._finalChips = finalChips;
    }

    get settlementResult() {
        return this._settlementResult;
    }
}
