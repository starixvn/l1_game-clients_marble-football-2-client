import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import BetTimer from "db://shared-components/game/game-timer/scripts/bet-timer";
import Observer from "observer";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
import { GamePhase, PhaseId } from "../features/game-phase/game-phase-definitions";

const { ccclass } = _decorator;
const { handle, render } = Observer;
const COUNTDOWN_TIMER = "countdown-timer";

@ccclass("MarbleFootballBetTimer")
export default class MarbleFootballBetTimer extends BetTimer {
    private isPlaySound = false;
    setTime(time: number) {
        super.setTime(time);
        this.handleCountdownSound(time);
    }

    private handleCountdownSound(time: number) {
        if (!this.isPlaySound) {
            return;
        }

        const isCountdownTime = time <= 10 && time > 0 && time !== 3;
        if (isCountdownTime) {
            this.playSound();
        }
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    private playSound() {
        return COUNTDOWN_TIMER;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }

        if (phase.id === PhaseId.ShowBetChoicesPrev || phase.id === PhaseId.ShowBetChoicesLive) {
            this.isPlaySound = true;
            return;
        }

        this.isPlaySound = false;
    }
}
