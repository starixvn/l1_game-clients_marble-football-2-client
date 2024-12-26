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
    }

    onMouse() {
        console.log("onMouse");
        this.videoPlayer.gotUserGesture();
    }

    onTouch() {
        console.log("onTouch");
        this.videoPlayer.gotUserGesture();
    }

    private syncMuted(isMute = false) {
        this.videoPlayer.muted = isMute;
    }
}
