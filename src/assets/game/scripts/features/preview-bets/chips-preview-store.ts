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

    get boundChipsFirstHalf() {
        return this._boundChipsFirstHalf;
    }

    set boundChipsFirstHalf(boundChipsFirstHalf: boolean) {
        this._boundChipsFirstHalf = boundChipsFirstHalf;
    }

    get boundChipsSecondHalf() {
        return this._boundChipsSecondHalf;
    }

    set boundChipsSecondHalf(boundChipsSecondHalf: boolean) {
        this._boundChipsSecondHalf = boundChipsSecondHalf;
    }

    get firstHalfChips() {
        return this._firstHalfChips;
    }

    set firstHalfChips(firstHalfChips: Record<string, any>) {
        this._firstHalfChips = firstHalfChips;
    }

    // secondHalfChips
    get secondHalfChips() {
        return this._secondHalfChips;
    }

    set secondHalfChips(secondHalfChips: Record<string, any>) {
        this._secondHalfChips = secondHalfChips;
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
