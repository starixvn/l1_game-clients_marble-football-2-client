import { _decorator, AudioSource } from "cc";
import gc from "@sg/game-client-base";
import MusicPlayer from "db://shared-components/game/audios/scripts/component/music-player";
import Observer from "observer";
import { VideoStreamSoundStore } from "../features/video-stream/video-stream-sound-store";
const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("BackgroundMusicPlayer")
export class BackgroundMusicPlayer extends MusicPlayer {
    @property(AudioSource)
    musicSource: AudioSource = null;

    _stopBackgroundMusic: boolean = false;

    onEnable() {
        this.musicSource.node.on(AudioSource.EventType.STARTED, this.onMusicStarted, this);
    }

    onMusicStarted() {
        if (this._stopBackgroundMusic) {
            this.musicSource.stop();
            this._stopBackgroundMusic = false;
        }
    }

    @render(VideoStreamSoundStore, (store) => store.isStopBackgroundMusic)
    private stopMusic(stopBackgroundMusic: boolean) {
        if (stopBackgroundMusic) {
            this.musicSource.stop();
            this._stopBackgroundMusic = true;
        }
    }

    @render(VideoStreamSoundStore, (store) => store.isPlayBackgroundMusic, { fireImmediately: false })
    enableMusic(musicEnable: boolean) {
        if (musicEnable) {
            this.callPlayMusic();
        }
    }
}
