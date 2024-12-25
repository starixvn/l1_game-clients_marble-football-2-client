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
    private muted = false;
    private videoPlayer: BackgroundVideoPlayer;
    onLoad(): void {
        this.videoPlayer = this.node.getComponent(BackgroundVideoPlayer);
        super.onLoad();

        const canvas = game.canvas;
        canvas.addEventListener("focus", this.onTouch.bind(this));
    }

    @render(UserSettings.UserSettingStore, (store) => store.musicEnable)
    private updateMusicStatus(musicEnable: boolean) {
        this.muted = !musicEnable;
        this.syncMuted();
    }

    onTouch() {
        this.videoPlayer.gotUserGesture();
        this.syncMuted();
    }

    private syncMuted() {
        console.log("video sound sync muted ", this.muted);
        this.videoPlayer.muted = this.muted;
    }
}
