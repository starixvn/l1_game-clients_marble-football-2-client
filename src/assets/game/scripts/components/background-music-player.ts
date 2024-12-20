import { _decorator, AudioSource, tween } from "cc";
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

    _currentVolume: number = 1;

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
            this._currentVolume = this.musicSource.volume;
            tween(this.musicSource).to(1, { volume: 0 }).start();
            this._stopBackgroundMusic = true;
        }
    }

    @render(VideoStreamSoundStore, (store) => store.isPlayBackgroundMusic)
    private playMusic(playBackgroundMusic: boolean) {
        if (playBackgroundMusic) {
            if (this.musicSource.state === AudioSource.AudioState.STOPPED) {
                this.musicSource.play();
            }
            tween(this.musicSource).to(1, { volume: this._currentVolume }).start();
        }
    }
}
