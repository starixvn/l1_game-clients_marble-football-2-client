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

    onLoad(): void {
        super.onLoad();
        this.setInitialBandwidth();
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.isStartRound)
    resetForNewRound(isStartRound: boolean) {
        if (isStartRound) {
            this.backgroundVideoPlayer.resetAllSettings();
            this.setInitialBandwidth();
        }
    }

    @render(VideoStreamStore, (store) => store.currentVideo)
    renderVideoSource(currentVideo: StreamingVideo) {
        if (currentVideo.videoName && currentVideo.liveStreamServer) {
            this.backgroundVideoPlayer.playVideoWithVideoInfo(currentVideo.videoName, currentVideo.liveStreamServer);

            this.backgroundVideoPlayer.currentTime = currentVideo.time;
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

    private async setInitialBandwidth() {
        const testFileUrl = "https://scstream.s3.amazonaws.com/demo/06ebe2c5b5dbaef03b90d32d352665c7_240p2.ts";

        this.calculateBandwidth(testFileUrl).then((bandwidth) => {
            const recommendedResolution =
                bandwidth > BackgroundVideoPlayer.BAND_WIDTH_FOR_HIGH_RESOLUTION
                    ? BackgroundVideoPlayer.HIGH_RESOLUTION
                    : BackgroundVideoPlayer.LOW_RESOLUTION;

            this.backgroundVideoPlayer.updateVideoResolution(recommendedResolution);
        });
    }

    private async calculateBandwidth(testFileUrl: string) {
        const response = await fetch(testFileUrl);

        const reader = response.body.getReader();
        let totalBytes = 0;

        const startTime = performance.now();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalBytes += value.length;
        }
        const endTime = performance.now();

        const fileSizeInKiloBytes = totalBytes / 1024;
        const durationInSeconds = (endTime - startTime) / 1000;

        return fileSizeInKiloBytes / durationInSeconds;
    }
}
