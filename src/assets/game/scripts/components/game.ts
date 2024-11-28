import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { startGame } from "db://shared-components/shared/scripts/startup";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";

import Observer from "observer";
import "../../../resources/i18n";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import { BackgroundVideoPlayer } from "../../../scripts/background-video-player";
import { StreamingVideo, VideoStreamStore } from "../features/video-stream/video-stream-store";

startGame(settings.name, containerOptions, siteConfigs);

const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property({ visible: false, override: true })
    override lblMinBet = null;

    @property({ visible: false, override: true })
    override lblMaxBet = null;

    @property(ChipFlying)
    chipFlying: ChipFlying = null;

    @property(BackgroundVideoPlayer)
    private backgroundVideoPlayer: BackgroundVideoPlayer = null;

    @render(gc.Rounds.RoundTimeStore, (store) => store.isStartRound)
    clearBackgroundVideoPlayer(isStartRound: boolean) {
        if (isStartRound) {
            this.backgroundVideoPlayer.resetAllSettings();
        }
    }

    @render(VideoStreamStore, (store) => store.currentVideo)
    renderVideoSource(currentVideo: StreamingVideo) {
        if (currentVideo.videoName && currentVideo.liveStreamServer) {
            this.backgroundVideoPlayer.playVideoWithVideoInfo(currentVideo.videoName, currentVideo.liveStreamServer);
        }
    }

    @render(VideoStreamStore, (store) => store.currentVideoTime)
    updateVideoCurrentTimeAndResolution(currentTime: number) {
        if (currentTime < 0) {
            return;
        }

        if (currentTime === 0) {
            this.backgroundVideoPlayer.currentTime = 0;
        }

        const canPlayHighResolution = this.backgroundVideoPlayer.bandwidthEstimate >= BackgroundVideoPlayer.BAND_WIDTH_FOR_HIGH_RESOLUTION;

        const isPlayingHighResolution = this.backgroundVideoPlayer.currentResolution === BackgroundVideoPlayer.HIGH_RESOLUTION;

        if (canPlayHighResolution !== isPlayingHighResolution) {
            const recommendedResolution = canPlayHighResolution
                ? BackgroundVideoPlayer.HIGH_RESOLUTION
                : BackgroundVideoPlayer.LOW_RESOLUTION;

            this.backgroundVideoPlayer.updateVideoResolution(recommendedResolution);
        }
    }

    renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish) {
            return;
        }
        const { result, settlementResult } = currentFinish;

        if (!this.isValidResult(result, settlementResult)) {
            return;
        }

        this.showResult(result, true, settlementResult).then(() => {
            this.finishShowResult(result, settlementResult);
            this.chipFlying.callActionPayChips();
        });

        this.playSound(gc.Audios.AudioIds.RECEIVE_FINISH);
    }
}
