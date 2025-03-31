import gc from "@sg/game-client-base";
import inversify from "inversify";
import { MarbleRoundTimeStore } from "./marble-round-time-store";
import { MarbleRoundRunningHandlers } from "./marble-round-running-handlers";

const { injectable, inject } = inversify;
const { DisabledGame, Shared } = gc;

@injectable()
export class MarbleRoundTimeHandlers implements gc.Shared.IMultipleHandlers {
    @inject(MarbleRoundTimeStore) protected readonly store: MarbleRoundTimeStore;
    @inject(MarbleRoundRunningHandlers) protected readonly roundRunningHandlers: MarbleRoundRunningHandlers;
    @inject(DisabledGame.DisabledGameStore) protected readonly disabledGameStore: gc.DisabledGame.DisabledGameStore;

    handleRemainingTime(remainingTime: number) {
        this.roundRunningHandlers.stopRunner();
        this.store.roundTime = remainingTime;
        if (!this.disabledGameStore.disabled) {
            this.roundRunningHandlers.startRunner();
        }
    }

    handleStartNewRoundStatus(snr: boolean) {
        this.store.startNewRound = snr;
    }

    handleStartPlacingBetStatus(spb: boolean) {
        this.store.startPlacingBet = spb;
    }

    handleEndPlacingBetStatus(epb: boolean) {
        this.store.endPlacingBet = epb;
    }

    handleEndRoundStatus(finish: gc.Shared.GameServiceMessage.Finish | undefined) {
        if (finish) {
            this.store.endRound = true;
            this.store.endPlacingBet = false;
            this.store.startPlacingBet = false;
            this.store.startNewRound = false;
        }
    }

    eventHandleList = [
        {
            name: Shared.GameServiceMessage.remainingTime,
            handle: this.handleRemainingTime,
        },
        {
            name: Shared.GameServiceMessage.snr,
            handle: this.handleStartNewRoundStatus,
        },
        {
            name: Shared.GameServiceMessage.spb,
            handle: this.handleStartPlacingBetStatus,
        },
        {
            name: Shared.GameServiceMessage.epb,
            handle: this.handleEndPlacingBetStatus,
        },
        {
            name: Shared.GameServiceMessage.Finish.eventName,
            handle: this.handleEndRoundStatus,
        },
    ];
}
