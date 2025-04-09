import inversify from "inversify";
import mobx from "mobx";
import gc from "@sg/game-client-base";

const { injectable, inject } = inversify;

@injectable()
export class ChipsPreviewStore {
    @inject(gc.Rounds.RoundTimeStore) roundTimeStore: gc.Rounds.RoundTimeStore;
    @inject(gc.Chips.ChipStore) chipStore: gc.Chips.ChipStore;
    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _finalChips: Record<string, any> = {};
    private _boundChipsFirstHalf: boolean = false;

    private _boundChipsSecondHalf: boolean = false;
    private _boundChipsFinal: boolean = false;
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

    set boundChipsFinal(boundChipsFinal: boolean) {
        this._boundChipsFinal = boundChipsFinal;
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
}
