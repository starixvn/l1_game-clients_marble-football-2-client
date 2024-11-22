import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import BetTimer from "db://shared-components/game/game-timer/scripts/bet-timer";
import Observer from "observer";
import { settings } from "../game-settings";
const { Rounds } = gc;
const { RoundTimeStore } = Rounds;
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass("MarbleFootballBetTimer")
export default class MarbleFootballBetTimer extends BetTimer {
    @render(RoundTimeStore, (store) => store.countdownTimer)
    setTime(time: number) {
        const timeLeft = time - settings.durations.streamingVideo;
        super.setTime(timeLeft);

        this.node.active = this.node.active && timeLeft > 0;
    }
}
