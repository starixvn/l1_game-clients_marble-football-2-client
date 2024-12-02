import gc from "@sg/game-client-base";
import { _decorator } from "cc";

import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import "../../../resources/i18n";
import { VideoStreamHandlers } from "../features/feature";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";

const { ccclass } = _decorator;
const { render, handle } = Observer;

@ccclass
export default class VideoStreamIntegration extends ObserverComponent {
    @render(gc.Rounds.RoundTimeStore, (store) => store.isStartRound)
    private onStartingRound(isStartRound: boolean) {
        if (isStartRound) {
            this.resetVideoStream();
        }
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundTime)
    private onUpdateRoundTime(currentTime: number) {
        this.updateVideoTimeAndScore(currentTime);
    }

    @handle(VideoStreamHandlers, (handler) => handler.resetForNewRound())
    private resetVideoStream() {}

    @handle(VideoStreamStore, (store, time: number) => store.updateWithRoundTime(time))
    private updateVideoTimeAndScore(currentTime: number) {
        return currentTime;
    }
}
