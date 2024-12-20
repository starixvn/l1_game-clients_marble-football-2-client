import inversify from "inversify";
import mobx from "mobx";
import { GamePhase } from "./game-phase-definitions";

const { injectable, inject } = inversify;

@injectable()
export class GamePhaseStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    enterPhase: GamePhase = null;
    exitPhase: GamePhase = null;
    beforeEnterPhase: GamePhase = null;

    setEnterPhase(phase: GamePhase) {
        setTimeout(() => {
            this.enterPhase = phase;
        }, 0);
    }

    setExitPhase(phase: GamePhase) {
        setTimeout(() => {
            this.exitPhase = phase;
        }, 0);
    }

    setBeforeEnterPhase(phase: GamePhase) {
        setTimeout(() => {
            this.beforeEnterPhase = phase;
        }, 0);
    }
}
