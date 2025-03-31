import inversify from "inversify";
import mobx from "mobx";
import gc from "@sg/game-client-base";
import { MarbleRoundTimeStore } from "./marble-round-time-store";

const { injectable, inject } = inversify;

export namespace MarbleRoundUIHandlers {
    @injectable()
    export class StartingRoundHandler implements gc.Shared.IHandler<void> {
        @inject(MarbleRoundTimeStore) private readonly roundTimeStore: MarbleRoundTimeStore;
        @inject(gc.Rounds.RoundStore) private readonly roundStore: gc.Rounds.RoundStore;
        @inject(gc.Settlements.SettlementStatusStore) private readonly settlementStatusStore: gc.Settlements.SettlementStatusStore;
        @inject(gc.Settlements.SettlementStore) private readonly settlementStore: gc.Settlements.SettlementStore;
        @inject(gc.Chips.ChipStore) private readonly chipStore: gc.Chips.ChipStore;

        constructor() {
            mobx.reaction(
                () => this.roundTimeStore.isStartingRound,
                (isStartRound) => isStartRound && this.handle()
            );

            mobx.when(
                () => !!this.roundTimeStore?.isStartingRound,
                () => {
                    this.handle();
                }
            );
        }

        handle() {
            this.resetForNewRound();
        }

        resetForNewRound() {
            this.chipStore.resetChips();
            this.roundStore.resetForNewRound();
            this.settlementStatusStore.resetSettlementStatus();
            this.settlementStore.resetSettlementStore();
        }
    }
}
