import inversify from "inversify";
import mobx from "mobx";

const { injectable, inject } = inversify;

@injectable()
export class ButtonsBetStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _isPreviewBets = false;

    get isPreviewBets() {
        return this._isPreviewBets;
    }

    set isPreviewBets(isPreviewBets: boolean) {
        this._isPreviewBets = isPreviewBets;
    }
}
