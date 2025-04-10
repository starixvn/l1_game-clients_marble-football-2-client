import { _decorator } from "cc";
import gc from "@sg/game-client-base";
import Observer from "observer";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils";
import { GamePhase, GamePhaseConfig, PhaseId, TimePointHalftime } from "../features/game-phase/game-phase-definitions";
import { GamePhaseHandler } from "../features/game-phase/game-phase-handler";
import { GamePhaseStore } from "../features/game-phase/game-phase-store";
const { render, handle } = Observer;
const { ccclass, property } = _decorator;

const HAFT_TIME_SOUND_ID = "show-result";

@ccclass("HalfTime")
export class HalfTime extends ObserverComponent {
    onLoad() {
        this.node.active = false;
        super.onLoad();
        this.registerPhaseHalfTime();
    }

    @handle(GamePhaseHandler, (handler, config: GamePhaseConfig) => handler.registerPhase(config))
    registerPhaseHalfTime(): GamePhaseConfig {
        const config: GamePhaseConfig = {
            id: PhaseId.Halftime,
            begin: TimePointHalftime,
            end: TimePointHalftime - 3,
        };

        return config;
    }

    @render(GamePhaseStore, (store) => store.enterPhase)
    private renderEnterPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        if (phase.id === PhaseId.Halftime) {
            this.show(true);
            this.playSound();
        }
    }

    @handle(gc.Audios.AudioHandler, (handler) => handler.playSFX(HAFT_TIME_SOUND_ID))
    private playSound() {}

    @render(GamePhaseStore, (store) => store.exitPhase)
    private renderExitPhase(phase: GamePhase) {
        if (!phase) {
            return;
        }
        if (phase.id === PhaseId.Halftime) {
            this.show(false);
        }
    }

    show(show: boolean) {
        this.node.active = true;

        const duration = 0.3;
        if (show) {
            AnimationUtils.fadeIn(this.node, duration);
        } else {
            AnimationUtils.fadeOut(this.node, duration).then(() => {
                this.node.active = false;
            });
        }
    }
}
