import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { BackgroundVideoPlayer } from "../../../scripts/background-video-player";
import { VideoStreamHandlers } from "../features/feature";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";
import { settings } from "../game-settings";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export default class VideoStreamIntegration extends ObserverComponent {
    @property(BackgroundVideoPlayer)
    private backgroundVideoPlayer: BackgroundVideoPlayer = null;

    staticVideos = {
        intro: "cd99ef2549fe8aa77a7c8c65485a7d9f615f7cc8ee8d0d944f6d98497633fe2c_720p",
        outro: "fdcd45cdf6e7f0be3a1c930854e3a753cf203f321cd67f0b53f52378a49769dd_720p",
    };

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

    @render(VideoStreamStore, (store) => store.liveStreamServer)
    private onLiveStreamServer(liveStreamServer: string) {
        this.backgroundVideoPlayer.init(liveStreamServer);
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundTime)
    private onRoundTimeUpdate(roundTime: number) {
        if (roundTime === settings.durations.introVideo) {
            this.playStaticVideo("intro");
        }

        if (roundTime === 0) {
            this.playStaticVideo("outro");
        }
    }

    @handle(VideoStreamHandlers, (handler) => handler.resetForNewRound())
    private resetVideoStream() {}

    @handle(VideoStreamStore, (store, time: number) => store.updateWithRoundTime(time))
    private updateVideoTimeAndScore(currentTime: number) {
        return currentTime;
    }

    private playStaticVideo(videoName: string = "intro") {
        const video = this.staticVideos[videoName];

        this.backgroundVideoPlayer.currentTime = 0;
        this.backgroundVideoPlayer.playVideoByName(video);
    }
}
