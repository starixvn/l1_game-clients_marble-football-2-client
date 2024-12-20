import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import BetTimer from "db://shared-components/game/game-timer/scripts/bet-timer";
import Observer from "observer";
import { settings } from "../game-settings";

const { Rounds } = gc;
const { RoundTimeStore } = Rounds;
const { ccclass } = _decorator;
const { handle } = Observer;
const COUNTDOWN_TIMER = "countdown-timer";

@ccclass("MarbleFootballBetTimer")
export default class MarbleFootballBetTimer extends BetTimer {
    setTime(time: number) {
        const timeLeft = time - settings.durations.introVideo;
        super.setTime(timeLeft);
        if (timeLeft <= 10 && timeLeft > 0 && timeLeft !== 3) {
            this.playSound();
        }

        this.node.active = this.node.active && timeLeft > 0;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    private playSound() {
        return COUNTDOWN_TIMER;
    }
}
