import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
import { GamePhaseConfig } from "./game-phase-definitions";
import { GamePhaseStore } from "./game-phase-store";

const { injectable, inject } = inversify;

@injectable()
export class GamePhaseHandler {
    @inject(gc.Rounds.RoundTimeStore) private readonly roundTimeStore: gc.Rounds.RoundTimeStore;
    @inject(GamePhaseStore) private readonly gamePhaseStore: GamePhaseStore;

    constructor() {
        mobx.makeAutoObservable(this);

        mobx.reaction(
            () => this.roundTimeStore.roundTime,
            (roundTime) => {
                this.updateWithRoundTime(roundTime);
            }
        );
    }

    private configs: GamePhaseConfig[] = [];

    private cache = {};

    registerPhase(config: GamePhaseConfig) {
        this.configs.push(config);
    }

    updateWithRoundTime(roundTime: number) {
        this.configs.forEach((config) => this.checkConfig(config, roundTime));
    }

    checkConfig(config: GamePhaseConfig, roundTime: number) {
        const visible = roundTime >= config.begin && roundTime <= config.end;

        const cache = this.cache[config.id];
        if (cache?.visible === visible) {
            return;
        }

        let progress = roundTime - config.begin;
        if (config.duration) {
            if (progress > config.duration) {
                progress = config.duration;
            }
        }

        const phase = {
            id: config.id,
            visible,
            progress,
        };

        this.cache[config.id] = phase;
        this.gamePhaseStore.setPhase(phase);
    }
}
