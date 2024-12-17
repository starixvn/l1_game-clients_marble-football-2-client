import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
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
    private touched = false;

    @render(UserSettings.UserSettingStore, (store) => store.sfxEnable)
    private updateSfxStatus(sfxEnable: boolean) {
        this.muted = !sfxEnable;

        if (this.touched) {
            this.node.getComponent(BackgroundVideoPlayer).muted = this.muted;
        }
    }

    onLoad(): void {
        super.onLoad();

        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchEnd() {
        this.touched = true;

        this.node.getComponent(BackgroundVideoPlayer).muted = this.muted;
    }
}
