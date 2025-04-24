import inversify from "inversify";
import gc from "@sg/game-client-base";
import { MarbleAudioStore } from "./marble-audio-store";

const { injectable, inject } = inversify;
const { Audios } = gc;

@injectable()
export class MarbleAudioHandlers {
    @inject(MarbleAudioStore) private marbleAudioStore: MarbleAudioStore;
    @inject(gc.UserSettings.UserSettingStore) private userSettingsStore: gc.UserSettings.UserSettingStore;

    playSFX(audioId: string) {
        if (this.userSettingsStore.musicEnable) {
            this.marbleAudioStore.sfx = { id: audioId, action: Audios.AudioAction.PLAY };
        }
    }

    stopSFX(audioId: string) {
        this.marbleAudioStore.sfx = { id: audioId, action: Audios.AudioAction.STOP };
    }
}
