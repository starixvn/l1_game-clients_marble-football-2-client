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
import { VideoStreamStore } from "../features/video-stream/video-stream-store";
import { MarbleFootballServiceMessages } from "../marble-football-service-messages";
const { Rounds, Translator, RoundHistories, Settlements } = gc;

startGame(settings.name, containerOptions, siteConfigs);

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property({ visible: false })
    override lblMinBet = null;

    @property({ visible: false })
    override lblMaxBet = null;

    @property(ChipFlying)
    chipFlying: ChipFlying = null;

    @property(BackgroundVideoPlayer)
    private backgroundVideoPlayer: BackgroundVideoPlayer = null;

    @render(VideoStreamStore, (store) => store.videoResult)
    renderVideoSource(videoResult: MarbleFootballServiceMessages.VideoStream) {
        const firstHalfVideo = videoResult?.firstHalfVideo;
        if (firstHalfVideo?.length > 0) {
            console.log("firstHalfVideo", firstHalfVideo);
            this.backgroundVideoPlayer.videoSource = "https://scstream.s3.amazonaws.com/demo/f91c105b8235abe74b638dd9be5929fe_720p.m3u8";
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
