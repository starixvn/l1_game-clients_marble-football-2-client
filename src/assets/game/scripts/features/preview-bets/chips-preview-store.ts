import inversify from "inversify";
import mobx from "mobx";
import gc from "@sg/game-client-base";

const { injectable, inject } = inversify;

@injectable()
export class ChipsPreviewStore {
    @inject(gc.Rounds.RoundTimeStore) roundTimeStore: gc.Rounds.RoundTimeStore;
    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _boundChips: boolean = false;

    private _chips: Record<string, any> = {};

    private _finalChips: Record<string, any> = {};
    private _chipsFirstHalf: Record<string, any> = {};
    private _boundChipsFirstHalf: boolean = false;

    private _boundChipsSecondHalf: boolean = false;
    private _boundChipsFinal: boolean = false;

    set boundChipsFirstHalf(boundChipsFirstHalf: boolean) {
        this._boundChipsFirstHalf = boundChipsFirstHalf;
    }

    set boundChipsSecondHalf(boundChipsSecondHalf: boolean) {
        this._boundChipsSecondHalf = boundChipsSecondHalf;
    }

    set boundChipsFinal(boundChipsFinal: boolean) {
        this._boundChipsFinal = boundChipsFinal;
    }

    get boundChips() {
        return this._boundChips;
    }

    set boundChips(boundChips: boolean) {
        this._boundChips = boundChips;
    }

    get chips() {
        return this._chips;
    }

    set chips(chips: Record<string, any>) {
        this._chips = chips;
    }

    get finalChips() {
        return this._finalChips;
    }

    set finalChips(finalChips: Record<string, any>) {
        this._finalChips = finalChips;
    }
}
