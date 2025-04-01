import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import BetTimer from "db://shared-components/game/game-timer/scripts/bet-timer";
import Observer from "observer";

const { ccclass } = _decorator;
const { handle } = Observer;
const COUNTDOWN_TIMER = "countdown-timer";

@ccclass("MarbleFootballBetTimer")
export default class MarbleFootballBetTimer extends BetTimer {
    setTime(time: number) {
        super.setTime(time);
        if (time <= 10 && time > 0 && time !== 3) {
            this.playSound();
        }
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    private playSound() {
        return COUNTDOWN_TIMER;
    }
}
