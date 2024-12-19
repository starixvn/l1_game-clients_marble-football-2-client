import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import inversify from "inversify";
import mobx, { reaction } from "mobx";
import { settings } from "../../game-settings";
const { injectable, inject } = inversify;
const RoundTimeInitValue = -99999;

@injectable()
export class VideoStreamSoundStore {
    @inject(gc.Rounds.RoundTimeStore) private roundTimeStore: gc.Rounds.RoundTimeStore;
    @inject(gc.UserSettings.UserSettingStore) private userSettingStore: gc.UserSettings.UserSettingStore;


    constructor() {
        mobx.makeAutoObservable(this);
    }

    get isInMatch() {
        return this.roundTimeStore.roundTime < settings.durations.introVideo && this.roundTimeStore.roundTime > 0;
    }

    get isStopBackgroundMusic() {
        return this.isInMatch && this.userSettingStore.musicEnable;
    }

    get isPlayBackgroundMusic() {
        return !this.isInMatch && this.userSettingStore.musicEnable;
    }
}
