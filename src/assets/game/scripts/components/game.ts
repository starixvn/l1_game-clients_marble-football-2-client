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
import { MatchResult } from "./match-result";

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

    @property(Node)
    betResultNode: Node = null;

    @property(BackgroundVideoPlayer)
    private backgroundVideoPlayer: BackgroundVideoPlayer = null;

    override onHideGame() {
        this.backgroundVideoPlayer.stop();
    }

    onLoad() {
        super.onLoad();
        this.betResultNode.active = false;
    }

    @render(VideoStreamStore, (store) => store.currentVideo)
    renderVideoSource(currentVideo: StreamingVideo) {
        if (currentVideo.videoName) {
            this.backgroundVideoPlayer.currentTime = currentVideo.time;

            this.backgroundVideoPlayer.playVideoByName(currentVideo.videoName);
        }
    }

    private showWinningChoice(settlementResult: any) {
        const betResults = ["away", "draw", "home"];

        betResults.forEach((betResult) => {
            this.betResultNode.getChildByPath(`result/${betResult}`).active = settlementResult[betResult];
        });
    }

    async showResult(
        result: gc.GameServiceMessage.TResult,
        hasAnimation: boolean,
        settlementResult: gc.GameServiceMessage.TSettlementResult
    ) {
        try {
            const matchResult = this.betResultNode.getComponent(MatchResult);

            if (hasAnimation) {
                await AnimationUtils.delayTime(settings.durations.outro);
                this.betResultNode.active = true;
                await matchResult.show(hasAnimation);
            } else {
                this.betResultNode.active = true;
                matchResult.show(false);
            }
        } catch (e) {}
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
    }
}
