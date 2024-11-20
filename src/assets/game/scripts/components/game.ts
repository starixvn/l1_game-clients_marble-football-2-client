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
const { Rounds, Translator, RoundHistories, Settlements } = gc;

startGame(settings.name, containerOptions, siteConfigs);

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property(ChipFlying)
    chipFlying: ChipFlying = null;

    @property(BackgroundVideoPlayer)
    private backgroundVideoPlayer: BackgroundVideoPlayer = null;

    override onLoad(): void {
        this.backgroundVideoPlayer.videoSource = "https://minio.lumigame.com/sc-stream/final_a/football_marble_4-4_720p.m3u8";
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
