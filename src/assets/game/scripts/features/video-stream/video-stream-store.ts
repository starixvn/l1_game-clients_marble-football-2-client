import inversify from "inversify";
import mobx from "mobx";
import { MarbleFootballServiceMessages } from "../../marble-football-service-messages";

const { injectable } = inversify;

@injectable()
export class VideoStreamStore {
    private _videoResult: MarbleFootballServiceMessages.VideoStream = {} as any;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    get videoResult() {
        return this._videoResult;
    }

    set videoResult(source: MarbleFootballServiceMessages.VideoStream) {
        this._videoResult = source;
    }
}
