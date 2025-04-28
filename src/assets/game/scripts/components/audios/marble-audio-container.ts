import gc from "@sg/game-client-base";
import { _decorator, JsonAsset } from "cc";
import Observer from "observer";
import { AudioContainer } from "db://shared-components/game/audios/scripts/component/audio-container";
import { MarbleAudioStore } from "../../features/audios/marble-audio-store";

const { Audios } = gc;
const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass
export class MarbleAudioContainer extends AudioContainer {
    @property(JsonAsset)
    audioCommentatorsVoices: JsonAsset = null;

    get gameId() {
        return 114;
    }

    // getAudioConfigs(): TAudioConfigs {
    //     const configs = {
    //         ...this.sharedAudioConfig?.json,
    //         ...this.remoteAudioConfigs,
    //         ...this.audioConfig?.json,
    //         ...this.audioCommentatorsVoices?.json,
    //     };

    //     return configs;
    // }

    @render(MarbleAudioStore, (store) => store.sfx, { fireImmediately: false })
    playSFXVoices(data: gc.Audios.AudioData) {
        if (data.action === Audios.AudioAction.PLAY && this.isUserGesture) {
            this.playSFXAudio(data.id, false);
        }
    }
}
