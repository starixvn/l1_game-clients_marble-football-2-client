import gc from "@sg/game-client-base";
import { _decorator, director, Node } from "cc";
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

        const canvasNode = director.getScene().getChildByName("Canvas");
        canvasNode.on(Node.EventType.TOUCH_START, this.onTouch.bind(this));
    }

    @render(UserSettings.UserSettingStore, (store) => store.musicEnable)
    private updateMusicStatus(musicEnable: boolean) {
        this.muted = !musicEnable;
        this.syncMuted();
    }

    onTouch() {
        this.videoPlayer.gotUserGesture();
    }

    private syncMuted() {
        console.log("syncMuted ", this.muted);
        this.videoPlayer.muted = this.muted;
    }
}
