import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import inversify from "inversify";
import mobx from "mobx";
import { MarbleRoundTimeStore } from "../rounds/marble-round-time-store";

const { injectable, inject } = inversify;

@injectable()
export class VideoStreamSoundStore {
    @inject(gc.Rounds.RoundTimeStore) private roundTimeStore: MarbleRoundTimeStore;
    @inject(gc.UserSettings.UserSettingStore) private userSettingStore: gc.UserSettings.UserSettingStore;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    get isInMatch() {
        return this.roundTimeStore.isPlayingVideo;
    }

    get isPlayBackgroundMusic() {
        return !this.isInMatch && this.userSettingStore.musicEnable;
    }
}
