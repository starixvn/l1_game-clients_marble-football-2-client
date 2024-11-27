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
const { observer, render, handle } = Observer;

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

    @render(VideoStreamStore, (store) => store.currentVideo)
    renderVideoSource(currentVideo: StreamingVideo) {
        if (currentVideo.videoName) {
            const videoUrl = new URL(`${currentVideo.videoName}_${720}p.m3u8`, currentVideo.liveStreamServer).toString();

            console.log("play video", videoUrl);

            this.backgroundVideoPlayer.videoSource = videoUrl;
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
