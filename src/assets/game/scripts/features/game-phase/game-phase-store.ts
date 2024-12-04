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

    setEnterPhase(phase: GamePhase) {
        this.enterPhase = phase;
    }

    setExitPhase(phase: GamePhase) {
        this.exitPhase = phase;
    }
}
