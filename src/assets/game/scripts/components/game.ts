import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { startGame } from "db://shared-components/shared/scripts/startup";

import Observer from "observer";
import { AnimationUtils } from "../../../../extensions/shared-components/assets/shared/utils";
import "../../../resources/i18n";
import { BackgroundVideoPlayer } from "../../../scripts/background-video-player";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions } from "../container-options";
import { StreamingVideo, VideoStreamStore } from "../features/video-stream/video-stream-store";
import { settings } from "../game-settings";

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

    override onHideGame() {
        this.backgroundVideoPlayer.stop();
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.isStartRound)
    resetForNewRound(isStartRound: boolean) {
        if (isStartRound) {
            this.backgroundVideoPlayer.stop();
        }
    }

    @render(VideoStreamStore, (store) => store.currentVideo)
    renderVideoSource(currentVideo: StreamingVideo) {
        if (currentVideo.videoName) {
            this.backgroundVideoPlayer.currentTime = currentVideo.time;

            this.backgroundVideoPlayer.playVideoByName(currentVideo.videoName);
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
