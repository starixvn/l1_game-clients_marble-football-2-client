import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { BackgroundVideoPlayer } from "../../../scripts/background-video-player";
import { VideoStreamHandlers } from "../features/feature";
import { VideoStreamStore } from "../features/video-stream/video-stream-store";
import { settings } from "../game-settings";
import { BreakTime } from "./break-time";
import { IntroOutro } from "./intro-outro";
import { SystemIndicator } from "./system-indcator";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;
const { sentryLogger } = gc;

@ccclass
export default class VideoStreamIntegration extends ObserverComponent {
    @property(BackgroundVideoPlayer)
    private backgroundVideoPlayer: BackgroundVideoPlayer = null;

    @property(BreakTime)
    private breakTime: BreakTime = null;

    @property(SystemIndicator)
    private systemIndicator: SystemIndicator = null;

    @property(IntroOutro)
    private introOutro: IntroOutro = null;

    onLoad(): void {
        super.onLoad();

        this.backgroundVideoPlayer?.node.on("hlsLevelSwitched", this.updateSystemIndicator, this);
        this.backgroundVideoPlayer?.node.on("hlsError", this.updateSystemIndicator, this);

        this.backgroundVideoPlayer?.node.on("hlsError", this.onHLSError, this);

        this.backgroundVideoPlayer?.node.on("hlsManifestLoading", () => (this.introOutro.showField = true));
        this.backgroundVideoPlayer?.node.on("syncNativeCurrentTime", (time: number) => (this.introOutro.showField = time <= 0));
    }

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

    @render(gc.Settlements.SettlementStore, (store) => store.currentFinish)
    showPlayArea(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        this.introOutro.playOutroAnimation(0, settings.durations.outro);
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.roundTime)
    private onRoundTimeUpdate(roundTime: number) {
        if (roundTime === settings.durations.introVideo) {
            this.introOutro.playIntroAnimation();
        }

        if (roundTime === settings.durations.introVideo - 1) {
            this.breakTime?.playAnimation(0);
        }

        this.introOutro.showGameBackground = roundTime > settings.durations.introVideo || roundTime < 0;
    }

    @handle(VideoStreamHandlers, (handler) => handler.resetForNewRound())
    private resetVideoStream() {}

    @handle(VideoStreamStore, (store, time: number) => store.updateWithRoundTime(time))
    private updateVideoTimeAndScore(currentTime: number) {
        return currentTime;
    }

    private updateSystemIndicator(data: { level?: number } | string) {
        if (typeof data === "object" && data.level !== undefined) {
            // On level changed
            this.systemIndicator.networkStatus = data.level + 2;
        } else {
            // On error, set to disconnected
            this.systemIndicator.networkStatus = 1;

            const segmentTime = 3; // second

            this.scheduleOnce(() => {
                this.systemIndicator.networkStatus = this.backgroundVideoPlayer.level + 2;
            }, segmentTime);
        }
    }

    private onHLSError(_: string, data: any) {
        sentryLogger.logError(data);
    }
}
