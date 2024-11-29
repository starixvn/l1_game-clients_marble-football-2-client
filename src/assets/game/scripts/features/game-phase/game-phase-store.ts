import inversify from "inversify";
import mobx from "mobx";
import { GamePhase } from "./game-phase-definitions";

const { injectable, inject } = inversify;

@injectable()
export class GamePhaseStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    phase: GamePhase = null;

    setPhase(phase: GamePhase) {
        this.phase = phase;
    }
}
