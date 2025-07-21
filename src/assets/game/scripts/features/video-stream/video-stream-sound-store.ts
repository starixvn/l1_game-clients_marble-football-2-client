import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
import { MarbleRoundTimeStore } from "../rounds/marble-round-time-store";

const { injectable, inject } = inversify;

@injectable()
export class VideoStreamSoundStore {
    @inject(gc.Rounds.RoundTimeStore) private readonly roundTimeStore: MarbleRoundTimeStore;
    @inject(gc.UserSettings.UserSettingStore) private readonly userSettingStore: gc.UserSettings.UserSettingStore;

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
