import mobx from "mobx";
import inversify from "inversify";
const { injectable, inject } = inversify;
import gc from "@sg/game-client-base";
import { MarbleRoundTimeStore, MARBLE_ROUND_STATE } from "./marble-round-time-store";

@injectable()
export class MarbleRoundStore {
    @inject(gc.RoundHistories.RoundHistoryStore) protected readonly roundHistoryStore: gc.RoundHistories.RoundHistoryStore;
    @inject(gc.Rounds.RoundTimeStore) protected readonly roundTimeStore: MarbleRoundTimeStore;
    @inject(gc.Settlements.SettlementStore) protected readonly settlementStore: gc.Settlements.SettlementStore;

    constructor() {
        mobx.makeAutoObservable(this, {
            _clientRoundId: false,
        });
    }

    roundId = 0;
    _clientRoundId = 0;

    get clientRoundId() {
        const currentFinish = this.settlementStore.currentFinish;
        if (!currentFinish || this.historyRoundId >= currentFinish.roundId) {
            return this.historyRoundId;
        }
        return currentFinish.roundId;
    }

    get historyRoundId() {
        let lastRoundId = 0;

        if (this.roundHistoryStore.histories.length > 0) {
            lastRoundId = this.roundHistoryStore.histories[0].roundId;
        }

        if (
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.STARTING_ROUND ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.PLACING_BET ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.LOCKING_BET ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.WAITING ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.HALF_TIME ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.INTRO_VIDEO ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.PLAYING_VIDEO
        ) {
            lastRoundId++;
        }

        // when clearing all active data in database and having data in archive collection
        if (this.roundHistoryStore.histories.length === 0 && this.roundId > 0) {
            lastRoundId = this.roundId;
        }

        if (this._clientRoundId < lastRoundId) {
            this._clientRoundId = lastRoundId;
        }

        return this._clientRoundId;
    }

    private shouldResetHighlight(isLocking: boolean): boolean {
        return (
            isLocking ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.STOP_GAME_LOOP ||
            this.roundTimeStore.roundState === MARBLE_ROUND_STATE.SHOW_ANIMATION_RESULT
        );
    }

    get isResetHighlightPrevMatch(): boolean {
        return this.shouldResetHighlight(this.roundTimeStore.isLockingPreMatch);
    }

    get isResetHighlightLive(): boolean {
        return this.shouldResetHighlight(this.roundTimeStore.isLockingLiveMatch);
    }
}
