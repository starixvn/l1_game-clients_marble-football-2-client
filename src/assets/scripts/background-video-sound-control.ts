import gc from "@sg/game-client-base";
import { _decorator, game } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { BackgroundVideoPlayer } from "./background-video-player";
const { ccclass, requireComponent } = _decorator;
const { UserSettings } = gc;
const { render } = Observer;

@ccclass("BackgroundVideoSoundControl")
@requireComponent(BackgroundVideoPlayer)
export class BackgroundVideoSoundControl extends ObserverComponent {
    private videoPlayer: BackgroundVideoPlayer;
    private touched = false;
    onLoad(): void {
        this.videoPlayer = this.node.getComponent(BackgroundVideoPlayer);
        super.onLoad();

        const canvas = game.canvas;
        canvas.addEventListener("touchstart", this.onTouch.bind(this));
        canvas.addEventListener("mousedown", this.onMouse.bind(this));
    }

    @render(UserSettings.UserSettingStore, (store) => store.musicEnable)
    private updateMusicStatus(musicEnable: boolean) {
        this.syncMuted(!musicEnable);
        if (this.touched) {
            this.videoPlayer.setNativeMuted();
        }
    }

    onMouse() {
        this.touched = true;
        this.videoPlayer.setNativeMuted();
    }

    onTouch() {
        this.touched = true;
        this.videoPlayer.setNativeMuted();
    }

    private syncMuted(isMute = false) {
        this.videoPlayer.muted = isMute;
    }
}
