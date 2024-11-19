import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { BackgroundVideoPlayer } from "./background-video-player";
const { ccclass, requireComponent } = _decorator;
const { UserSettings } = gc;
const { render } = Observer;

@ccclass("BackgroundVideoSoundControl")
@requireComponent(BackgroundVideoPlayer)
export class BackgroundVideoSoundControl extends ObserverComponent {
    @render(UserSettings.UserSettingStore, (store) => store.sfxEnable)
    private updateSfxStatus(sfxEnable: boolean) {
        this.node.getComponent(BackgroundVideoPlayer).muted = !sfxEnable;
    }
}
