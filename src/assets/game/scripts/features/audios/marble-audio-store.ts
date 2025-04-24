import inversify from "inversify";
import mobx from "mobx";
import gc from "@sg/game-client-base";

const { injectable, inject } = inversify;

@injectable()
export class MarbleAudioStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _sfx: gc.Audios.AudioData = null;

    public get sfx(): gc.Audios.AudioData {
        return this._sfx;
    }

    public set sfx(value: gc.Audios.AudioData) {
        this._sfx = value;
    }
}
